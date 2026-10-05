[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [app/src](../README.md) / parseDuration

# Function: parseDuration()

> **parseDuration**(`durationVal`): `number`

Parses user-supplied duration value into decimal hours.

## Parameters

### durationVal

`string` \| `number` \| `undefined`

Duration input string or number

## Returns

`number`

Decimal hours

## Example

```ts
const hours = parseDuration('45m');
// Returns 0.75
```
