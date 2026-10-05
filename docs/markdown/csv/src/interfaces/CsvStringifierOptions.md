[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [csv/src](../README.md) / CsvStringifierOptions

# Interface: CsvStringifierOptions

Configuration options controlling CSV serialization and formatting.

## Properties

### columns?

> `optional` **columns?**: `string`[]

List of column keys to include and their ordering when stringifying records.

***

### delimiter?

> `optional` **delimiter?**: `string`

Field separator character written between cells.

#### Default Value

`','`

***

### escape?

> `optional` **escape?**: `string`

Escape character used for doubling quotes inside quoted fields.

#### Default Value

`'"'`

***

### header?

> `optional` **header?**: `boolean`

Whether to automatically output an initial header row when stringifying record objects.

#### Default Value

`true`

***

### lineBreak?

> `optional` **lineBreak?**: "\n" \| "\r\n"

End-of-line delimiter written after each row.

#### Default Value

`'\r\n'`

***

### quote?

> `optional` **quote?**: `string`

Quote character used to enclose cell values requiring quoting.

#### Default Value

`'"'`

***

### quoted?

> `optional` **quoted?**: `boolean`

When `true`, forces enclosing double quotes around every cell, even if unneeded.

#### Default Value

`false`
