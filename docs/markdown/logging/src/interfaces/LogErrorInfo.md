[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [logging/src](../README.md) / LogErrorInfo

# Interface: LogErrorInfo

Error details captured when an error is logged.

## Properties

### kind?

> `optional` **kind?**: `string`

Error constructor name, such as `'TypeError'` or `'RangeError'`.

***

### message

> **message**: `string`

Error message string.

***

### stack?

> `optional` **stack?**: `string`

Stack trace captured from the error.
