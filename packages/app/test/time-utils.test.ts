import { describe, expect, it } from 'bun:test';
import {
  calculateDefaultStartTime,
  calculateFinishTime,
  formatDuration,
  getCurrentTimeString,
  getTodayDateString,
  parseDuration,
  roundTimeToIncrement,
} from '../src/time-utils.js';

describe('time-utils', () => {
  it('parses valid duration strings and numbers into decimal hours', () => {
    expect(parseDuration('15m')).toBe(0.25);
    expect(parseDuration('30m')).toBe(0.5);
    expect(parseDuration('45m')).toBe(0.75);
    expect(parseDuration('1h')).toBe(1);
    expect(parseDuration('1.5h')).toBe(1.5);
    expect(parseDuration('90m')).toBe(1.5);
    expect(parseDuration('2.25')).toBe(2.25);
    expect(parseDuration('2')).toBe(2);
    expect(parseDuration(1.75)).toBe(1.75);
  });

  it('falls back to 1 hour when duration input is empty or non-numeric', () => {
    expect(parseDuration(undefined)).toBe(1);
    expect(parseDuration('')).toBe(1);
    expect(parseDuration('invalid')).toBe(1);
    expect(parseDuration('invalidm')).toBe(1);
    expect(parseDuration('invalidh')).toBe(1);
  });

  it('formats decimal hours into human-readable duration strings', () => {
    expect(formatDuration(0)).toBe('0m');
    expect(formatDuration(0.25)).toBe('15m');
    expect(formatDuration(0.5)).toBe('30m');
    expect(formatDuration(1)).toBe('1h');
    expect(formatDuration(1.5)).toBe('1h 30m');
    expect(formatDuration(2.25)).toBe('2h 15m');
  });

  it('rounds time strings according to increment, direction, and single-digit normalization', () => {
    expect(roundTimeToIncrement('12:07')).toBe('12:00');
    expect(roundTimeToIncrement('9:5', { direction: 'nearest', increment: 15 })).toBe('09:00');
    expect(roundTimeToIncrement('12:08', { direction: 'nearest', increment: 15 })).toBe('12:15');
    expect(roundTimeToIncrement('12:14', { direction: 'down', increment: 15 })).toBe('12:00');
    expect(roundTimeToIncrement('12:01', { direction: 'up', increment: 15 })).toBe('12:15');
  });

  it('calculates default start time by subtracting duration and rounding', () => {
    expect(calculateDefaultStartTime('14:05', 1, { direction: 'nearest', increment: 15 })).toBe(
      '13:00',
    );
    expect(calculateDefaultStartTime('10:20', 0.25, { direction: 'nearest', increment: 15 })).toBe(
      '10:00',
    );
    expect(calculateDefaultStartTime('10:25', 0.25, { direction: 'up', increment: 15 })).toBe(
      '10:15',
    );
  });

  it('computes finish time from start time and duration across midnight boundaries', () => {
    expect(calculateFinishTime('13:00', 1.5)).toBe('14:30');
    expect(calculateFinishTime('09:15', 0.25)).toBe('09:30');
    expect(calculateFinishTime('23:30', 1)).toBe('00:30');
  });

  it('formats current time and date strings from system clock or explicit Date instance', () => {
    const sampleDate = new Date(2026, 9, 3, 14, 5, 0);

    expect(getCurrentTimeString(sampleDate)).toBe('14:05');
    expect(getCurrentTimeString()).toMatch(/^\d{2}:\d{2}$/);
    expect(getTodayDateString(sampleDate)).toBe('2026-10-03');
    expect(getTodayDateString()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
