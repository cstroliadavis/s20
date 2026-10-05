import { describe, expect, it } from 'bun:test';
import {
  calculateDefaultStartTime,
  calculateFinishTime,
  formatDuration,
  parseDuration,
  roundTimeToIncrement,
} from '../src/time-utils.js';

describe('time-utils', () => {
  it('parses duration strings into decimal hours', () => {
    expect(parseDuration('15m')).toBe(0.25);
    expect(parseDuration('30m')).toBe(0.5);
    expect(parseDuration('45m')).toBe(0.75);
    expect(parseDuration('1h')).toBe(1);
    expect(parseDuration('1.5h')).toBe(1.5);
    expect(parseDuration('90m')).toBe(1.5);
    expect(parseDuration('2.25')).toBe(2.25);
    expect(parseDuration('2')).toBe(2);
    expect(parseDuration(undefined)).toBe(1);
  });

  it('formats duration hours into human-readable string', () => {
    expect(formatDuration(0.25)).toBe('15m');
    expect(formatDuration(0.5)).toBe('30m');
    expect(formatDuration(1)).toBe('1h');
    expect(formatDuration(1.5)).toBe('1h 30m');
    expect(formatDuration(2.25)).toBe('2h 15m');
  });

  it('rounds time string according to increment and direction', () => {
    // Nearest 15m
    expect(roundTimeToIncrement('12:07', { direction: 'nearest', increment: 15 })).toBe('12:00');
    expect(roundTimeToIncrement('12:08', { direction: 'nearest', increment: 15 })).toBe('12:15');

    // Down 15m
    expect(roundTimeToIncrement('12:14', { direction: 'down', increment: 15 })).toBe('12:00');

    // Up 15m
    expect(roundTimeToIncrement('12:01', { direction: 'up', increment: 15 })).toBe('12:15');
  });

  it('calculates default start time by subtracting duration and rounding', () => {
    // 14:05 minus 1h = 13:05 -> nearest 15m = 13:00
    expect(calculateDefaultStartTime('14:05', 1, { direction: 'nearest', increment: 15 })).toBe(
      '13:00',
    );

    // 10:20 minus 15m (0.25h) = 10:05 -> nearest 15m = 10:00
    expect(calculateDefaultStartTime('10:20', 0.25, { direction: 'nearest', increment: 15 })).toBe(
      '10:00',
    );

    // 10:25 minus 15m (0.25h) = 10:10 -> up 15m = 10:15
    expect(calculateDefaultStartTime('10:25', 0.25, { direction: 'up', increment: 15 })).toBe(
      '10:15',
    );
  });

  it('computes finish time from start time and duration', () => {
    expect(calculateFinishTime('13:00', 1.5)).toBe('14:30');
    expect(calculateFinishTime('09:15', 0.25)).toBe('09:30');
    expect(calculateFinishTime('23:30', 1)).toBe('00:30');
  });
});
