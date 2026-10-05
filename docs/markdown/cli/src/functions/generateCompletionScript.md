[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [cli/src](../README.md) / generateCompletionScript

# Function: generateCompletionScript()

> **generateCompletionScript**(`shell`, `cliName`): `string`

Generates an automated shell tab-completion script for Bash, Zsh, or Fish.

## Parameters

### shell

[`CompletionShell`](../type-aliases/CompletionShell.md)

Target shell type

### cliName

`string`

Name of the CLI binary executable

## Returns

`string`

Shell script contents ready for sourcing

## Example

```ts
const script = generateCompletionScript('zsh', 'my-cli');
```
