[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [yaml/src](../README.md) / parseYaml

# Function: parseYaml()

> **parseYaml**\<`T`\>(`content`, `options?`): `T`

Parses a YAML string into a typed JavaScript data structure.

## Type Parameters

### T

`T` = `unknown`

Inferred or explicit result data type.

## Parameters

### content

`string`

Raw YAML string content.

### options?

[`YamlParserOptions`](../interfaces/YamlParserOptions.md) = `{}`

Parser configuration options.

## Returns

`T`

The parsed JavaScript object, array, or primitive.

## Example

```ts
const config = parseYaml<{ name: string }>('name: s20');
// Returns { name: 's20' }
```
