[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [cli/src](../README.md) / promptSelect

# Function: promptSelect()

> **promptSelect**(`options`): `Promise`\<`string` \| `number`\>

Prompts user interactively to select an item using arrow keys or filtering.

## Parameters

### options

[`SelectPromptOptions`](../interfaces/SelectPromptOptions.md)

Configuration options for the select prompt

## Returns

`Promise`\<`string` \| `number`\>

Selected choice value

## Example

```ts
const choice = await promptSelect({ items: ['dev', 'prod'], paramName: 'env' });
// Prompts user and returns chosen string or number
```
