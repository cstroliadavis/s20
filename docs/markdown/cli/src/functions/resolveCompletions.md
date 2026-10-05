[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [cli/src](../README.md) / resolveCompletions

# Function: resolveCompletions()

> **resolveCompletions**(`config`, `rawArgs`): `Promise`\<[`CompletionItem`](../interfaces/CompletionItem.md)[]\>

Resolves context-aware tab completion suggestions for commands, flags, and select items.

## Parameters

### config

[`CliConfig`](../interfaces/CliConfig.md)

CLI configuration specification

### rawArgs

`string`[]

Array of tokens currently entered on the command line

## Returns

`Promise`\<[`CompletionItem`](../interfaces/CompletionItem.md)[]\>

Array of completion suggestions

## Example

```ts
const completions = await resolveCompletions(config, ['deploy', '--env']);
// Returns completions matching select items for --env
```
