[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [core/src](../README.md) / TaskRecord

# Interface: TaskRecord

Domain representation of an aggregate tracked task stored in tasks.csv.

## Properties

### category

> **category**: `string`

Associated project or work category.

***

### config

> **config**: `string`

JSON configuration string for task-level options.

***

### details

> **details**: `string`

Optional long-form details description.

***

### finished

> **finished**: `string`

Completion timestamp (YYYY-MM-DD HH:MM) or empty string if in progress.

***

### id

> **id**: `number`

Auto-incrementing unique task identifier.

***

### importance

> **importance**: `string`

Importance rating or indicator.

***

### metadata

> **metadata**: `string`

JSON metadata string for extensibility.

***

### priority

> **priority**: `string`

Priority designation.

***

### started

> **started**: `string`

Timestamp when work was first recorded (YYYY-MM-DD HH:MM).

***

### task

> **task**: `string`

Unique task name or ticket identifier.

***

### totalTime

> **totalTime**: `number`

Cumulative hours logged across all events for this task.

***

### urgency

> **urgency**: `string`

Urgency rating or indicator.
