[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [csv/src](../README.md) / toReadableStream

# Function: toReadableStream()

> **toReadableStream**\<`T`\>(`iterable`): `ReadableStream`\<`T`\>

Converts an async iterable into a Web ReadableStream.

## Type Parameters

### T

`T`

The item type emitted by the readable stream.

## Parameters

### iterable

`AsyncIterable`\<`T`\>

The async iterable to convert.

## Returns

`ReadableStream`\<`T`\>

A ReadableStream yielding items from the iterable.

## Example

```ts
const stream = toReadableStream(generateRows());
```
