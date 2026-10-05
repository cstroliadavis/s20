[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [yaml/src](../README.md) / parseBlockScalar

# Function: parseBlockScalar()

> **parseBlockScalar**(`params`): `BlockScalarResult`

Parses block scalar content (literal `|` or folded `>`) from source lines.

## Parameters

### params

`ParseBlockScalarParams`

Configuration parameters for block scalar extraction.

## Returns

`BlockScalarResult`

Extracted string value and the next line index.

## Example

```ts
const { value, nextIndex } = parseBlockScalar({
  indicator: '|',
  lines: [],
  parentIndent: 0,
  startIndex: 1,
});
// Returns block string
```
