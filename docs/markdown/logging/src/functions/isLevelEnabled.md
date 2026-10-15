[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [logging/src](../README.md) / isLevelEnabled

# Function: isLevelEnabled()

> **isLevelEnabled**(`configuredLevel`, `messageLevel`): `boolean`

Checks if a log level meets or exceeds the active threshold.

## Parameters

### configuredLevel

[`LogLevel`](../type-aliases/LogLevel.md)

Minimum threshold required to emit logs.

### messageLevel

[`LogLevel`](../type-aliases/LogLevel.md)

Severity of the incoming log message or event.

## Returns

`boolean`

True if the message should be logged.

## Example

```ts
isLevelEnabled('info', 'warn');
// returns true
```
