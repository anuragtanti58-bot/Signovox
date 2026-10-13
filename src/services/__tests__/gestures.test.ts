import { describe, it, expect } from 'vitest';
import { SIGN_GESTURES, getGestureById } from '../../data/gestures';

describe('SignoVox Gesture Dictionary & Constraints', () => {
  it('should have exactly 20 predefined gestures', () => {
    expect(SIGN_GESTURES).toHaveLength(20);
  });

  it('should enforce that EVERY recognized sentence is 5 words or fewer', () => {
    for (const gesture of SIGN_GESTURES) {
      const words = gesture.sentence.trim().split(/\s+/);
      expect(
        words.length,
        `Gesture ${gesture.id} ("${gesture.sentence}") exceeded 5 words limit! Actual: ${words.length}`
      ).toBeLessThanOrEqual(5);
      expect(gesture.wordCount).toBe(words.length);
    }
  });

  it('should have unique IDs and consecutive numeric IDs from 1 to 20', () => {
    const idSet = new Set<string>();
    const numSet = new Set<number>();

    for (const gesture of SIGN_GESTURES) {
      expect(idSet.has(gesture.id)).toBe(false);
      idSet.add(gesture.id);

      expect(numSet.has(gesture.numericId)).toBe(false);
      numSet.add(gesture.numericId);
      expect(gesture.numericId).toBeGreaterThanOrEqual(1);
      expect(gesture.numericId).toBeLessThanOrEqual(20);
    }

    expect(idSet.size).toBe(20);
    expect(numSet.size).toBe(20);
  });

  it('should resolve gestures by string ID, numeric string, and padded ID', () => {
    expect(getGestureById('G01')?.name).toBe('Open Palm Wave');
    expect(getGestureById('1')?.name).toBe('Open Palm Wave');
    expect(getGestureById('G1')?.name).toBe('Open Palm Wave');
    expect(getGestureById('G20')?.name).toBe('Two Thumbs Up Forward');
    expect(getGestureById('20')?.name).toBe('Two Thumbs Up Forward');
  });

  it('should return undefined for invalid gesture IDs', () => {
    expect(getGestureById('G99')).toBeUndefined();
    expect(getGestureById('INVALID')).toBeUndefined();
  });
});
