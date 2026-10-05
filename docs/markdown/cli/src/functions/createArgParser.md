[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [cli/src](../README.md) / createArgParser

# Function: createArgParser()

> **createArgParser**(`coercer?`): `object`

Creates an argument parser for processing command tokens.

## Parameters

### coercer?

Parameter coercion utility

#### coerce

(`param`, `rawValue`, `options?`) => `unknown`

## Returns

Argument parser instance

### parseCommandArgs

> **parseCommandArgs**: (`command`, `rawArgs`, `options?`) => `Record`\<`string`, `unknown`\>

Parses command arguments and maps them to defined parameters.

#### Parameters

##### command

[`CommandConfig`](../interfaces/CommandConfig.md)

##### rawArgs

`string`[]

##### options?

###### cwd?

`string`

###### stdinContent?

`string`

#### Returns

`Record`\<`string`, `unknown`\>

## Example

```ts
const parser = createArgParser();
const params = parser.parseCommandArgs(cmdConfig, ['--flag', 'value']);
// Returns parsed and coerced parameter record
```
