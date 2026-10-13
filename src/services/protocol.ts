import { ProtocolPacket } from '../types';

/**
 * SignoVox Communication Protocol v1.0 (SV1.0)
 * 
 * Framing Specifications for HM-10 BLE Serial UART:
 * 
 * 1. Standard Telemetry Packet:
 *    `$SV1,<seq>,<gesture_id>,<confidence>,<battery_mv>*<HEX_CHECKSUM>\n`
 *    Example: `$SV1,105,G02,96,3840*4A\n`
 * 
 * 2. Compact Packet (Low Latency):
 *    `G:<gesture_id>#<seq>\n`
 *    Example: `G:G02#105\n`
 * 
 * 3. Fallback Raw ID:
 *    `<gesture_id>\n`
 *    Example: `G02\n` or `2\n`
 */
export class SignoVoxProtocol {
  private streamBuffer: string = '';
  private recentSequenceNumbers: Set<number> = new Set();
  private maxSequenceHistory: number = 128;
  private lastReceivedSequence: number = 0;

  /**
   * Computes an 8-bit XOR checksum formatted as a 2-character uppercase hex string.
   */
  public static computeChecksum(payload: string): string {
    let xor = 0;
    for (let i = 0; i < payload.length; i++) {
      xor ^= payload.charCodeAt(i);
    }
    return xor.toString(16).toUpperCase().padStart(2, '0');
  }

  /**
   * Builds a valid SignoVox v1.0 standard packet string.
   */
  public static formatPacket(
    sequenceNumber: number,
    gestureId: string,
    confidence: number = 95,
    batteryMv: number = 3800
  ): string {
    const payload = `SV1,${sequenceNumber},${gestureId},${Math.round(confidence)},${batteryMv}`;
    const checksum = this.computeChecksum(payload);
    return `$${payload}*${checksum}\n`;
  }

  /**
   * Feed raw incoming chunk (from Web Bluetooth GATT notification or simulated pipe)
   * Handles MTU packet chunking and buffer reassembly across newline delimiters.
   */
  public feedStream(chunk: string): ProtocolPacket[] {
    this.streamBuffer += chunk;
    const packets: ProtocolPacket[] = [];

    // Split on newline boundaries
    const lines = this.streamBuffer.split(/\r?\n/);

    // If stream ended with newline, last element is empty string; otherwise it is an incomplete chunk.
    this.streamBuffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const parsed = this.parseLine(trimmed);
      if (parsed) {
        packets.push(parsed);
      }
    }

    return packets;
  }

  /**
   * Resets stream buffer state.
   */
  public clearBuffer(): void {
    this.streamBuffer = '';
  }

  /**
   * Parse a single framed line into a ProtocolPacket structure.
   */
  public parseLine(line: string): ProtocolPacket | null {
    const trimmed = line.trim();
    if (!trimmed) return null;

    // 1. Full SignoVox SV1 format: $SV1,seq,gid,conf,bat*CS
    if (trimmed.startsWith('$')) {
      return this.parseStandardPacket(trimmed);
    }

    // 2. Compact format: G:02#104 or G:G02#104
    if (trimmed.startsWith('G:') || trimmed.startsWith('g:')) {
      return this.parseCompactPacket(trimmed);
    }

    // 3. Simple Raw ID fallback: e.g. "G01", "G12", "5"
    return this.parseRawPacket(trimmed);
  }

  private parseStandardPacket(line: string): ProtocolPacket | null {
    // Format: $SV1,seq,gid,conf,bat*CS
    const asteriskIndex = line.lastIndexOf('*');
    let checksumValid = true;
    let payload = '';

    if (asteriskIndex !== -1) {
      payload = line.substring(1, asteriskIndex);
      const expectedChecksum = line.substring(asteriskIndex + 1).trim().toUpperCase();
      const actualChecksum = SignoVoxProtocol.computeChecksum(payload);
      checksumValid = expectedChecksum === actualChecksum;
    } else {
      payload = line.substring(1);
      checksumValid = false; // Missing checksum marker
    }

    const parts = payload.split(',');
    if (parts.length < 3) {
      return null;
    }

    const version = parts[0];
    const seq = parseInt(parts[1], 10) || 0;
    const rawGid = parts[2].trim().toUpperCase();
    const gid = rawGid.startsWith('G') ? rawGid : `G${rawGid.padStart(2, '0')}`;
    const numericId = parseInt(gid.replace(/\D/g, ''), 10) || 0;
    const confidence = parts.length > 3 ? Math.min(100, Math.max(0, parseInt(parts[3], 10) || 90)) : 90;
    const batteryMv = parts.length > 4 ? parseInt(parts[4], 10) || 3700 : 3700;

    return {
      version,
      sequenceNumber: seq,
      gestureId: gid,
      numericId,
      confidence,
      batteryMv,
      checksumValid,
      raw: line,
    };
  }

  private parseCompactPacket(line: string): ProtocolPacket | null {
    // Format: G:02#104
    const content = line.substring(2);
    const hashIndex = content.indexOf('#');
    let rawGid = content;
    let seq = 0;

    if (hashIndex !== -1) {
      rawGid = content.substring(0, hashIndex).trim();
      seq = parseInt(content.substring(hashIndex + 1), 10) || 0;
    }

    const cleanGid = rawGid.toUpperCase().startsWith('G')
      ? rawGid.toUpperCase()
      : `G${rawGid.padStart(2, '0')}`;
    const numericId = parseInt(cleanGid.replace(/\D/g, ''), 10) || 0;

    return {
      version: 'COMPACT',
      sequenceNumber: seq,
      gestureId: cleanGid,
      numericId,
      confidence: 92,
      batteryMv: 3800,
      checksumValid: true,
      raw: line,
    };
  }

  private parseRawPacket(line: string): ProtocolPacket | null {
    // Matches G01..G20 or 1..20
    const match = line.match(/^(?:G)?([0-9]{1,2})$/i);
    if (!match) return null;

    const num = parseInt(match[1], 10);
    if (num < 1 || num > 20) return null;

    const gid = `G${num.toString().padStart(2, '0')}`;

    return {
      version: 'RAW',
      sequenceNumber: 0,
      gestureId: gid,
      numericId: num,
      confidence: 90,
      batteryMv: 3800,
      checksumValid: true,
      raw: line,
    };
  }

  /**
   * Sequence Number Deduplication Tracker
   * Returns true if sequence number is considered a duplicate.
   */
  public checkAndRecordSequence(seq: number): { isDuplicate: boolean; droppedLossCount: number } {
    if (seq === 0) {
      // Seq 0 is unsequenced/raw mode
      return { isDuplicate: false, droppedLossCount: 0 };
    }

    if (this.recentSequenceNumbers.has(seq)) {
      return { isDuplicate: true, droppedLossCount: 0 };
    }

    let droppedLossCount = 0;
    if (this.lastReceivedSequence > 0 && seq > this.lastReceivedSequence + 1) {
      droppedLossCount = seq - (this.lastReceivedSequence + 1);
    }

    this.lastReceivedSequence = seq;
    this.recentSequenceNumbers.add(seq);

    // Keep sliding window size bounded
    if (this.recentSequenceNumbers.size > this.maxSequenceHistory) {
      const firstVal = this.recentSequenceNumbers.values().next().value;
      if (firstVal !== undefined) {
        this.recentSequenceNumbers.delete(firstVal);
      }
    }

    return { isDuplicate: false, droppedLossCount };
  }

  public resetSequenceTracker(): void {
    this.recentSequenceNumbers.clear();
    this.lastReceivedSequence = 0;
  }
}
