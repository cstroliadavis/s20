[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [csv/src](../README.md) / CsvReader

# Interface: CsvReader\<T\>

Asynchronous streaming reader for reading and transforming CSV data.

Provides async iteration (`for await`), Web Stream integration, pipeline transformations, and
array collection.

## Example

```ts
const reader = createCsvReader<CsvRecord>(stream, { columns: true });
for await (const record of reader) {
  console.log(record.name);
  // record is typed as CsvRecord
}
```

## Type Parameters

### T

`T` = [`CsvRow`](../type-aliases/CsvRow.md) \| [`CsvRecord`](../type-aliases/CsvRecord.md)

The parsed item type yielded by the reader: either `CsvRow` (an array of cell
  strings) when parsing raw rows, or `CsvRecord` (an object of header-keyed strings) when
  `columns: true` is configured.

## Methods

### \[asyncIterator\]()

> **\[asyncIterator\]**(): `AsyncIterator`\<`T`\>

Enables asynchronous iteration over parsed CSV rows or records using `for await...of`.

#### Returns

`AsyncIterator`\<`T`\>

An async iterator yielding items of type `T` (`CsvRow` array or `CsvRecord` object).

#### Example

```ts
for await (const row of reader) {
  console.log(row);
  // Iterates row by row without buffering full file
}
```

***

### lines()

> **lines**(): `AsyncIterable`\<`string`\>

Streams the parsed items back out as formatted CSV string lines.

Useful for piping or streaming re-formatted CSV text to HTTP responses or loggers.

#### Returns

`AsyncIterable`\<`string`\>

An async iterable yielding serialized CSV text lines one by one.

#### Example

```ts
for await (const line of reader.lines()) {
  process.stdout.write(line);
  // Prints each formatted CSV line
}
```

***

### pipeThrough()

> **pipeThrough**\<`U`\>(`transform`): `ReadableStream`\<`U`\>

Pipes the reader's items through a standard Web `TransformStream`.

#### Type Parameters

##### U

`U`

The output type produced by the transform stream.

#### Parameters

##### transform

`TransformStream`\<`T`, `U`\>

Standard Web TransformStream converting type `T` to type `U`.

#### Returns

`ReadableStream`\<`U`\>

A ReadableStream emitting transformed items of type `U`.

#### Example

```ts
const upperStream = reader.pipeThrough(customTransform);
// Chains web streams together
```

***

### stream()

> **stream**(): `ReadableStream`\<`T`\>

Converts the reader into a standard Web `ReadableStream`.

Enables streaming integration with standard Web APIs like `Response`, `fetch`, and pipes.

#### Returns

`ReadableStream`\<`T`\>

A ReadableStream yielding items of type `T`.

#### Example

```ts
const stream = reader.stream();
return new Response(stream);
// Returns web stream response
```

***

### toArray()

> **toArray**(): `Promise`\<`T`[]\>

Collects all parsed items from the stream into an in-memory array.

#### Returns

`Promise`\<`T`[]\>

A promise resolving to an array of all parsed items of type `T`.

#### Example

```ts
const allRows = await reader.toArray();
// Resolves when entire stream is read
```
