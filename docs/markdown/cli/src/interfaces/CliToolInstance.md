[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [cli/src](../README.md) / CliToolInstance

# Interface: CliToolInstance

Core interface representing an initialized CLI tool application instance.

## Properties

### execute

> **execute**: (`options?`) => `Promise`\<[`ParsedCommandResult`](ParsedCommandResult.md)\>

Executes CLI parsing and triggers registered event listeners.

#### Parameters

##### options?

`string`[] \| [`ExecutionOptions`](ExecutionOptions.md)

Execution options or raw arguments

#### Returns

`Promise`\<[`ParsedCommandResult`](ParsedCommandResult.md)\>

Promise resolving to parsed command result

***

### generateCompletionScript

> **generateCompletionScript**: (`shell`) => `string`

Generates a shell completion script for the given shell.

#### Parameters

##### shell

[`CompletionShell`](../type-aliases/CompletionShell.md)

Target shell ('bash', 'fish', or 'zsh')

#### Returns

`string`

Generated shell completion script string

***

### getCommand

> **getCommand**: (`name?`) => [`CommandConfig`](CommandConfig.md) \| `undefined`

Retrieves a command configuration by its name.

#### Parameters

##### name?

`string`

Command name

#### Returns

[`CommandConfig`](CommandConfig.md) \| `undefined`

Command configuration if found

***

### getCompletions

> **getCompletions**: (`args`) => `Promise`\<[`CompletionItem`](CompletionItem.md)[]\>

Resolves completion suggestions for the provided argument list.

#### Parameters

##### args

`string`[]

Current command line argument tokens

#### Returns

`Promise`\<[`CompletionItem`](CompletionItem.md)[]\>

Promise resolving to array of completion suggestions

***

### getConfig

> **getConfig**: () => [`CliConfig`](CliConfig.md)

Retrieves the active CLI configuration.

#### Returns

[`CliConfig`](CliConfig.md)

Active CLI configuration

***

### getHelp

> **getHelp**: (`commandName?`) => `string`

Renders help documentation for a command or general usage.

#### Parameters

##### commandName?

`string`

Optional command name

#### Returns

`string`

Formatted help text

***

### on

> **on**: (`eventName`, `handler`) => `CliToolInstance`

Registers an event callback for a specific command trigger.

#### Parameters

##### eventName

`string`

Event trigger name

##### handler

[`EventHandler`](../type-aliases/EventHandler.md)

Event callback handler

#### Returns

`CliToolInstance`

CLI tool instance for chaining

***

### parse

> **parse**: (`args`) => [`ParsedCommandResult`](ParsedCommandResult.md)

Parses argument tokens without triggering event handlers.

#### Parameters

##### args

`string`[]

Command argument tokens

#### Returns

[`ParsedCommandResult`](ParsedCommandResult.md)

Parsed command result
