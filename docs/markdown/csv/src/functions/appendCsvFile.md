[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [csv/src](../README.md) / appendCsvFile

# Function: appendCsvFile()

> **appendCsvFile**(`filePath`, `data`, `options?`): `Promise`\<`void`\>

Appends rows or records to an existing CSV file on disk.

## Parameters

### filePath

`string`

Destination path for the CSV file.

### data

[`CsvValue`](../type-aliases/CsvValue.md)[][] \| `Record`\<`string`, [`CsvValue`](../type-aliases/CsvValue.md)\>[]

Array of rows or records to append.

### options?

[`CsvStringifierOptions`](../interfaces/CsvStringifierOptions.md) = `{}`

Serialization options. Header is automatically disabled if file has content.

## Returns

`Promise`\<`void`\>

A promise resolving when the append operation completes.

## Example

```ts
await appendCsvFile('log.csv', [['2026-10-02', 'INFO', 'System started']]);
```
