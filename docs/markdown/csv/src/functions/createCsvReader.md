[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [csv/src](../README.md) / createCsvReader

# Function: createCsvReader()

> **createCsvReader**\<`T`\>(`source`, `options?`): [`CsvReader`](../interfaces/CsvReader.md)\<`T`\>

Creates a streaming CSV reader for iterating through rows or collecting them.

## Type Parameters

### T

`T` = [`CsvRecord`](../type-aliases/CsvRecord.md) \| [`CsvRow`](../type-aliases/CsvRow.md)

The item type yielded by the reader: `CsvRow` (array) or `CsvRecord` (object).

## Parameters

### source

`AsyncIterable`\<`string` \| `Uint8Array`\<`ArrayBufferLike`\>, `any`, `any`\> \| `ReadableStream`\<`string` \| `Uint8Array`\<`ArrayBufferLike`\>\>

The underlying ReadableStream or AsyncIterable.

### options?

[`CsvParserOptions`](../interfaces/CsvParserOptions.md) = `{}`

Parser configuration options.

## Returns

[`CsvReader`](../interfaces/CsvReader.md)\<`T`\>

A CsvReader object with async iterator and stream capabilities.

## Example

```ts
const reader = createCsvReader(Bun.file('data.csv').stream());
for await (const row of reader) {
  console.log(row);
}
```
