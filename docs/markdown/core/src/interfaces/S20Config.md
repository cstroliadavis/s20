[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [core/src](../README.md) / S20Config

# Interface: S20Config

Global configuration options for S20 time tracking.

## Properties

### categoryFilePath

> **categoryFilePath**: `string`

Path to the category CSV file.

***

### dataDir

> **dataDir**: `string`

Root directory housing all CSV storage files.

***

### defaultCategory

> **defaultCategory**: `string`

Default category assigned to new tasks when unconfigured.

***

### defaultDuration

> **defaultDuration**: `string`

Default duration string when none is provided on the command line or in task defaults.

***

### eventsFilePath

> **eventsFilePath**: `string`

Path to the events chronological log CSV file.

***

### projectFilePath

> **projectFilePath**: `string`

Path to the project definitions CSV file.

***

### roundingDirection

> **roundingDirection**: [`RoundingDirection`](../type-aliases/RoundingDirection.md)

Direction used for rounding start times ('nearest', 'up', or 'down').

***

### roundingIncrement

> **roundingIncrement**: `number`

Minute increment step for rounding calculations (e.g. 15 for quarter-hour rounding).

***

### taskDefaults

> **taskDefaults**: `Record`\<`string`, [`TaskDefaultConfig`](TaskDefaultConfig.md) \| `undefined`\>

Map of task names to specific duration and category overrides.

***

### tasksFilePath

> **tasksFilePath**: `string`

Path to the aggregate tasks status CSV file.
