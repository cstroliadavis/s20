[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [yaml/src](../README.md) / YamlLine

# Interface: YamlLine

Represents a preprocessed line of YAML source text.

## Properties

### indent

> `readonly` **indent**: `number`

Number of leading whitespace indentation spaces on the line.

***

### isEmpty

> `readonly` **isEmpty**: `boolean`

Indicates whether the line is empty or contains only comments.

***

### lineNumber

> `readonly` **lineNumber**: `number`

1-based line number in the source input.

***

### raw

> `readonly` **raw**: `string`

Original unmodified line content.

***

### text

> `readonly` **text**: `string`

Stripped line content with leading indentation and comments removed.
