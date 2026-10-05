[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [cli/src](../README.md) / formatCompletionsForShell

# Function: formatCompletionsForShell()

> **formatCompletionsForShell**(`items`, `shell?`): `string`

Formats completion candidate items according to the requested shell protocol.

## Parameters

### items

[`CompletionItem`](../interfaces/CompletionItem.md)[]

Array of completion items

### shell?

[`CompletionShell`](../type-aliases/CompletionShell.md)

Optional target shell environment

## Returns

`string`

Newline-delimited formatted completion string

## Example

```ts
const output = formatCompletionsForShell([{ value: 'build' }], 'bash');
```
