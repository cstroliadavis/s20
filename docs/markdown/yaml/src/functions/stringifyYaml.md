[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [yaml/src](../README.md) / stringifyYaml

# Function: stringifyYaml()

> **stringifyYaml**(`data`, `options?`): `string`

Serializes a JavaScript data structure into formatted YAML text.

## Parameters

### data

`unknown`

The data structure to serialize.

### options?

[`YamlStringifyOptions`](../interfaces/YamlStringifyOptions.md) = `{}`

Stringifier configuration options.

## Returns

`string`

The resulting formatted YAML string.

## Example

```ts
const yaml = stringifyYaml({ name: 's20', version: '0.1.0' });
// Returns YAML text
```
