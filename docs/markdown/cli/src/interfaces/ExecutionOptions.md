[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [cli/src](../README.md) / ExecutionOptions

# Interface: ExecutionOptions

Options passed to customize CLI execution at runtime.

## Properties

### args?

> `optional` **args?**: `string`[]

Custom argument list overriding process.argv.

***

### input?

> `optional` **input?**: `ReadableStream` & `object`

Optional input stream for interactive prompts.

#### Type Declaration

##### setRawMode?

> `optional` **setRawMode?**: (`mode`) => `void`

###### Parameters

###### mode

`boolean`

###### Returns

`void`

***

### output?

> `optional` **output?**: `WritableStream`

Optional output stream for interactive prompts and help display.

***

### stdinContent?

> `optional` **stdinContent?**: `string`

Simulated or piped standard input string.
