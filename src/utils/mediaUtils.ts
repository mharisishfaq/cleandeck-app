/**
 * Media calculation and formatting utilities.
 */

/**
 * Formats bytes into a human-readable string (e.g. 0 B, 850 KB, 420 MB, 1.4 GB).
 */
export function formatBytes(bytes: number): string {
  if (typeof bytes !== 'number' || isNaN(bytes) || bytes <= 0) {
    return '0 B';
  }

  const KB = 1024;
  const MB = 1024 * 1024;
  const GB = 1024 * 1024 * 1024;

  if (bytes < KB) {
    return `${Math.round(bytes)} B`;
  }
  if (bytes < MB) {
    return `${Math.round(bytes / KB)} KB`;
  }
  if (bytes < GB) {
    const val = bytes / MB;
    return `${val < 10 ? val.toFixed(1) : Math.round(val)} MB`;
  }
  return `${(bytes / GB).toFixed(1)} GB`;
}

/**
 * Formats duration in seconds to MM:SS or HH:MM:SS.
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0:00';
  const totalSeconds = Math.round(seconds);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const paddedSecs = secs < 10 ? `0${secs}` : `${secs}`;
  if (hrs > 0) {
    const paddedMins = mins < 10 ? `0${mins}` : `${mins}`;
    return `${hrs}:${paddedMins}:${paddedSecs}`;
  }
  return `${mins}:${paddedSecs}`;
}

/**
 * Formats a UNIX timestamp or millisecond timestamp into a readable date string.
 */
export function formatTimestamp(timestamp: number): string {
  const millis = timestamp > 100000000000 ? timestamp : timestamp * 1000;
  const date = new Date(millis);
  if (isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
