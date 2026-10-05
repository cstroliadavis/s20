[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [yaml/src](../README.md) / parseScalar

# Function: parseScalar()

> **parseScalar**(`text`): `unknown`

Parses a scalar YAML token string into its inferred JavaScript primitive or flow collection.

## Parameters

### text

`string`

Raw scalar string from YAML input.

## Returns

`unknown`

The parsed JavaScript primitive or collection value.

## Example

```ts
const value = parseScalar('true');
// Returns true
```
