# S20 Developer Guide

This document provides architecture specifications, implementation details, and contributor
guidelines for the **Spouse 2.0 (S20)** time tracking engine and CLI.

---

## 1. System Architecture

S20 is built as a modular monolith running natively on the **Bun** runtime. It is structured into
independent workspace packages managed under `packages/*`:

```text
┌────────────────────────────────────────────────────────┐
│                   CLI Entry Point                      │
│                    (bin/s20.ts)                        │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│                 @s20/core Workspace                    │
│                  (packages/core)                       │
│     - Application service layer & task coordination    │
│     - Time calculation, duration parsing & rounding    │
│     - CSV storage engine & task synchronization        │
│     - CLI integration & dynamic suggestion providers   │
└──────────────┬───────────────────────────┬─────────────┘
               │                           │
┌──────────────▼─────────────┐ ┌───────────▼─────────────┐
│      @s20/cli Workspace    │ │     @s20/csv Workspace  │
│       (packages/cli)       │ │      (packages/csv)     │
│ - Schema-driven CLI engine │ │ - RFC 4180 CSV parser   │
│ - Argument token parsing   │ │ - CSV stringifier       │
│ - Parameter coercion       │ │ - File read/write/append│
│ - Shell tab completions    │ │ - Async row streaming   │
└────────────────────────────┘ └─────────────────────────┘
```

---

## 2. Directory Structure

```text
S20/
├── bin/
│   └── s20.ts                 # CLI entry point script importing @s20/core
├── data/                      # Default directory for persistent CSV files
│   ├── events.csv             # Chronological event log
│   └── tasks.csv              # Aggregate task registry
├── docs/                      # Generated TypeDoc HTML reference documentation
├── packages/
│   ├── cli/                   # @s20/cli: Command-line engine & argument parser
│   │   ├── src/
│   │   │   ├── arg-parser.ts  # Token scanning, argument matching & flag resolution
│   │   │   ├── cli-tool.ts    # CLI tool instance factory & execution pipeline
│   │   │   ├── config-loader.ts # YAML schema loader & validator
│   │   │   ├── help-formatter.ts # Console help generation
│   │   │   ├── index.ts       # Public exports for @s20/cli
│   │   │   └── types.ts       # CLI configuration interfaces & definitions
│   │   ├── test/
│   │   └── package.json       # @s20/cli package definition
│   ├── core/                  # @s20/core: S20 domain logic, storage & service
│   │   ├── cli.yaml           # YAML CLI schema definition for S20
│   │   ├── src/
│   │   │   ├── cli.ts         # CLI binding, dynamic providers & event handlers
│   │   │   ├── config.ts      # Configuration interface, defaults & factory
│   │   │   ├── index.ts       # Public library exports for @s20/core
│   │   │   ├── s20-service.ts # Application service orchestrating operations
│   │   │   ├── storage.ts     # CSV storage engine and task synchronization
│   │   │   ├── time-utils.ts  # Duration parsing, time rounding & calculation
│   │   │   └── types.ts       # Core domain types and CSV column schemas
│   │   ├── test/
│   │   └── package.json       # @s20/core package definition
│   └── csv/                   # @s20/csv: RFC 4180 CSV parser and file I/O
│       ├── src/
│       │   ├── file.ts        # High-level readCsvFile, writeCsvFile, appendCsvFile
│       │   ├── parser.ts      # Chunk and stream CSV parsing
│       │   ├── stringifier.ts # Row and record formatting & quoting
│       │   ├── index.ts       # Public exports for @s20/csv
│       │   └── types.ts       # CSV options, records, and row schemas
│       ├── test/
│       └── package.json       # @s20/csv package definition
├── package.json               # Monorepo workspaces, scripts, and devDependencies
├── tsconfig.json              # TypeScript compiler configuration with path aliases
├── typedoc.json               # TypeDoc API documentation configuration
└── eslint.config.js           # ESLint flat configuration
```

---

## 3. Workspace Responsibilities

### `@s20/core` (`packages/core`)

- **`cli.ts`**: Loads `cli.yaml` via `@s20/cli`, injects dynamic task autocompletions from the
  application service, and maps `event-add` and `event-list` commands to service operations.
- **`s20-service.ts`**: Coordinates time calculations, applies task-specific default durations (e.g.
  `Lunch` -> 1h, `Break` -> 15m), and delegates persistence to `storage.ts`.
- **`storage.ts`**: Interacts with CSV files via `@s20/csv`, manages ID increments, accumulates
  total task durations, and ranks task suggestions with open tasks prioritized first.
- **`time-utils.ts`**: Parses durations (`15m`, `30m`, `1h`, `1.5h`, `90m`, `2.25`) into decimal
  hours, subtracts durations from the current time to compute default start times, and rounds to
  15-minute increments.
- **`config.ts`**: Provides application defaults and resolves file storage locations.

### `@s20/cli` (`packages/cli`)

- Implements a schema-driven command-line parsing and event execution subsystem.
- Handles YAML configuration loading, positional arguments, short and long flags, boolean negators
  (`--no-done`), time and type coercers, and shell completion scripts.

### `@s20/csv` (`packages/csv`)

- Recreates RFC 4180 compliant CSV parsing, serialization, and file streaming derived from csv-lib.
- Provides `readCsvFile`, `writeCsvFile`, and `appendCsvFile` with automatic header management,
  delimiters, and quotes escaping.

---

## 4. Storage & Synchronization Lifecycle

### Events vs Tasks Relationship

1. **Events (`data/events.csv`)**:
   - Immutable append-only log of time tracking occurrences.
   - Schema: `id, date, start, duration, task, is done, notes`.
2. **Tasks (`data/tasks.csv`)**:
   - Aggregate projection summarizing the state of each distinct task name.
   - Schema: `id, task, details, started, finished, total time`,
     `priority, urgency, importance, category, metadata, config`.

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
