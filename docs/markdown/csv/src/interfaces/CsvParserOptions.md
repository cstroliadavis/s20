[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [csv/src](../README.md) / CsvParserOptions

# Interface: CsvParserOptions

Configuration options controlling CSV parsing behavior and header mapping.

## Properties

### columns?

> `optional` **columns?**: `boolean` \| `string`[]

Column configuration for record mapping.

Set to `true` to use the first row as headers, or pass an array of string column names.
When omitted or `false`, the parser emits array rows (`CsvRow`).

***

### delimiter?

> `optional` **delimiter?**: `string`

Field separator character separating individual cells on each line.

#### Default Value

`','`

***

### escape?

> `optional` **escape?**: `string`

Escape character used for quoted fields.

#### Default Value

`'"'`

***

### quote?

> `optional` **quote?**: `string`

Quote character wrapping fields containing delimiters, newlines, or quotes.

#### Default Value

`'"'`

***

### skipEmptyLines?

> `optional` **skipEmptyLines?**: `boolean`

Whether lines with no content or only whitespace should be skipped.

#### Default Value

`false`

***

### trim?

> `optional` **trim?**: `boolean`

Whether unquoted leading and trailing whitespace should be stripped from cells.

#### Default Value

`false`
