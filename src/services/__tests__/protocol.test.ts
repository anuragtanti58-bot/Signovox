import { describe, it, expect, beforeEach } from 'vitest';
import { SignoVoxProtocol } from '../protocol';

describe('SignoVox Protocol Parser & Stream Decoder', () => {
  let protocol: SignoVoxProtocol;

  beforeEach(() => {
    protocol = new SignoVoxProtocol();
  });

  it('should compute valid 8-bit XOR checksums', () => {
    const payload = 'SV1,105,G02,96,3840';
    const checksum = SignoVoxProtocol.computeChecksum(payload);
    expect(checksum).toHaveLength(2);
    expect(typeof checksum).toBe('string');
  });

  it('should format standard $SV1 packet correctly', () => {
    const packetStr = SignoVoxProtocol.formatPacket(105, 'G02', 96, 3840);
    expect(packetStr.startsWith('$SV1,105,G02,96,3840*')).toBe(true);
    expect(packetStr.endsWith('\n')).toBe(true);
  });

  it('should parse standard $SV1 packet correctly and validate valid checksum', () => {
    const formatted = SignoVoxProtocol.formatPacket(105, 'G02', 96, 3840);
    const parsed = protocol.parseLine(formatted.trim());

    expect(parsed).not.toBeNull();
    expect(parsed?.version).toBe('SV1');
    expect(parsed?.sequenceNumber).toBe(105);
    expect(parsed?.gestureId).toBe('G02');
    expect(parsed?.numericId).toBe(2);
    expect(parsed?.confidence).toBe(96);
    expect(parsed?.batteryMv).toBe(3840);
    expect(parsed?.checksumValid).toBe(true);
  });

  it('should detect corrupted checksums in standard $SV1 packets', () => {
    const corruptedLine = '$SV1,105,G02,96,3840*00';
    const parsed = protocol.parseLine(corruptedLine);

    expect(parsed).not.toBeNull();
    expect(parsed?.checksumValid).toBe(false);
  });

  it('should parse compact format packets (e.g. G:06#112)', () => {
    const compactLine = 'G:06#112';
    const parsed = protocol.parseLine(compactLine);

    expect(parsed).not.toBeNull();
    expect(parsed?.version).toBe('COMPACT');
    expect(parsed?.gestureId).toBe('G06');
    expect(parsed?.numericId).toBe(6);
    expect(parsed?.sequenceNumber).toBe(112);
  });

  it('should parse raw gesture ID lines (e.g. G15 or 15)', () => {
    const parsed1 = protocol.parseLine('G15');
    expect(parsed1?.gestureId).toBe('G15');
    expect(parsed1?.numericId).toBe(15);

    const parsed2 = protocol.parseLine('7');
    expect(parsed2?.gestureId).toBe('G07');
    expect(parsed2?.numericId).toBe(7);
  });

  it('should reassemble chunked BLE stream notifications across buffer boundaries', () => {
    // Simulate packet split across three 10-byte BLE notification chunks:
    // Full line: "$SV1,100,G01,95,3800*4F\n"
    const fullPacket = SignoVoxProtocol.formatPacket(100, 'G01', 95, 3800);
    const chunk1 = fullPacket.substring(0, 8);
    const chunk2 = fullPacket.substring(8, 16);
    const chunk3 = fullPacket.substring(16);

    const packets1 = protocol.feedStream(chunk1);
    expect(packets1).toHaveLength(0); // Incomplete

    const packets2 = protocol.feedStream(chunk2);
    expect(packets2).toHaveLength(0); // Still incomplete

    const packets3 = protocol.feedStream(chunk3);
    expect(packets3).toHaveLength(1); // Complete line arrived
    expect(packets3[0].sequenceNumber).toBe(100);
    expect(packets3[0].gestureId).toBe('G01');
    expect(packets3[0].checksumValid).toBe(true);
  });

  it('should detect duplicate sequence numbers and calculate estimated packet loss', () => {
    protocol.resetSequenceTracker();

    // First sequence #10
    const res1 = protocol.checkAndRecordSequence(10);
    expect(res1.isDuplicate).toBe(false);
    expect(res1.droppedLossCount).toBe(0);

    // Duplicate sequence #10 arrived again
    const res2 = protocol.checkAndRecordSequence(10);
    expect(res2.isDuplicate).toBe(true);

    // Advanced sequence #13 (dropped 11, 12 => 2 loss)
    const res3 = protocol.checkAndRecordSequence(13);
    expect(res3.isDuplicate).toBe(false);
    expect(res3.droppedLossCount).toBe(2);
  });
});
