# S20 (Spouse Two Point Oh)

A highly effective, lightweight CLI time tracking tool built for **Bun** using
[coliner](file:///Users/christopherstrolia-davis/Library/CloudStorage/GoogleDrive-christopher.stroliadavis@gmail.com/My%20Drive/ag-projects/coliner)
and
[csv-lib](file:///Users/christopherstrolia-davis/Library/CloudStorage/GoogleDrive-christopher.stroliadavis@gmail.com/My%20Drive/ag-projects/csv-lib).

Tracks work sessions and automatically synchronizes events and tasks across structured CSV
spreadsheets.

## Features

- **Zero-Boilerplate Event Recording**: Track an event with just `s20 "Ticket 5260"`.
- **Dual CSV Synchronization**:
  - `data/events.csv`: Detailed chronological log (`id, date, start, duration, task, is done, notes`).
  - `data/tasks.csv`: Aggregate task state (`id, task, details, started, finished, total time, priority, urgency, importance, category, metadata, config`).
- **Smart Time Rounding**: Start times default to the event duration before the current time, rounded
  to configurable increments (e.g. 15 minutes, nearest/up/down).
- **Flexible Durations**: Accepts `15m`, `30m`, `1h`, `1.5h`, `90m`, or decimal hours (`2.25`).
- **Task Duration Defaults**: Automatically applies task-specific defaults (e.g. Lunch = 1h, Break =
  15m) when unspecified.
- **Dynamic Shell Tab Completion**: Tab completions suggest recent unfinished tasks first, followed
  by prior tasks from `tasks.csv`, while accepting any custom task string.
- **Negator Support**: Flags like `--done` (default) can be inverted with `--no-done`.

## CSV Data Schema

### `data/events.csv`

| Column     | Type      | Description                                 |
| :--------- | :-------- | :------------------------------------------ |
| `id`       | `number`  | Auto-incrementing identifier (starts at 1). |
| `date`     | `string`  | Date of the event (`YYYY-MM-DD`).           |
| `start`    | `string`  | 24-hour start time (`HH:MM`).               |
| `duration` | `number`  | Duration in decimal hours (e.g. `1.5`).     |
| `task`     | `string`  | Task title or ticket identifier.            |
| `is done`  | `boolean` | `true` or `false`.                          |
| `notes`    | `string`  | Context or reason notes.                    |

### `data/tasks.csv`

| Column       | Type     | Description                                         |
| :----------- | :------- | :-------------------------------------------------- |
| `id`         | `number` | Unique task identifier.                             |
| `task`       | `string` | Unique task name.                                   |
| `details`    | `string` | Detailed description.                               |
| `started`    | `string` | Timestamp when first recorded (`YYYY-MM-DD HH:MM`). |
| `finished`   | `string` | Timestamp when completed or empty if in progress.   |
| `total time` | `number` | Cumulative hours logged across all events for task. |
| `priority`   | `string` | Task priority.                                      |
| `urgency`    | `string` | Urgency rating.                                     |
| `importance` | `string` | Importance rating.                                  |
| `category`   | `string` | Associated category or project.                     |
| `metadata`   | `string` | JSON metadata object (`{}`).                        |
| `config`     | `string` | JSON task-level configuration (`{}`).               |

## Usage

### 1. Simplest Invocation

Records an event for "Ticket 5260" using the default 1-hour duration ending at the current time:

```bash
s20 "Ticket 5260"
```

### 2. Explicit Options

```bash
s20 add "Ticket 5260" --start 05:30 --duration 2.25 --done --notes "Had to wait for permission from bob"
```

Aliases are also supported:

```bash
s20 "Ticket 5260" -s 14:00 -d 45m -n "Sprint planning meeting"
```

### 3. Unfinished / Ongoing Tasks

Use the `--no-done` negator flag to indicate the task remains open:

```bash
s20 "Ticket 5260" --no-done
```

Unfinished tasks will appear first in tab completion suggestions for future entries.

### 4. Listing Events

```bash
s20 list
s20 list --limit 25
```

## Shell Tab Completions

Activate completions instantly in your current shell:

```bash
# Zsh
eval "$(s20 completion zsh)"

# Bash
eval "$(s20 completion bash)"

# Fish
s20 completion fish | source
```

## Development & Testing

All testing and linting run via **Bun**:

```bash
# Run unit & e2e test suite
bun test

# Type checking
bun run typecheck

# Standardized ESLint
bun run lint

# Prettier formatting
bun run format:check
bun run format
```
