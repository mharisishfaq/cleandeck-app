import { formatBytes, formatDuration, formatTimestamp } from '../utils/mediaUtils';

describe('mediaUtils', () => {
  describe('formatBytes()', () => {
    it('returns "0 B" for 0, negative, and invalid inputs', () => {
      expect(formatBytes(0)).toBe('0 B');
      expect(formatBytes(-100)).toBe('0 B');
      expect(formatBytes(NaN)).toBe('0 B');
      expect(formatBytes(undefined as any)).toBe('0 B');
      expect(formatBytes(null as any)).toBe('0 B');
    });

    it('formats values under 1 KB as exact bytes ("B")', () => {
      expect(formatBytes(1)).toBe('1 B');
      expect(formatBytes(500)).toBe('500 B');
      expect(formatBytes(1023)).toBe('1023 B');
    });

    it('formats Kilobyte values correctly', () => {
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1024 * 50)).toBe('50 KB');
      expect(formatBytes(1024 * 850)).toBe('850 KB');
    });

    it('formats Megabyte values with 1 decimal precision under 10 MB', () => {
      expect(formatBytes(1024 * 1024)).toBe('1.0 MB');
      expect(formatBytes(1.5 * 1024 * 1024)).toBe('1.5 MB');
      expect(formatBytes(4.25 * 1024 * 1024)).toBe('4.3 MB');
      expect(formatBytes(9.9 * 1024 * 1024)).toBe('9.9 MB');
    });

    it('formats Megabyte values rounded to whole numbers for 10 MB and above', () => {
      expect(formatBytes(10 * 1024 * 1024)).toBe('10 MB');
      expect(formatBytes(420 * 1024 * 1024)).toBe('420 MB');
      expect(formatBytes(999 * 1024 * 1024)).toBe('999 MB');
    });

    it('formats Gigabyte values with 1 decimal precision', () => {
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1.0 GB');
      expect(formatBytes(1.4 * 1024 * 1024 * 1024)).toBe('1.4 GB');
      expect(formatBytes(25.6 * 1024 * 1024 * 1024)).toBe('25.6 GB');
    });
  });

  describe('formatDuration()', () => {
    it('handles 0 or negative seconds', () => {
      expect(formatDuration(0)).toBe('0:00');
      expect(formatDuration(-10)).toBe('0:00');
    });

    it('formats minutes and seconds (MM:SS)', () => {
      expect(formatDuration(45)).toBe('0:45');
      expect(formatDuration(65)).toBe('1:05');
      expect(formatDuration(135)).toBe('2:15');
    });

    it('formats hours (HH:MM:SS)', () => {
      expect(formatDuration(3665)).toBe('1:01:05');
    });
  });

  describe('formatTimestamp()', () => {
    it('returns a valid formatted date string', () => {
      const formatted = formatTimestamp(1700000000);
      expect(typeof formatted).toBe('string');
      expect(formatted).not.toBe('Unknown date');
    });
  });
});
