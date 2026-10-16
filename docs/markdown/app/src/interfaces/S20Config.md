[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [app/src](../README.md) / S20Config

# Interface: S20Config

Global domain and application configuration options for S20 time tracking.

## Properties

### defaultCategory

> **defaultCategory**: `string`

Default category assigned to new tasks when unconfigured.

***

### defaultDuration

> **defaultDuration**: `string`

Default duration string when none is provided on the command line or in task defaults.

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
