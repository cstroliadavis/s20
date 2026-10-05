[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [core/src](../README.md) / calculateDefaultStartTime

# Function: calculateDefaultStartTime()

> **calculateDefaultStartTime**(`refTime`, `durationHours`, `options?`): `string`

Calculates default start time by subtracting duration from reference time and rounding.

## Parameters

### refTime

`string`

Reference time string (HH:MM)

### durationHours

`number`

Event duration in decimal hours

### options?

[`TimeRoundingOptions`](../interfaces/TimeRoundingOptions.md)

Rounding configuration options

## Returns

`string`

Rounded start time string (HH:MM)

## Example

```ts
const start = calculateDefaultStartTime('13:10', 1, { direction: 'nearest', increment: 15 });
// Returns '12:15'
```
