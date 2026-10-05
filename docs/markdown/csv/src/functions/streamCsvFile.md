[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [csv/src](../README.md) / streamCsvFile

# Function: streamCsvFile()

> **streamCsvFile**\<`T`\>(`filePath`, `options?`): `AsyncGenerator`\<`T`\>

Streams parsed rows or records from a file on disk using Bun.file.

## Type Parameters

### T

`T` = [`CsvRecord`](../type-aliases/CsvRecord.md) \| [`CsvRow`](../type-aliases/CsvRow.md)

The parsed row type emitted by the stream (`CsvRow` array or `CsvRecord` object).

## Parameters

### filePath

`string`

Path to the CSV file.

### options?

[`CsvParserOptions`](../interfaces/CsvParserOptions.md) = `{}`

Configuration options for delimiter, quotes, headers, and trimming.

## Returns

`AsyncGenerator`\<`T`\>

An async generator yielding parsed rows or records.

## Example

```ts
for await (const record of streamCsvFile('users.csv', { columns: true })) {
  console.log(record.name);
}
```
