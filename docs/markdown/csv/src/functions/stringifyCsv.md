[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [csv/src](../README.md) / stringifyCsv

# Function: stringifyCsv()

> **stringifyCsv**(`data`, `options?`): `string`

Serializes an array of rows or records into a complete CSV string.

## Parameters

### data

[`CsvValue`](../type-aliases/CsvValue.md)[][] \| `Record`\<`string`, [`CsvValue`](../type-aliases/CsvValue.md)\>[]

Array of row arrays or key-value record objects.

### options?

[`CsvStringifierOptions`](../interfaces/CsvStringifierOptions.md) = `{}`

Configuration options for delimiter, quote, escaping, and line breaks.

## Returns

`string`

The formatted CSV string.

## Example

```ts
const csv = stringifyCsv([
  { age: 30, name: 'Alice' },
  { age: 25, name: 'Bob' },
]);
// Returns formatted CSV with header row
```
