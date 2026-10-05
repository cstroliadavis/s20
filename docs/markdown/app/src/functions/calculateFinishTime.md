[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [app/src](../README.md) / calculateFinishTime

# Function: calculateFinishTime()

> **calculateFinishTime**(`startTime`, `durationHours`): `string`

Computes finish time string by adding duration to start time.

## Parameters

### startTime

`string`

Start time string (HH:MM)

### durationHours

`number`

Duration in decimal hours

## Returns

`string`

Finish time string (HH:MM)

## Example

```ts
const finish = calculateFinishTime('13:00', 1.5);
// Returns '14:30'
```
