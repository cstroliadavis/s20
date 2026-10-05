[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [csv/src](../README.md) / parseCsvStream

# Function: parseCsvStream()

> **parseCsvStream**\<`T`\>(`source`, `options?`): `AsyncGenerator`\<`T`\>

Asynchronously streams and parses CSV rows from an async iterable or ReadableStream.

## Type Parameters

### T

`T` = [`CsvRecord`](../type-aliases/CsvRecord.md) \| [`CsvRow`](../type-aliases/CsvRow.md)

The parsed row type emitted by the stream (`CsvRow` array or `CsvRecord` object).

## Parameters

### source

`AsyncIterable`\<`string` \| `Uint8Array`\<`ArrayBufferLike`\>, `any`, `any`\> \| `ReadableStream`\<`string` \| `Uint8Array`\<`ArrayBufferLike`\>\>

The async iterable or ReadableStream supplying text or byte chunks.

### options?

[`CsvParserOptions`](../interfaces/CsvParserOptions.md)

Configuration options for delimiter, quotes, headers, and trimming.

## Returns

`AsyncGenerator`\<`T`\>

An async generator yielding parsed rows or records one by one.

## Example

```ts
for await (const row of parseCsvStream(fileStream)) {
  console.log(row);
  // Process row without buffering entire file in memory
}
```
