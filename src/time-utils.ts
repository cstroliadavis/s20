/**
 * @file S20 time parsing, formatting, and rounding utilities.
 *
 * Implements algorithms for parsing duration strings (e.g. '15m', '1.5h', '90m'),
 * calculating default start times, computing finish times, and rounding to minute increments.
 */
import type { RoundingDirection } from './config.js';

/**
 * Options for customizing time rounding behavior.
 */
export interface TimeRoundingOptions {
  /**
   * Rounding direction: 'nearest', 'up', or 'down'. Defaults to 'nearest'.
   */
  direction?: RoundingDirection;

  /**
   * Minute increment step (e.g. 15 for 15-minute rounding). Defaults to 15.
   */
  increment?: number;
}

/**
 * Composes hours and minutes components into human-readable duration string.
 */
function composeDurationString(hours: number, minutes: number): string {
  if (hours > 0) return composeFullDuration(hours, minutes);

  return `${minutes}m`;
}

/**
 * Composes duration string when hour component is positive.
 */
function composeFullDuration(hours: number, minutes: number): string {
  if (minutes > 0) return `${hours}h ${minutes}m`;

  return `${hours}h`;
}

/**
 * Formats minute count into 24-hour HH:MM string with wraparound.
 */
function formatMinutesToTime(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Extracts rounding direction from options with default fallback.
 */
function getRoundingDirection(options?: TimeRoundingOptions): RoundingDirection {
  return options?.direction ?? 'nearest';
}

/**
 * Extracts rounding increment from options with default fallback.
 */
function getRoundingIncrement(options?: TimeRoundingOptions): number {
  return options?.increment ?? 15;
}

/**
 * Parses hour-denominated duration strings (e.g. '1.5h').
 */
function parseHourString(val: string): number {
  const num = Number(val.replace(/h$/i, '').trim());

  if (isNaN(num)) return 1;

  return num;
}

/**
 * Parses minute-denominated duration strings (e.g. '15m').
 */
function parseMinuteString(val: string): number {
  const num = Number(val.replace(/m$/i, '').trim());

  if (isNaN(num)) return 1;

  return num / 60;
}

/**
 * Parses plain numeric duration strings into hours.
 */
function parseNumericDuration(val: string): number {
  const num = Number(val);

  if (isNaN(num)) return 1;

  return num;
}

/**
 * Dispatches duration string parsing based on unit suffix.
 */
function parseRawDuration(val: string): number {
  const trimmed = val.trim().toLowerCase();

  if (trimmed.endsWith('m')) return parseMinuteString(trimmed);
  if (trimmed.endsWith('h')) return parseHourString(trimmed);

  return parseNumericDuration(trimmed);
}

/**
 * Parses 24-hour HH:MM string into total minutes from midnight.
 */
function parseTimeToMinutes(timeStr: string): number {
  const parts = timeStr.split(':');
  const hours = Number(parts[0] ?? '0');
  const minutes = Number(parts[1] ?? '0');

  return hours * 60 + minutes;
}

/**
 * Rounds a total minute value to nearest increment according to direction.
 */
function roundMinutes(minutes: number, increment: number, direction: RoundingDirection): number {
  if (direction === 'up') return Math.ceil(minutes / increment) * increment;
  if (direction === 'down') return Math.floor(minutes / increment) * increment;

  return Math.round(minutes / increment) * increment;
}

/**
 * Calculates default start time by subtracting duration from reference time and rounding.
 *
 * @param refTime Reference time string (HH:MM)
 * @param durationHours Event duration in decimal hours
 * @param options Rounding configuration options
 * @returns Rounded start time string (HH:MM)
 * @example
 * ```ts
 * const start = calculateDefaultStartTime('13:10', 1, { direction: 'nearest', increment: 15 });
 * // Returns '12:15'
 * ```
 */
export function calculateDefaultStartTime(
  refTime: string,
  durationHours: number,
  options?: TimeRoundingOptions,
): string {
  const refMinutes = parseTimeToMinutes(refTime);
  const startRawMinutes = refMinutes - Math.round(durationHours * 60);
  const increment = getRoundingIncrement(options);
  const direction = getRoundingDirection(options);
  const rounded = roundMinutes(startRawMinutes, increment, direction);

  return formatMinutesToTime(rounded);
}

/**
 * Computes finish time string by adding duration to start time.
 *
 * @param startTime Start time string (HH:MM)
 * @param durationHours Duration in decimal hours
 * @returns Finish time string (HH:MM)
 * @example
 * ```ts
 * const finish = calculateFinishTime('13:00', 1.5);
 * // Returns '14:30'
 * ```
 */
export function calculateFinishTime(startTime: string, durationHours: number): string {
  const startMinutes = parseTimeToMinutes(startTime);
  const finishMinutes = startMinutes + Math.round(durationHours * 60);

  return formatMinutesToTime(finishMinutes);
}

/**
 * Formats decimal hours into a concise human-readable duration string.
 *
 * @param hours Decimal hour value
 * @returns Formatted duration string (e.g. '1h 30m')
 * @example
 * ```ts
 * const formatted = formatDuration(1.25);
 * // Returns '1h 15m'
 * ```
 */
export function formatDuration(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  return composeDurationString(h, m);
}

/**
 * Returns current local time formatted as 24-hour HH:MM.
 *
 * @param date Reference date object
 * @returns Current time string
 * @example
 * ```ts
 * const now = getCurrentTimeString();
 * // Returns current time formatted as 'HH:MM'
 * ```
 */
export function getCurrentTimeString(date: Date = new Date()): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Returns current date formatted as YYYY-MM-DD.
 *
 * @param date Reference date object
 * @returns Current date string
 * @example
 * ```ts
 * const today = getTodayDateString();
 * // Returns today's date formatted as 'YYYY-MM-DD'
 * ```
 */
export function getTodayDateString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');

  return `${y}-${m}-${d}`;
}

/**
 * Parses user-supplied duration value into decimal hours.
 *
 * @param durationVal Duration input string or number
 * @returns Decimal hours
 * @example
 * ```ts
 * const hours = parseDuration('45m');
 * // Returns 0.75
 * ```
 */
export function parseDuration(durationVal: string | number | undefined): number {
  if (typeof durationVal === 'number') return durationVal;
  if (!durationVal) return 1;

  return parseRawDuration(String(durationVal));
}

/**
 * Rounds given time string to nearest increment according to specified direction.
 *
 * @param timeStr Time string in HH:MM format
 * @param options Rounding configuration options
 * @returns Rounded time string
 * @example
 * ```ts
 * const rounded = roundTimeToIncrement('13:07', { direction: 'nearest', increment: 15 });
 * // Returns '13:00'
 * ```
 */
export function roundTimeToIncrement(timeStr: string, options?: TimeRoundingOptions): string {
  const minutes = parseTimeToMinutes(timeStr);
  const increment = getRoundingIncrement(options);
  const direction = getRoundingDirection(options);
  const rounded = roundMinutes(minutes, increment, direction);

  return formatMinutesToTime(rounded);
}
