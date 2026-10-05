[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [yaml/src](../README.md) / scanYamlLines

# Function: scanYamlLines()

> **scanYamlLines**(`content`): [`YamlLine`](../interfaces/YamlLine.md)[]

Scans and preprocesses a YAML document string into structured lines with indentation metadata.

## Parameters

### content

`string`

Raw YAML string content to process.

## Returns

[`YamlLine`](../interfaces/YamlLine.md)[]

An array of preprocessed YAML lines.

## Example

```ts
const lines = scanYamlLines('name: s20\nversion: 0.1.0');
// Returns structured YamlLine items
```
