[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [csv/src](../README.md) / createCsvTransformStream

# Function: createCsvTransformStream()

> **createCsvTransformStream**\<`T`\>(`options?`): `TransformStream`\<`string` \| `Uint8Array`\<`ArrayBufferLike`\>, `T`\>

Creates a TransformStream that transforms chunks into parsed CSV rows or records.

## Type Parameters

### T

`T` = [`CsvRecord`](../type-aliases/CsvRecord.md) \| [`CsvRow`](../type-aliases/CsvRow.md)

The parsed row type emitted by the transform (`CsvRow` array or `CsvRecord` object).

## Parameters

### options?

[`CsvParserOptions`](../interfaces/CsvParserOptions.md) = `{}`

Parser options such as delimiter, quote, headers, and trim.

## Returns

`TransformStream`\<`string` \| `Uint8Array`\<`ArrayBufferLike`\>, `T`\>

A TransformStream that emits parsed rows or records.

## Example

```ts
const stream = fileStream.pipeThrough(createCsvTransformStream({ columns: true }));
// Stream now yields parsed record objects
```
