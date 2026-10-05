[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [csv/src](../README.md) / CsvWriter

# Interface: CsvWriter

Streaming destination sink for writing CSV rows and records to files or writable streams.

## Methods

### close()

> **close**(): `Promise`\<`void`\>

Closes the underlying file or stream sink and flushes any pending buffered data.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the sink is closed.

#### Example

```ts
await writer.close();
// Closes the file writer
```

***

### flush()

> **flush**(): `Promise`\<`void`\>

Flushes any buffered data directly to the destination sink without closing it.

#### Returns

`Promise`\<`void`\>

A promise that resolves when buffered data is flushed.

#### Example

```ts
await writer.flush();
// Ensures all data is written to disk
```

***

### writeAll()

> **writeAll**(`items`): `Promise`\<`void`\>

Writes an iterable collection of rows or records to the sink in sequence.

#### Parameters

##### items

`Iterable`\<`Record`\<`string`, [`CsvValue`](../type-aliases/CsvValue.md)\>, `any`, `any`\> \| `Iterable`\<[`CsvValue`](../type-aliases/CsvValue.md)[], `any`, `any`\>

Iterable of row arrays (`CsvValue[]`) or record objects.

#### Returns

`Promise`\<`void`\>

A promise that resolves when all items have been written.

#### Example

```ts
await writer.writeAll([['a', 1], ['b', 2]]);
// Writes all rows sequentially
```

***

### writeRecord()

> **writeRecord**(`record`): `Promise`\<`void`\>

Serializes and writes a single record object to the destination sink.

Automatically writes a header line on the first record if configured.

#### Parameters

##### record

`Record`\<`string`, [`CsvValue`](../type-aliases/CsvValue.md)\>

Key-value record object to serialize and write.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the record is written.

#### Example

```ts
await writer.writeRecord({ age: 25, name: 'Bob' });
// Writes record line
```

***

### writeRow()

> **writeRow**(`row`): `Promise`\<`void`\>

Serializes and writes a single row of cell values to the destination sink.

#### Parameters

##### row

[`CsvValue`](../type-aliases/CsvValue.md)[]

Array of cell values to serialize and write.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the row is written.

#### Example

```ts
await writer.writeRow(['Charlie', 42]);
// Writes row line
```
