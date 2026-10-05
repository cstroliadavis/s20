[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [csv/src](../README.md) / writeCsvFile

# Function: writeCsvFile()

> **writeCsvFile**(`filePath`, `data`, `options?`): `Promise`\<`number`\>

Writes data rows, records, or an async stream of items to a CSV file.

## Parameters

### filePath

`string`

Destination path for the CSV file.

### data

[`CsvValue`](../type-aliases/CsvValue.md)[][] \| `Record`\<`string`, [`CsvValue`](../type-aliases/CsvValue.md)\>[] \| `AsyncIterable`\<`Record`\<`string`, [`CsvValue`](../type-aliases/CsvValue.md)\> \| [`CsvValue`](../type-aliases/CsvValue.md)[], `any`, `any`\>

Array of rows, array of records, or an async iterable yielding items.

### options?

[`CsvStringifierOptions`](../interfaces/CsvStringifierOptions.md) = `{}`

Serialization options for delimiter, quotes, headers, and line breaks.

## Returns

`Promise`\<`number`\>

A promise resolving to the number of bytes written.

## Example

```ts
await writeCsvFile('output.csv', [
  { age: 30, name: 'Alice' },
  { age: 25, name: 'Bob' },
]);
```
