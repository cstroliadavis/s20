[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [csv/src](../README.md) / stringifyCsvStream

# Function: stringifyCsvStream()

> **stringifyCsvStream**(`items`, `options?`): `AsyncGenerator`\<`string`\>

Asynchronously streams formatted CSV chunks from rows or records.

## Parameters

### items

`AsyncIterable`\<`Record`\<`string`, [`CsvValue`](../type-aliases/CsvValue.md)\> \| [`CsvValue`](../type-aliases/CsvValue.md)[]\>

An async iterable yielding rows (CsvValue[]) or records.

### options?

[`CsvStringifierOptions`](../interfaces/CsvStringifierOptions.md) = `{}`

Configuration options for delimiter, quote, escaping, and line breaks.

## Returns

`AsyncGenerator`\<`string`\>

An async generator yielding serialized CSV text lines.

## Example

```ts
for await (const line of stringifyCsvStream(rows)) {
  writer.write(line);
  // Stream lines directly to destination
}
```
