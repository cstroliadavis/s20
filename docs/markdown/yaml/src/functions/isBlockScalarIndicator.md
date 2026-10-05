[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [yaml/src](../README.md) / isBlockScalarIndicator

# Function: isBlockScalarIndicator()

> **isBlockScalarIndicator**(`value`): `boolean`

Determines whether a scalar value string denotes a YAML block scalar indicator.

## Parameters

### value

`string`

Scalar string to test.

## Returns

`boolean`

True if the string is a block scalar indicator (`|` or `>`).

## Example

```ts
const isBlock = isBlockScalarIndicator('|');
// Returns true
```
