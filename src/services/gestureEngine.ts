import { getGestureById } from '../data/gestures';
import {
  GestureDataSource,
  RecognizedGestureEvent,
  TelemetryMetrics,
} from '../types';
import { SignoVoxProtocol } from './protocol';
import { audioSynthesizer } from './audioSynthesizer';

type GestureEventListener = (event: RecognizedGestureEvent) => void;
type TelemetryListener = (metrics: TelemetryMetrics) => void;
type RawStreamListener = (data: string, direction: 'IN' | 'OUT') => void;

export class GestureEngine {
  private protocol: SignoVoxProtocol;
  private listeners: Set<GestureEventListener> = new Set();
  private telemetryListeners: Set<TelemetryListener> = new Set();
  private rawStreamListeners: Set<RawStreamListener> = new Set();

  private history: RecognizedGestureEvent[] = [];
  private maxHistorySize: number = 200;

  private currentSequenceNumber: number = 100;
  private startTime: number = Date.now();

  private metrics: TelemetryMetrics = {
    totalPackets: 0,
    validGesturesCount: 0,
    duplicateCount: 0,
    lastSequenceNumber: 0,
    packetLossEstimated: 0,
    avgConfidence: 95,
    lastLatencyMs: 24,
    gloveBatteryMv: 3850,
    gloveBatteryPercent: 88,
    connectionUptimeSeconds: 0,
  };

  private confidenceHistory: number[] = [];

  constructor() {
    this.protocol = new SignoVoxProtocol();
  }

  /**
   * Feed raw text chunk (from Web Bluetooth GATT or simulated hardware generator)
   */
  public ingestRawChunk(chunk: string, source: GestureDataSource): void {
    this.notifyRawStream(chunk, 'IN');
    const packets = this.protocol.feedStream(chunk);

    for (const pkt of packets) {
      this.metrics.totalPackets++;

      if (!pkt.checksumValid && pkt.version === 'SV1') {
        console.warn(`[SignoVox Protocol] Checksum mismatch on packet: ${pkt.raw}`);
        continue;
      }

      const seqCheck = this.protocol.checkAndRecordSequence(pkt.sequenceNumber);
      if (seqCheck.isDuplicate) {
        this.metrics.duplicateCount++;
      }
      this.metrics.packetLossEstimated += seqCheck.droppedLossCount;
      this.metrics.lastSequenceNumber = pkt.sequenceNumber;

      const gestureDef = getGestureById(pkt.gestureId);
      if (!gestureDef) {
        console.warn(`[SignoVox] Unknown gesture ID: ${pkt.gestureId}`);
        continue;
      }

      if (pkt.batteryMv) {
        this.updateBatteryMetrics(pkt.batteryMv);
      }

      this.recordConfidence(pkt.confidence);

      const event: RecognizedGestureEvent = {
        id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        gestureId: gestureDef.id,
        numericId: gestureDef.numericId,
        name: gestureDef.name,
        sentence: gestureDef.sentence,
        timestamp: Date.now(),
        source,
        confidence: pkt.confidence,
        sequenceNumber: pkt.sequenceNumber,
        rawPacket: pkt.raw,
        isDuplicate: seqCheck.isDuplicate,
        batteryMv: pkt.batteryMv || this.metrics.gloveBatteryMv,
        latencyMs: Math.floor(Math.random() * 15) + 18,
      };

      if (!seqCheck.isDuplicate) {
        this.metrics.validGesturesCount++;
        // Play web speech preview if enabled
        audioSynthesizer.speak(gestureDef.sentence);
        audioSynthesizer.playAcknowledgeChime();
      }

      this.addHistoryEvent(event);
      this.notifyListeners(event);
      this.notifyTelemetry();
    }
  }

  /**
   * Trigger simulated gesture directly from UI controls
   */
  public triggerSimulatedGesture(
    gestureId: string,
    customConfidence: number = 96,
    customBatteryMv: number = 3850
  ): RecognizedGestureEvent | null {
    const gestureDef = getGestureById(gestureId);
    if (!gestureDef) return null;

    this.currentSequenceNumber++;
    if (this.currentSequenceNumber > 65535) {
      this.currentSequenceNumber = 1;
    }

    const rawPacket = SignoVoxProtocol.formatPacket(
      this.currentSequenceNumber,
      gestureDef.id,
      customConfidence,
      customBatteryMv
    );

    this.ingestRawChunk(rawPacket, 'SIMULATED');

    return this.history[0] || null;
  }

  /**
   * Ingest custom user packet string for testing/debugging
   */
  public injectPacket(packetString: string, source: GestureDataSource = 'SIMULATED'): void {
    const normalized = packetString.endsWith('\n') ? packetString : `${packetString}\n`;
    this.ingestRawChunk(normalized, source);
  }

  private addHistoryEvent(event: RecognizedGestureEvent): void {
    this.history.unshift(event);
    if (this.history.length > this.maxHistorySize) {
      this.history.pop();
    }
  }

  private updateBatteryMetrics(mv: number): void {
    this.metrics.gloveBatteryMv = mv;
    // Li-ion 3.3V (0%) to 4.2V (100%)
    const pct = Math.max(0, Math.min(100, Math.round(((mv - 3300) / (4200 - 3300)) * 100)));
    this.metrics.gloveBatteryPercent = pct;
  }

  private recordConfidence(conf: number): void {
    this.confidenceHistory.push(conf);
    if (this.confidenceHistory.length > 30) {
      this.confidenceHistory.shift();
    }
    const sum = this.confidenceHistory.reduce((a, b) => a + b, 0);
    this.metrics.avgConfidence = Math.round(sum / this.confidenceHistory.length);
  }

  public getHistory(): RecognizedGestureEvent[] {
    return [...this.history];
  }

  public clearHistory(): void {
    this.history = [];
    this.notifyTelemetry();
  }

  public getMetrics(): TelemetryMetrics {
    this.metrics.connectionUptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    return { ...this.metrics };
  }

  public resetMetrics(): void {
    this.startTime = Date.now();
    this.protocol.resetSequenceTracker();
    this.metrics = {
      totalPackets: 0,
      validGesturesCount: 0,
      duplicateCount: 0,
      lastSequenceNumber: 0,
      packetLossEstimated: 0,
      avgConfidence: 95,
      lastLatencyMs: 22,
      gloveBatteryMv: 3850,
      gloveBatteryPercent: 88,
      connectionUptimeSeconds: 0,
    };
    this.confidenceHistory = [];
    this.notifyTelemetry();
  }

  // Subscription management
  public subscribe(listener: GestureEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public subscribeTelemetry(listener: TelemetryListener): () => void {
    this.telemetryListeners.add(listener);
    listener(this.getMetrics());
    return () => this.telemetryListeners.delete(listener);
  }

  public subscribeRawStream(listener: RawStreamListener): () => void {
    this.rawStreamListeners.add(listener);
    return () => this.rawStreamListeners.delete(listener);
  }

  private notifyListeners(event: RecognizedGestureEvent): void {
    this.listeners.forEach((fn) => {
      try {
        fn(event);
      } catch (err) {
        console.error('Error in gesture listener:', err);
      }
    });
  }

  private notifyTelemetry(): void {
    const m = this.getMetrics();
    this.telemetryListeners.forEach((fn) => {
      try {
        fn(m);
      } catch (err) {
        console.error('Error in telemetry listener:', err);
      }
    });
  }

  private notifyRawStream(data: string, direction: 'IN' | 'OUT'): void {
    this.rawStreamListeners.forEach((fn) => {
      try {
        fn(data, direction);
      } catch (err) {
        console.error('Error in raw stream listener:', err);
      }
    });
  }
}

export const sharedGestureEngine = new GestureEngine();
