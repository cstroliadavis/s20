[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [cli/src](../README.md) / createHelpFormatter

# Function: createHelpFormatter()

> **createHelpFormatter**(`config`): `object`

Creates a help formatter instance for CLI usage and documentation rendering.

## Parameters

### config

[`CliConfig`](../interfaces/CliConfig.md)

Active CLI configuration

## Returns

Help formatter instance

### render

> **render**: (`commandName?`) => `string`

Renders help for a specific command or general overview.

#### Parameters

##### commandName?

`string`

#### Returns

`string`

### renderCommandHelp

> **renderCommandHelp**: (`cmd`) => `string`

#### Parameters

##### cmd

[`CommandConfig`](../interfaces/CommandConfig.md)

#### Returns

`string`

### renderGeneralHelp

> **renderGeneralHelp**: () => `string`

#### Returns

`string`

## Example

```ts
const formatter = createHelpFormatter(config);
const helpText = formatter.renderGeneralHelp();
// Generates full CLI usage help string
```
