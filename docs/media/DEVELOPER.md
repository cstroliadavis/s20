# S20 Developer Guide

This document provides architecture specifications, implementation details, and contributor
guidelines for the **Spouse 2.0 (S20)** time tracking engine and CLI.

---

## 1. System Architecture

S20 is built as a modular TypeScript application running natively on the **Bun** runtime. It is
structured into distinct, decoupled layers:

```
┌────────────────────────────────────────────────────────┐
│                   CLI Entry Point                      │
│                    (bin/s20.ts)                        │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│                 Coliner CLI Engine                     │
│           (cli.yaml + src/cli.ts)                      │
│     - Schema validation & parameter coercion           │
│     - Dynamic tab completion provider injection        │
│     - Event routing ('event-add', 'event-list')        │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│                  Service Layer                         │
│               (src/s20-service.ts)                     │
│     - Input normalization & task default overrides     │
│     - Coordinate time rounding and calculations        │
│     - Storage transaction delegation                   │
└──────────────┬───────────────────────────┬─────────────┘
               │                           │
┌──────────────▼─────────────┐ ┌───────────▼─────────────┐
│       Time Utilities       │ │     CSV Storage Engine  │
│    (src/time-utils.ts)     │ │      (src/storage.ts)   │
│ - Flexible duration parse  │ │ - Event append & sync   │
│ - Start/finish calculation │ │ - Task aggregation      │
│ - 15m step rounding        │ │ - Prioritized ranking   │
└────────────────────────────┘ └───────────┬─────────────┘
                                           │
                               ┌───────────▼─────────────┐
                               │         csv-lib         │
                               │ - RFC 4180 CSV engine   │
                               │ - Typed row conversions │
                               └─────────────────────────┘
```

---

## 2. Directory Structure

```
S20/
├── bin/
│   └── s20.ts                 # CLI executable script (#!/usr/bin/env bun)
├── cli.yaml                   # Root CLI schema definition for Coliner
├── data/                      # Default directory for persistent CSV files
│   ├── events.csv             # Chronological event log
│   └── tasks.csv              # Aggregate task registry
├── docs/                      # Generated TypeDoc HTML reference documentation
├── src/
│   ├── cli.ts                 # CLI binding, dynamic providers & event handlers
│   ├── cli.yaml               # Bundled CLI schema definition
│   ├── config.ts              # Configuration interface, defaults & factory
│   ├── index.ts               # Public library exports
│   ├── s20-service.ts         # Application service orchestrating operations
│   ├── storage.ts             # CSV storage engine and task synchronization
│   ├── time-utils.ts          # Duration parsing, time rounding & calculation
│   └── types.ts               # Core domain types and CSV column schemas
├── test/
│   ├── cli.test.ts            # CLI execution and flag tests
│   ├── e2e.test.ts            # Subprocess end-to-end and completion tests
│   ├── s20-service.test.ts    # Service layer unit tests
│   ├── storage.test.ts        # Storage engine and synchronization tests
│   └── time-utils.test.ts     # Time calculation and parsing tests
├── package.json               # Scripts, dependencies, and metadata
├── tsconfig.json              # TypeScript compiler configuration
├── typedoc.json               # TypeDoc API documentation configuration
└── eslint.config.js           # ESLint flat configuration
```

---

## 3. Module Responsibilities

### `src/cli.ts`

- Loads the YAML schema using Coliner's `createConfigLoader()`.
- Dynamically injects the `task` parameter autocomplete provider (`service.getTaskSuggestions()`).
- Binds Coliner listeners to application actions:
  - `event-add`: Coerces parameters, invokes `service.recordEvent()`, and logs summary output.
  - `event-list`: Retrieves recent entries via `service.listEvents()` and logs a formatted table.

### `src/s20-service.ts`

- Serves as the central coordination boundary.
- Resolves task-specific defaults (e.g. `Break` -> 15m, `Lunch` -> 1h).
- Calculates start time using `time-utils` if omitted.
- Defaults `isDone` to `false` when `--done` is not passed.
- Delegates data persistence and query retrieval to `storage.ts`.

### `src/storage.ts`

- Manages reading, writing, and appending rows via `csv-lib`.
- Handles incremental ID generation for both events and tasks.
- Synchronizes task state:
  - When an event is recorded for a new task, a task entry is created in `tasks.csv`.
  - When an event is logged for an existing task, cumulative `total time` is increased.
  - If `isDone: true`, the task's `finished` timestamp is updated.
  - If `isDone: false`, the task's `finished` field remains empty.
- Provides `getTaskSuggestions()` with unfinished tasks ranked before finished tasks.

### `src/time-utils.ts`

- Parses durations from strings (`15m`, `30m`, `1h`, `1.5h`, `90m`, `2.25`) into decimal hours.
- Rounds start time backwards from the current time (`now - duration`) to the nearest 15-minute
  increment (configurable to `nearest`, `up`, or `down`).
- Computes task finish times (`startTime + duration`).
- Normalizes times across 24-hour boundaries.

### `src/config.ts`

- Provides configuration defaults and resolves data directory paths.
- Holds task default duration lookup tables.

---

## 4. Storage & Synchronization Lifecycle

### Events vs Tasks Relationship

1. **Events (`data/events.csv`)**:
   - Immutable append-only log of time tracking occurrences.
   - Schema: `id, date, start, duration, task, is done, notes`.
2. **Tasks (`data/tasks.csv`)**:
   - Aggregate projection summarizing the state of each distinct task name.
   - Schema: `id, task, details, started, finished, total time, priority, urgency, importance, category, metadata, config`.

### Synchronization Algorithm

When `addEvent(event)` is invoked:

1. `initStorage()` verifies CSV files exist with header rows.
2. The next incremental `id` is computed (`max(id) + 1` or `1`).
3. The event row is formatted and appended to `events.csv`.
4. Existing tasks in `tasks.csv` are searched for a case-insensitive name match:
   - **No match**: A new task row is appended with `started = event.date + ' ' + event.start`,
     `total time = event.duration`, and `finished` set only if `event.isDone` is true.
   - **Match**: `task.totalTime += event.duration`. If `event.isDone` is true, `task.finished`
     is set to `event.date + ' ' + calculateFinishTime(event.start, event.duration)`.

---

## 5. Development Workflow

### Prerequisites

- [Bun](https://bun.sh) v1.2+ installed.

### Available Scripts

| Script         | Command                | Description                                    |
| :------------- | :--------------------- | :--------------------------------------------- |
| `start`        | `bun run ./bin/s20.ts` | Runs the CLI directly from source              |
| `test`         | `bun test`             | Executes all unit, integration, and E2E tests  |
| `test:watch`   | `bun test --watch`     | Runs test runner in watch mode                 |
| `typecheck`    | `tsc --noEmit`         | Performs static type verification              |
| `lint`         | `eslint .`             | Lints TypeScript and JavaScript files          |
| `lint:fix`     | `eslint --fix .`       | Automatically fixes autofixable lint errors    |
| `format`       | `prettier --write .`   | Formats all codebase files with Prettier       |
| `format:check` | `prettier --check .`   | Verifies code formatting compliance            |
| `docs`         | `typedoc`              | Generates HTML API documentation into `./docs` |

### Recommended Validation Pipeline

Run the full verification suite before committing:

```bash
bun test && bun run typecheck && bun run lint && bun run format:check && bun run docs
```

---

## 6. Code Style & Engineering Standards

- **Factory Pattern**: Use closure-based factory functions (`createS20Service`, `createStorage`,
  `createS20Cli`) rather than ES classes.
- **Internal State**: Encapsulate private closure variables into an internal `_` state object.
- **Function Limits**:
  - Maximum function length: $\le 30-50$ lines.
  - Maximum parameters: $\le 3$ (use options objects for more).
  - Cyclomatic complexity: $\le 3$.
- **Function Ordering**: Internal helper functions must be sorted alphabetically at the top;
  exported functions sorted alphabetically at the bottom.
- **JSDoc Standards**:
  - Exported functions require `@param`, `@returns`, and typed `@example` markdown blocks.
  - Internal functions require concise descriptions without extraneous tags.
  - Wrap comment lines at $\le 100$ characters.
