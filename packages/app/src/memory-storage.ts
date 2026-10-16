/**
 * @file In-memory implementation of the S20Storage persistence port.
 *
 * Provides a zero-I/O, platform-agnostic storage adapter for unit tests, browser/PWA
 * prototyping, and isolated service verification.
 */
import type { EventRecord, S20Storage, TaskRecord } from './types.js';

/**
 * Creates an isolated in-memory storage adapter implementing the S20Storage port.
 *
 * @returns S20Storage instance backed by in-memory arrays
 * @example
 * ```ts
 * const storage = createMemoryStorage();
 * const service = createS20Service({ config: createDefaultConfig(), storage });
 * await service.recordEvent({ task: 'Ticket 5260' });
 * // Persists event and task in memory without filesystem access
 * ```
 */
export function createMemoryStorage(): S20Storage {
  const _ = {
    events: [] as EventRecord[],
    tasks: [] as TaskRecord[],
  };

  return {
    appendEvent: async (event: EventRecord) => {
      _.events.push({ ...event });
    },
    appendTask: async (task: TaskRecord) => {
      _.tasks.push({ ...task });
    },
    getEvents: async () => _.events.map((e) => ({ ...e })),
    getTasks: async () => _.tasks.map((t) => ({ ...t })),
    init: async () => {},
    saveTasks: async (tasks: TaskRecord[]) => {
      _.tasks = tasks.map((t) => ({ ...t }));
    },
  };
}
