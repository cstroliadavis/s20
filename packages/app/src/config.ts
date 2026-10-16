/**
 * @file S20 isomorphic application configuration module.
 *
 * Defines platform-independent configuration interfaces, supported rounding directions,
 * default task durations, and the default configuration factory free of Node/OS filesystem dependencies.
 */

/**
 * Supported rounding directions for time rounding calculations.
 */
export type RoundingDirection = 'down' | 'nearest' | 'up';

/**
 * Task-specific default settings overriding global tracking defaults.
 */
export interface TaskDefaultConfig {
  /**
   * Default category name assigned to events for this task.
   */
  category?: string;

  /**
   * Default duration string for this task (e.g. '15m', '1h').
   */
  duration?: string;
}

/**
 * Global domain and application configuration options for S20 time tracking.
 */
export interface S20Config {
  /**
   * Default category assigned to new tasks when unconfigured.
   */
  defaultCategory: string;

  /**
   * Default duration string when none is provided on the command line or in task defaults.
   */
  defaultDuration: string;

  /**
   * Direction used for rounding start times ('nearest', 'up', or 'down').
   */
  roundingDirection: RoundingDirection;

  /**
   * Minute increment step for rounding calculations (e.g. 15 for quarter-hour rounding).
   */
  roundingIncrement: number;

  /**
   * Map of task names to specific duration and category overrides.
   */
  taskDefaults: Record<string, TaskDefaultConfig | undefined>;
}

const DEFAULT_TASK_DEFAULTS: Record<string, TaskDefaultConfig> = {
  Break: { duration: '15m' },
  'Check Email': { duration: '15m' },
  Lunch: { duration: '1h' },
  Meeting: { duration: '30m' },
};

/**
 * Creates a platform-agnostic default S20 application configuration with optional overrides.
 *
 * @param overrides Optional partial configuration values to override defaults
 * @returns Configured S20 domain options
 * @example
 * ```ts
 * const config = createDefaultConfig({ roundingIncrement: 30 });
 * // Returns S20Config with 30-minute rounding increment and preset task defaults
 * ```
 */
export function createDefaultConfig(overrides?: Partial<S20Config>): S20Config {
  const defaults: S20Config = {
    defaultCategory: 'work',
    defaultDuration: '1h',
    roundingDirection: 'nearest',
    roundingIncrement: 15,
    taskDefaults: { ...DEFAULT_TASK_DEFAULTS },
  };

  return { ...defaults, ...overrides };
}
