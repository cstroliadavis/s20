[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [yaml/src](../README.md) / createYamlStringifier

# Function: createYamlStringifier()

> **createYamlStringifier**(`options?`): [`YamlStringifier`](../interfaces/YamlStringifier.md)

Creates a closure-based YAML stringifier instance with optional serialization settings.

## Parameters

### options?

[`YamlStringifyOptions`](../interfaces/YamlStringifyOptions.md) = `{}`

Stringifier configuration options.

## Returns

[`YamlStringifier`](../interfaces/YamlStringifier.md)

A YamlStringifier instance.

## Example

```ts
const stringifier = createYamlStringifier({ indent: 2 });
const yaml = stringifier.stringify({ name: 's20' });
// Returns "name: s20\n"
```
