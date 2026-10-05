[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [core/src](../README.md) / formatDuration

# Function: formatDuration()

> **formatDuration**(`hours`): `string`

Formats decimal hours into a concise human-readable duration string.

## Parameters

### hours

`number`

Decimal hour value

## Returns

`string`

Formatted duration string (e.g. '1h 30m')

## Example

```ts
const formatted = formatDuration(1.25);
// Returns '1h 15m'
```
