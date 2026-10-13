import { describe, it, expect, beforeEach } from 'vitest';
import { GestureEngine } from '../gestureEngine';
import { SignoVoxProtocol } from '../protocol';

describe('SignoVox Shared GestureEngine', () => {
  let engine: GestureEngine;

  beforeEach(() => {
    engine = new GestureEngine();
    engine.resetMetrics();
    engine.clearHistory();
  });

  it('should ingest and recognize valid simulated gestures', () => {
    const event = engine.triggerSimulatedGesture('G03', 98, 3850);
    expect(event).not.toBeNull();
    expect(event?.gestureId).toBe('G03');
    expect(event?.sentence).toBe('Thank you very much.');
    expect(event?.confidence).toBe(98);
    expect(event?.source).toBe('SIMULATED');
    expect(event?.isDuplicate).toBe(false);

    const metrics = engine.getMetrics();
    expect(metrics.validGesturesCount).toBe(1);
    expect(metrics.totalPackets).toBe(1);
  });

  it('should maintain a history queue and support clearing', () => {
    engine.triggerSimulatedGesture('G01');
    engine.triggerSimulatedGesture('G02');
    engine.triggerSimulatedGesture('G03');

    const history = engine.getHistory();
    expect(history).toHaveLength(3);
    expect(history[0].gestureId).toBe('G03'); // Most recent first

    engine.clearHistory();
    expect(engine.getHistory()).toHaveLength(0);
  });

  it('should notify subscribed listeners when events are processed', () => {
    let capturedEvent: unknown = null;
    const unsub = engine.subscribe((event) => {
      capturedEvent = event;
    });

    engine.triggerSimulatedGesture('G04');
    expect(capturedEvent).not.toBeNull();
    expect((capturedEvent as { gestureId: string }).gestureId).toBe('G04');

    unsub();
  });

  it('should flag and drop duplicate retransmitted packets in telemetry', () => {
    // Inject properly formatted packet with sequence #500
    const rawPacket = SignoVoxProtocol.formatPacket(500, 'G05', 95, 3800);
    engine.injectPacket(rawPacket);

    let metrics = engine.getMetrics();
    expect(metrics.validGesturesCount).toBe(1);
    expect(metrics.duplicateCount).toBe(0);

    // Re-inject identical sequence #500 packet (BLE retransmission)
    engine.injectPacket(rawPacket);

    metrics = engine.getMetrics();
    expect(metrics.validGesturesCount).toBe(1); // Did not increment valid count
    expect(metrics.duplicateCount).toBe(1); // Duplicate flagged
  });
});

