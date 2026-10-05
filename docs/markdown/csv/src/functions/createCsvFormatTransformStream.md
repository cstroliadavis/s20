[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [csv/src](../README.md) / createCsvFormatTransformStream

# Function: createCsvFormatTransformStream()

> **createCsvFormatTransformStream**(`options?`): `TransformStream`\<`Record`\<`string`, [`CsvValue`](../type-aliases/CsvValue.md)\> \| [`CsvValue`](../type-aliases/CsvValue.md)[], `string`\>

Creates a TransformStream that serializes rows or records into formatted CSV text.

## Parameters

### options?

[`CsvStringifierOptions`](../interfaces/CsvStringifierOptions.md) = `{}`

Stringifier options such as delimiter, lineBreak, and headers.

## Returns

`TransformStream`\<`Record`\<`string`, [`CsvValue`](../type-aliases/CsvValue.md)\> \| [`CsvValue`](../type-aliases/CsvValue.md)[], `string`\>

A TransformStream that emits formatted CSV text chunks.

## Example

```ts
const formatStream = createCsvFormatTransformStream({ lineBreak: '\n' });
// Formats row objects or arrays into CSV string lines
```
