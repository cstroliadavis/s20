[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [cli/src](../README.md) / coerceTime

# Function: coerceTime()

> **coerceTime**(`value`, `paramName`): `string`

Validates and normalizes time parameters to 24-hour HH:MM format.

## Parameters

### value

`unknown`

Raw parameter value from CLI input

### paramName

`string`

Name of parameter for error reporting

## Returns

`string`

Normalized 24-hour time string (HH:MM)

## Throws

If format or time values are invalid
