[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [csv/src](../README.md) / createCsvWriter

# Function: createCsvWriter()

> **createCsvWriter**(`destination`, `options?`): [`CsvWriter`](../interfaces/CsvWriter.md)

Creates a streaming CSV writer targeting a file path or WritableStream sink.

## Parameters

### destination

`string` \| `WritableStream`\<`string` \| `Uint8Array`\<`ArrayBufferLike`\>\>

Target file path string or WritableStream.

### options?

[`CsvStringifierOptions`](../interfaces/CsvStringifierOptions.md) = `{}`

Stringifier configuration options.

## Returns

[`CsvWriter`](../interfaces/CsvWriter.md)

A CsvWriter instance.

## Example

```ts
const writer = createCsvWriter('output.csv');
await writer.writeRow(['Name', 'Score']);
await writer.writeRow(['Alice', 95]);
await writer.close();
```
