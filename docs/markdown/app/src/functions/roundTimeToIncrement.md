[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [app/src](../README.md) / roundTimeToIncrement

# Function: roundTimeToIncrement()

> **roundTimeToIncrement**(`timeStr`, `options?`): `string`

Rounds given time string to nearest increment according to specified direction.

## Parameters

### timeStr

`string`

Time string in HH:MM format

### options?

[`TimeRoundingOptions`](../interfaces/TimeRoundingOptions.md)

Rounding configuration options

## Returns

`string`

Rounded time string

## Example

```ts
const rounded = roundTimeToIncrement('13:07', { direction: 'nearest', increment: 15 });
// Returns '13:00'
```
