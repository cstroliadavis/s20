[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [cli/src](../README.md) / CommandConfig

# Interface: CommandConfig

Configuration schema for a CLI command.

## Properties

### description?

> `optional` **description?**: `string`

Summary of what the command performs for help screens.

***

### isDefault?

> `optional` **isDefault?**: `boolean`

If true, executes this command when no command name is provided.

***

### name

> **name**: `string`

Command verb or name invoked on the CLI.

***

### params?

> `optional` **params?**: [`ParamConfig`](ParamConfig.md)[]

List of parameters and options accepted by this command.

***

### triggers

> **triggers**: `string`

Event topic name triggered when this command executes.
