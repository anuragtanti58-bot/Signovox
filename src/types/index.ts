export type GestureCategory = 'Essential' | 'Assistance' | 'Social' | 'Emergency' | 'Daily';

export interface FingerSensorState {
  thumb: number;   // 0 (straight) to 100 (fully bent)
  index: number;
  middle: number;
  ring: number;
  pinky: number;
  pitch: number;   // -90 to +90 deg tilt
  roll: number;    // -180 to +180 deg tilt
  yaw: number;     // 0 to 360 deg orientation
}

export interface GestureDefinition {
  id: string;              // e.g. "G01", "G02", ... "G20"
  numericId: number;       // 1 to 20
  name: string;            // Human-readable gesture title
  sentence: string;        // English sentence <= 5 words
  wordCount: number;       // Verified <= 5
  category: GestureCategory;
  iconName: string;        // Lucide icon descriptor
  shortDescription: string;// How to form the gesture
  targetSensors: FingerSensorState;
}

export type GestureDataSource = 'SIMULATED' | 'LIVE_BLE';

export interface RecognizedGestureEvent {
  id: string;               // Unique event UUID
  gestureId: string;        // e.g. "G01"
  numericId: number;
  name: string;
  sentence: string;
  timestamp: number;
  source: GestureDataSource;
  confidence: number;       // 0 - 100%
  sequenceNumber: number;
  rawPacket: string;
  isDuplicate: boolean;
  batteryMv?: number;
  rssi?: number;
  latencyMs?: number;
}

export type BleConnectionStatus =
  | 'disconnected'
  | 'requesting'
  | 'connecting'
  | 'connected'
  | 'disconnecting'
  | 'error';

export interface BleConfig {
  serviceUuid: string;
  characteristicUuid: string;
  deviceNamePrefix: string;
  autoReconnect: boolean;
  baudRateInfo: string;
}

export interface TelemetryMetrics {
  totalPackets: number;
  validGesturesCount: number;
  duplicateCount: number;
  lastSequenceNumber: number;
  packetLossEstimated: number;
  avgConfidence: number;
  lastLatencyMs: number;
  gloveBatteryMv: number;
  gloveBatteryPercent: number;
  connectionUptimeSeconds: number;
}

export interface ProtocolPacket {
  version: string;
  sequenceNumber: number;
  gestureId: string;
  numericId: number;
  confidence: number;
  batteryMv?: number;
  checksumValid: boolean;
  raw: string;
}
