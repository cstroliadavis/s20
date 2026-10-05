[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [csv/src](../README.md) / parseCsv

# Function: parseCsv()

> **parseCsv**\<`T`\>(`text`, `options?`): `T`[]

Parses a complete CSV string into an array of rows or records.

## Type Parameters

### T

`T` = [`CsvRecord`](../type-aliases/CsvRecord.md) \| [`CsvRow`](../type-aliases/CsvRow.md)

The parsed row type returned in the array (`CsvRow` array or `CsvRecord` object).

## Parameters

### text

`string`

The full CSV string to parse.

### options?

[`CsvParserOptions`](../interfaces/CsvParserOptions.md)

Configuration options for delimiter, quotes, headers, and trimming.

## Returns

`T`[]

An array of parsed rows or records.

## Example

```ts
const records = parseCsv('name,age\nBob,25', { columns: true });
// Returns [{ name: 'Bob', age: '25' }]
```
