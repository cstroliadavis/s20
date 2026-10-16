# S20 Developer Guide

This document provides architecture specifications, implementation details, and contributor
guidelines for the **Spouse 2.0 (S20)** time tracking engine and CLI.

---

## 1. System Architecture

S20 is built as a Clean Architecture modular monolith running natively on the **Bun** runtime.
Dependencies point strictly **inward** toward the platform-agnostic `@s20/app` core:

```text
                  ┌────────────────────────────────────────┐
                  │      Composition Root (bin/s20.ts)     │
                  └──────┬──────────────────────────┬──────┘
                         │                          │
        ┌────────────────▼────────────┐    ┌────────▼────────────────────┐
        │     Presentation Layer      │    │      Persistence Layer      │
        │    @s20/cli (packages/cli)  │    │ @s20/storage (packages/...) │
        │  - S20 CLI adapter (s20-cli)│    │  - CSV storage adapter      │
        │  - Schema-driven CLI engine │    │  - Local filesystem paths   │
        └──┬───────────────────────┬──┘    └──┬───────────────────────┬──┘
           │                       │          │ (Implements Port)     │
           │                       ▼          ▼                       │
           │             ┌──────────────────────────────┐             │
           │             │  Application & Domain Layer  │             │
           │             │    @s20/app (packages/app)   │             │
           │             │  - 100% Isomorphic (Web API) │             │
           │             │  - S20Service & S20Storage   │             │
           │             │  - Time math & task rules    │             │
           │             └──────────────┬───────────────┘             │
           │                            │                             │
┌──────────▼───────────┐     ┌──────────▼───────────┐     ┌───────────▼──────────┐
│  @s20/yaml Workspace │     │ @s20/logging Package │     │  @s20/csv Workspace  │
│    (packages/yaml)   │     │  (packages/logging)  │     │    (packages/csv)    │
│ - Zero-dep YAML      │     │ - Structured logger  │     │ - RFC 4180 CSV parser│
│ - Scalar/block parser│     │ - Rotating JSONL sink│     │ - CSV stringifier    │
└──────────────────────┘     └──────────────────────┘     └──────────────────────┘
```

---

## 2. Directory Structure

```text
S20/
├── bin/
│   └── s20.ts                 # Composition root wiring @s20/app, @s20/storage & @s20/cli
├── data/                      # Default directory for persistent CSV files
│   ├── events.csv             # Chronological event log
│   └── tasks.csv              # Aggregate task registry
├── docs/                      # Generated documentation
│   ├── html/                  # Searchable HTML API reference
│   └── markdown/              # Native GitHub Markdown API reference
├── packages/
│   ├── app/                   # @s20/app: Isomorphic domain models, rules, ports & service
│   │   ├── src/
│   │   │   ├── config.ts      # Platform-independent domain configuration & defaults
│   │   │   ├── index.ts       # Public library exports for @s20/app
│   │   │   ├── memory-storage.ts # In-memory S20Storage adapter for tests & browser
│   │   │   ├── s20-service.ts # Application service orchestrating operations
│   │   │   ├── task-rules.ts  # Pure task lifecycle, accumulation & ranking rules
│   │   │   ├── time-utils.ts  # Duration parsing, time rounding & calculation
│   │   │   └── types.ts       # Core domain entities and S20Storage port contract
│   │   ├── test/
│   │   └── package.json       # @s20/app package definition
│   ├── storage/               # @s20/storage: Persistence adapters implementing S20Storage
│   │   ├── src/
│   │   │   ├── csv-storage.ts # CSV storage adapter using @s20/csv
│   │   │   ├── index.ts       # Public exports for @s20/storage
│   │   │   ├── paths.ts       # Local filesystem path resolution
│   │   │   └── types.ts       # StoragePaths and CSV column schemas
│   │   ├── test/
│   │   └── package.json       # @s20/storage package definition
│   ├── cli/                   # @s20/cli: Presentation adapter & CLI engine
│   │   ├── cli.yaml           # YAML CLI schema definition for S20
│   │   ├── src/
│   │   │   ├── arg-parser.ts  # Token scanning, argument matching & flag resolution
│   │   │   ├── cli-tool.ts    # CLI tool instance factory & execution pipeline
│   │   │   ├── config-loader.ts # YAML schema loader & validator
│   │   │   ├── help-formatter.ts # Console help generation
│   │   │   ├── index.ts       # Public exports for @s20/cli
│   │   │   ├── s20-cli.ts     # S20 CLI presentation controller binding to S20Service
│   │   │   └── types.ts       # CLI configuration interfaces & definitions
│   │   ├── test/
│   │   └── package.json       # @s20/cli package definition
│   ├── csv/                   # @s20/csv: RFC 4180 CSV parser and file I/O
│   ├── logging/               # @s20/logging: Structured logger and JSONL file plugin
│   └── yaml/                  # @s20/yaml: Zero-dependency YAML parser and stringifier
├── package.json               # Monorepo workspaces, scripts, and devDependencies
├── tsconfig.json              # TypeScript compiler configuration with path aliases
├── typedoc.json               # TypeDoc API documentation configuration
└── bunfig.toml                # Bun formatter, linter, and test runner configuration
```

---

## 3. Workspace Responsibilities

### `@s20/app` (`packages/app` — Application & Domain Layer)

- **100% Isomorphic**: Zero dependencies on `node:*`, `Bun.*`, `@s20/cli`, or `@s20/csv`. Runs
  unchanged in CLI, TUI, Web API server, or browser PWA environments.
- **`s20-service.ts`**: Coordinates time calculations, applies task-specific default durations,
  synchronizes task state, and delegates persistence exclusively through the `S20Storage` port.
- **`task-rules.ts`**: Pure domain functions for creating task records, accumulating `totalTime`,
  computing `finished` timestamps, and ranking completion suggestions.
- **`time-utils.ts`**: Parses durations (`15m`, `30m`, `1h`, `1.5h`, `90m`, `2.25`) into decimal
  hours, subtracts durations from the current time to compute default start times, and rounds to
  15-minute increments using the standard `Temporal` and `Intl` APIs.
- **`config.ts`**: Provides platform-agnostic domain defaults.
- **`memory-storage.ts`**: Provides an in-memory `S20Storage` implementation for fast unit testing.

### `@s20/storage` (`packages/storage` — Persistence Layer)

- **`csv-storage.ts`**: Implements `@s20/app`'s `S20Storage` interface using `@s20/csv` to read,
  append, and overwrite `events.csv` and `tasks.csv`.
- **`paths.ts`**: Resolves local filesystem directories and file paths (`createDefaultStoragePaths`).

### `@s20/cli` (`packages/cli` — Presentation Layer)

- **`s20-cli.ts`**: Loads `cli.yaml`, injects dynamic task autocompletions from `S20Service`, and
  maps `event-add` and `event-list` commands to service operations.
- **CLI Engine**: Implements schema-driven command-line parsing, positional arguments, flags,
  boolean negators (`--no-done`), type coercers, and shell completion scripts.

### `@s20/csv`, `@s20/yaml`, `@s20/logging` (Foundational Tooling)

- **`@s20/csv`**: RFC 4180 compliant CSV parsing, serialization, and file streaming.
- **`@s20/yaml`**: Zero-dependency YAML parsing and stringification.
- **`@s20/logging`**: Structured event logger with pluggable sinks (`jsonlFilePlugin`).

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

| Script          | Command                                   | Description                                    |
| :-------------- | :---------------------------------------- | :--------------------------------------------- |
| `start`         | `bun run ./bin/s20.ts`                    | Runs the CLI directly from source              |
| `test`          | `bun test`                                | Executes all unit, integration, and E2E test   |
| `test:watch`    | `bun test --watch`                        | Runs test runner in watch mode                 |
| `typecheck`     | `tsc --noEmit`                            | Performs static type verification              |
| `lint`          | `eslint .`                                | Lints TypeScript and JavaScript files          |
| `lint:fix`      | `eslint --fix .`                          | Automatically fixes autofixable lint errors    |
| `format`        | `prettier --write .`                      | Formats all codebase files with Prettier       |
| `format:check`  | `prettier --check .`                      | Verifies code formatting compliance            |
| `docs`          | `typedoc --options ...`                   | Generates both HTML and Markdown API docs      |
| `docs:html`     | `typedoc --options typedoc.json`          | Generates interactive HTML docs to `docs/html` |
| `docs:markdown` | `typedoc --options typedoc.markdown.json` | Generates native Markdown to `docs/markdown`   |

### API Documentation Reference

API reference documentation is maintained in both Markdown and HTML formats:

- **[Markdown API Reference (docs/markdown/modules.md)](docs/markdown/modules.md)**: Native
  Markdown documentation browsable directly on GitHub.
  - **[@s20/app API](docs/markdown/app/src/README.md)**: Domain models, services, storage, and
    Temporal time math.
  - **[@s20/cli API](docs/markdown/cli/src/README.md)**: CLI parser, token scanning, coercion, and
    autocompletions.
  - **[@s20/csv API](docs/markdown/csv/src/README.md)**: RFC 4180 CSV parsing, stringifying, and
    streaming.
  - **[@s20/yaml API](docs/markdown/yaml/src/README.md)**: Zero-dependency YAML parsing, block
    scalar processing, and serialization.
- **[HTML Documentation (docs/html/index.html)](docs/html/index.html)**: Interactive, searchable HTML
  generated via TypeDoc.

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
