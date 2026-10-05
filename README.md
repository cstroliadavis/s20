# S20 (Spouse Two Point Oh)

[![Bun](https://img.shields.io/badge/Runtime-Bun-black?logo=bun)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A fast, lightweight, and structured CLI time tracking tool built for **Bun** as a modular monolith
with dedicated internal workspace packages:

- `@s20/core`: Application domain logic, CSV storage engine, time calculations, and CLI integration.
- `@s20/cli`: Lightweight CLI command engine, argument tokenizer, and autocompletion subsystem.
- `@s20/csv`: RFC 4180 CSV parser, serializer, and file streaming library.

S20 tracks work sessions with zero friction, automatically synchronizing chronological events and
aggregate task summaries across clean, version-controllable CSV files.

---

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Command Reference](#command-reference)
  - [1. Quick Event Entry (`s20 <task>`)](#1-quick-event-entry-s20-task)
  - [2. Detailed Event Recording (`s20 add`)](#2-detailed-event-recording-s20-add)
  - [3. Completing vs. In-Progress Tasks](#3-completing-vs-in-progress-tasks)
  - [4. Listing Events (`s20 list`)](#4-listing-events-s20-list)
  - [5. Shell Tab Completion (`s20 completion`)](#5-shell-tab-completion-s20-completion)
- [Time Calculation & Smart Rounding](#time-calculation--smart-rounding)
- [Task Duration Defaults](#task-duration-defaults)
- [CSV Storage & Data Model](#csv-storage--data-model)
  - [`data/events.csv`](#dataeventscsv)
  - [`data/tasks.csv`](#datataskscsv)
- [Programmatic API Usage](#programmatic-api-usage)
- [Configuration & Customization](#configuration--customization)
- [Development & Testing](#development--testing)
- [Developer Documentation](#developer-documentation)

---

## Features

- **Zero-Boilerplate Event Recording**: Log time in seconds with `s20 "Ticket 5260"`.
- **Dual CSV Synchronization**:
  - `data/events.csv`: Append-only chronological log of all tracked sessions.
  - `data/tasks.csv`: Aggregate task state tracking total time, status, and category.
- **Smart Past-Time Rounding**: Start times automatically subtract the duration from the current
  time and round to clean 15-minute boundaries (e.g. 13:12 with 1h duration becomes 12:15).
- **Flexible Duration Parsing**: Supports natural time units (`15m`, `30m`, `1h`, `1.5h`, `90m`,
  `2h 30m`) or decimal hours (`2.25`).
- **Built-in Task Defaults**: Automatic duration presets for routine tasks (e.g. `Lunch` = 1h,
  `Break` = 15m, `Meeting` = 30m).
- **Dynamic Shell Autocompletion**: Autocompletes tasks dynamically from your CSV history,
  prioritizing open/unfinished tasks while accepting any new task name.
- **RFC 4180 CSV Engine**: Powered by `@s20/csv` for reliable escaping, quoting, and row streaming.

---

## Quick Start

### Installation & Execution

Clone the repository and run directly with **Bun**:

```bash
# Clone and navigate into project
cd S20

# Install dependencies
bun install

# Run the CLI
bun run ./bin/s20.ts "Ticket 5260"
```

To use `s20` as a system-wide command, add an alias to your shell configuration (`~/.zshrc` or
`~/.bashrc`):

```bash
alias s20="bun run /path/to/S20/bin/s20.ts"
```

---

## Command Reference

### 1. Quick Event Entry (`s20 <task>`)

The default command records a new time tracking entry. If no command name is provided, S20 treats
the first positional argument as the task description:

```bash
s20 "Ticket 5260"
```

**Output:**

```text
Recorded event #1: Ticket 5260 at 14:15
```

This single command:

1. Calculates the start time by subtracting 1 hour (the default duration) from the current time
   and rounding to the nearest 15-minute mark.
2. Sets the date to today (`YYYY-MM-DD`).
3. Appends a new event row to `data/events.csv` with `is done: false`.
4. Creates or updates the task entry in `data/tasks.csv` with cumulative time and `finished: ""`
   (empty).

---

### 2. Detailed Event Recording (`s20 add`)

Use `s20 add` when specifying custom durations, start times, past dates, or notes:

```bash
s20 add "Ticket 5260" \
  --start 05:30 \
  --duration 2.25 \
  --done \
  --notes "Had to wait for permission from bob"
```

Short aliases are fully supported:

```bash
s20 "Ticket 5260" -s 14:00 -d 45m -n "Sprint planning meeting"
```

#### Available Parameters for `add`

| Option       | Alias | Type   | Description                                 | Default          |
| :----------- | :---- | :----- | :------------------------------------------ | :--------------- |
| `--task`     |       | `text` | Task description or ticket identifier       | Positional #1    |
| `--start`    | `-s`  | `time` | Start time (24h `13:00` or 12h `1:00pm`)    | Auto-calculated  |
| `--duration` | `-d`  | `text` | Session duration (`15m`, `1.5h`, `2.25`)    | `1h` (or preset) |
| `--done`     |       | `flag` | Mark event as completed and set finish date | `false`          |
| `--no-done`  |       | `flag` | Explicitly keep task in-progress            | `true`           |
| `--notes`    | `-n`  | `text` | Contextual notes or explanations            | `""`             |
| `--date`     |       | `date` | Event date in `YYYY-MM-DD` format           | Today's date     |

---

### 3. Completing vs. In-Progress Tasks

By default, events represent ongoing or in-progress work (`is done: false`). The task's `finished`
column in `data/tasks.csv` remains empty until explicitly completed.

When you finish working on a task, pass the `--done` flag:

```bash
s20 "Ticket 5260" --done
```

**Effects of `--done`**:

- The event in `data/events.csv` is saved with `is done: true`.
- The task in `data/tasks.csv` is stamped with a calculated finish timestamp (`YYYY-MM-DD HH:MM`).

To explicitly log time on a task while ensuring it stays open, omit `--done` or use `--no-done`:

```bash
s20 "Ticket 5260" --no-done
```

---

### 4. Listing Events (`s20 list`)

View a formatted table of recently recorded events:

```bash
s20 list
```

**Output:**

```text
┌───┬────────────┬──────────┬────┬────────┬──────────────────────────┬───────┬─────────────┐
│   │ date       │ duration │ id │ isDone │ notes                    │ start │ task        │
├───┼────────────┼──────────┼────┼────────┼──────────────────────────┼───────┼─────────────┤
│ 0 │ 2026-10-03 │ 1        │ 1  │ false  │                          │ 14:15 │ Ticket 5260 │
│ 1 │ 2026-10-03 │ 2.25     │ 2  │ true   │ Had to wait for bob      │ 05:30 │ Ticket 5260 │
└───┴────────────┴──────────┴────┴────────┴──────────────────────────┴───────┴─────────────┘
```

Limit the number of displayed events:

```bash
s20 list --limit 5
s20 list -l 25
```

---

### 5. Shell Tab Completion (`s20 completion`)

S20 provides rich, dynamic shell autocompletion powered by Coliner. When typing `s20 "T<TAB>"`, it
dynamically inspects your `tasks.csv` file and suggests:

1. **Unfinished / Open Tasks** (prioritized at the top of suggestions).
2. **Completed Historical Tasks**.
3. **Custom entries** (you can still type any unlisted task name).

#### Activate Instantly in Your Shell

```bash
# Zsh (current session)
eval "$(s20 completion zsh)"

# Bash (current session)
eval "$(s20 completion bash)"

# Fish (current session)
s20 completion fish | source
```

#### Permanent Setup

Add the completion command to your shell startup file:

```bash
# For Zsh (~/.zshrc)
echo 'eval "$(s20 completion zsh)"' >> ~/.zshrc

# For Bash (~/.bashrc)
echo 'eval "$(s20 completion bash)"' >> ~/.bashrc

# For Fish (~/.config/fish/config.fish)
echo 's20 completion fish | source' >> ~/.config/fish/config.fish
```

---

## Time Calculation & Smart Rounding

When a start time is omitted, S20 calculates it using your current local time:

$$\text{startTime} = \text{roundToIncrement}(\text{currentTime} - \text{duration})$$

### Rounding Example

- Current time: `13:12`
- Duration: `1h` (60 minutes)
- Raw start time: `12:12`
- Increment: `15` minutes
- Direction: `nearest`
- **Resulting Start Time**: `12:15`

### Rounding Directions

- `nearest` (default): Rounds to closest increment boundary (12:07 -> 12:00, 12:08 -> 12:15).
- `down`: Always floors backwards to the earlier boundary (12:14 -> 12:00).
- `up`: Always ceilings forward to the later boundary (12:01 -> 12:15).

---

## Task Duration Defaults

Routine tasks often have consistent durations. S20 comes pre-configured with duration shortcuts:

| Task Name          | Default Duration | Notes                   |
| :----------------- | :--------------- | :---------------------- |
| `Break`            | `15m` (0.25h)    | Quick break             |
| `Check Email`      | `15m` (0.25h)    | Inbox triage            |
| `Meeting`          | `30m` (0.5h)     | Standard sync           |
| `Lunch`            | `1h` (1.0h)      | Meal break              |
| _(Any other task)_ | `1h` (1.0h)      | Global default duration |

Logging a routine task applies the duration preset automatically:

```bash
s20 "Lunch"
# Records 1 hour ending at current rounded time

s20 "Break"
# Records 15 minutes ending at current rounded time
```

---

## CSV Storage & Data Model

All data is stored in standard CSV files under the `data/` directory.

### `data/events.csv`

The append-only log of every individual tracking event:

| Column     | Type      | Example         | Description                           |
| :--------- | :-------- | :-------------- | :------------------------------------ |
| `id`       | `number`  | `1`             | Auto-incrementing unique record ID    |
| `date`     | `string`  | `2026-10-03`    | Event date (`YYYY-MM-DD`)             |
| `start`    | `string`  | `13:00`         | 24-hour start time (`HH:MM`)          |
| `duration` | `number`  | `1.5`           | Duration in decimal hours             |
| `task`     | `string`  | `Ticket 5260`   | Task title or ticket identifier       |
| `is done`  | `boolean` | `false`         | Completion status (`true` or `false`) |
| `notes`    | `string`  | `Design review` | Contextual notes                      |

### `data/tasks.csv`

The aggregate summary of all tracked tasks:

| Column       | Type     | Example            | Description                      |
| :----------- | :------- | :----------------- | :------------------------------- |
| `id`         | `number` | `1`                | Unique task ID                   |
| `task`       | `string` | `Ticket 5260`      | Unique task name                 |
| `details`    | `string` | `API migration`    | Long-form task details           |
| `started`    | `string` | `2026-10-03 13:00` | Timestamp when first recorded    |
| `finished`   | `string` | `2026-10-03 14:30` | Finish timestamp or `""` if open |
| `total time` | `number` | `3.75`             | Cumulative hours logged on task  |
| `priority`   | `string` | `high`             | Task priority                    |
| `urgency`    | `string` | `immediate`        | Urgency classification           |
| `importance` | `string` | `critical`         | Importance classification        |
| `category`   | `string` | `work`             | Associated project or category   |
| `metadata`   | `string` | `{}`               | JSON metadata payload            |
| `config`     | `string` | `{}`               | JSON task configuration          |

---

## Programmatic API Usage

S20 is fully typed and can be consumed programmatically in TypeScript or JavaScript projects:

```ts
import {
  createDefaultConfig,
  createS20Cli,
  createS20Service,
  createStorage,
  formatDuration,
} from 's20';

// 1. Initialize configuration and storage
const config = createDefaultConfig('./my-data-folder');
const storage = createStorage(config);

// 2. Instantiate application service
const service = createS20Service({ config, storage });

// 3. Record an event programmatically
const event = await service.recordEvent({
  date: '2026-10-03',
  done: true,
  duration: '1h 30m',
  notes: 'Shipped release v1.0',
  task: 'Release Deployment',
});

console.log(`Saved event #${event.id} (${formatDuration(event.duration)})`);

// 4. Query tasks and suggestions
const openTasks = await service.getTaskSuggestions();
console.log('Active tasks:', openTasks);
```

---

## Configuration & Customization

The default configuration factory can be customized with custom paths, rounding increments, and
category rules:

```ts
import { createDefaultConfig, type S20Config } from 's20';

const config: S20Config = createDefaultConfig();
config.roundingIncrement = 30; // Round to 30-minute intervals
config.roundingDirection = 'down'; // Always round backwards
config.defaultDuration = '30m'; // Default new events to 30m
config.defaultCategory = 'client-work';
```

---

## Development & Testing

All testing, type checking, and linting use **Bun**:

```bash
# Run the complete test suite (unit, integration, and E2E)
bun test

# Run tests in watch mode
bun test --watch

# Perform static type checking
bun run typecheck

# Lint codebase with ESLint
bun run lint
bun run lint:fix

# Check & enforce Prettier code formatting
bun run format:check
bun run format

# Generate TypeDoc HTML API documentation
bun run docs
```

---

## Developer Documentation

For in-depth architecture diagrams, data synchronization algorithms, component boundaries, and
contributor guidelines, refer to the [Developer Guide](DEVELOPER.md).

HTML API reference documentation can be generated locally into `./docs` using:

```bash
bun run docs
```
