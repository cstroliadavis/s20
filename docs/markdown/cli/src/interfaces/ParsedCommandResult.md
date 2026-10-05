[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [cli/src](../README.md) / ParsedCommandResult

# Interface: ParsedCommandResult

Result payload generated after successfully parsing command line input.

## Properties

### command

> **command**: [`CommandConfig`](CommandConfig.md)

Matched command configuration.

***

### config

> **config**: [`CliConfig`](CliConfig.md)

Active top-level CLI configuration.

***

### params

> **params**: `Record`\<`string`, `unknown`\>

Coerced and validated parameter dictionary.

***

### rawArgs

> **rawArgs**: `string`[]

Unparsed or raw argument tokens passed to the command.

***

### triggers

> **triggers**: `string`

Event topic name triggered by this command.
