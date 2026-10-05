[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [csv/src](../README.md) / CsvStringifier

# Interface: CsvStringifier

Low-level CSV stringifier providing row and record serialization methods.

## Methods

### stringifyRecord()

> **stringifyRecord**(`record`): `string`

Serializes a single key-value record object into a CSV string line.

#### Parameters

##### record

`Record`\<`string`, [`CsvValue`](../type-aliases/CsvValue.md)\>

Object mapping column names to cell values.

#### Returns

`string`

Formatted CSV line including line break.

#### Example

```ts
const line = stringifier.stringifyRecord({ age: 30, name: 'Alice' });
// "Alice,30\r\n"
```

***

### stringifyRecords()

> **stringifyRecords**(`records`): `string`

Serializes an iterable collection of record objects into CSV text with a header.

#### Parameters

##### records

`Iterable`\<`Record`\<`string`, [`CsvValue`](../type-aliases/CsvValue.md)\>\>

Iterable collection of key-value records.

#### Returns

`string`

Complete formatted CSV text.

#### Example

```ts
const csv = stringifier.stringifyRecords([{ x: 1 }]);
// "x\r\n1\r\n"
```

***

### stringifyRow()

> **stringifyRow**(`row`): `string`

Serializes a single row of cell values into a CSV line.

#### Parameters

##### row

[`CsvValue`](../type-aliases/CsvValue.md)[]

Array of cell values to serialize.

#### Returns

`string`

Formatted CSV line including line break.

#### Example

```ts
const line = stringifier.stringifyRow(['Alice', 95]);
// "Alice,95\r\n"
```

***

### stringifyRows()

> **stringifyRows**(`rows`): `string`

Serializes an iterable collection of array rows into formatted CSV text.

#### Parameters

##### rows

`Iterable`\<[`CsvValue`](../type-aliases/CsvValue.md)[]\>

Iterable collection of row arrays.

#### Returns

`string`

Complete formatted CSV text.

#### Example

```ts
const csv = stringifier.stringifyRows([['a', 'b'], ['1', '2']]);
// "a,b\r\n1,2\r\n"
```
