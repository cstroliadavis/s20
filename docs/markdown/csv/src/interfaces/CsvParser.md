[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [csv/src](../README.md) / CsvParser

# Interface: CsvParser

Low-level, push-based stateful CSV parser instance.

## Methods

### end()

> **end**(): ([`CsvRecord`](../type-aliases/CsvRecord.md) \| [`CsvRow`](../type-aliases/CsvRow.md))[]

Signals the end of input and returns any remaining completed rows from buffered data.

#### Returns

([`CsvRecord`](../type-aliases/CsvRecord.md) \| [`CsvRow`](../type-aliases/CsvRow.md))[]

Array of parsed rows or records flushed from the parser.

#### Example

```ts
const finalRows = parser.end();
// Flushes any trailing rows
```

***

### parse()

> **parse**(`text`): ([`CsvRecord`](../type-aliases/CsvRecord.md) \| [`CsvRow`](../type-aliases/CsvRow.md))[]

Parses an entire CSV string synchronously in one step.

Resets internal state before parsing and flushes all completed rows.

#### Parameters

##### text

`string`

Complete CSV text content to parse.

#### Returns

([`CsvRecord`](../type-aliases/CsvRecord.md) \| [`CsvRow`](../type-aliases/CsvRow.md))[]

Array of parsed rows or records.

#### Example

```ts
const rows = parser.parse('a,b\n1,2');
// [['a', 'b'], ['1', '2']]
```

***

### reset()

> **reset**(): `void`

Resets the parser state machine so the instance can be reused for new input.

#### Returns

`void`

#### Example

```ts
parser.reset();
// Ready for fresh CSV input
```

***

### write()

> **write**(`chunk`): ([`CsvRecord`](../type-aliases/CsvRecord.md) \| [`CsvRow`](../type-aliases/CsvRow.md))[]

Writes an incoming text chunk to the parser and returns newly completed rows.

#### Parameters

##### chunk

`string`

Arbitrary string chunk of CSV data.

#### Returns

([`CsvRecord`](../type-aliases/CsvRecord.md) \| [`CsvRow`](../type-aliases/CsvRow.md))[]

Array of rows completed by processing this chunk.

#### Example

```ts
const rows = parser.write('col1,col2\n');
// Returns newly completed rows
```
