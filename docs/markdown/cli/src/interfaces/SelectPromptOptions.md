[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [cli/src](../README.md) / SelectPromptOptions

# Interface: SelectPromptOptions

Configuration options for an interactive terminal select prompt.

## Properties

### allowCustom?

> `optional` **allowCustom?**: `boolean`

Whether the user can enter a custom value not present in `items`.

***

### input?

> `optional` **input?**: `ReadableStream` & `object`

Readable terminal input stream.

#### Type Declaration

##### setRawMode?

> `optional` **setRawMode?**: (`mode`) => `void`

###### Parameters

###### mode

`boolean`

###### Returns

`void`

***

### items

> **items**: (`string` \| `number`)[]

Selectable option values displayed in the menu.

***

### output?

> `optional` **output?**: `WritableStream`

Writable terminal output stream.

***

### paramName

> **paramName**: `string`

Name of the parameter being prompted.
