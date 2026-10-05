[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [csv/src](../README.md) / readCsvFile

# Function: readCsvFile()

> **readCsvFile**\<`T`\>(`filePath`, `options?`): `Promise`\<`T`[]\>

Reads and parses an entire CSV file from disk using Bun.file streams.

## Type Parameters

### T

`T` = [`CsvRecord`](../type-aliases/CsvRecord.md) \| [`CsvRow`](../type-aliases/CsvRow.md)

The parsed row type returned in the array (`CsvRow` array or `CsvRecord` object).

## Parameters

### filePath

`string`

Path to the CSV file.

### options?

[`CsvParserOptions`](../interfaces/CsvParserOptions.md) = `{}`

Configuration options for delimiter, quotes, headers, and trimming.

## Returns

`Promise`\<`T`[]\>

A promise resolving to an array of parsed rows or records.

## Example

```ts
const rows = await readCsvFile('data.csv');
// Returns [['header1', 'header2'], ['val1', 'val2']]
```
