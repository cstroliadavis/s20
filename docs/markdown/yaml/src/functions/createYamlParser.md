[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [yaml/src](../README.md) / createYamlParser

# Function: createYamlParser()

> **createYamlParser**(`options?`): [`YamlParser`](../interfaces/YamlParser.md)

Creates a closure-based YAML parser instance with optional configuration options.

## Parameters

### options?

[`YamlParserOptions`](../interfaces/YamlParserOptions.md) = `{}`

Parser configuration options.

## Returns

[`YamlParser`](../interfaces/YamlParser.md)

A YamlParser instance.

## Example

```ts
const parser = createYamlParser();
const data = parser.parse('name: s20');
// Returns { name: 's20' }
```
