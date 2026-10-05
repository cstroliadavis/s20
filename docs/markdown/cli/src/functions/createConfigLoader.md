[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [cli/src](../README.md) / createConfigLoader

# Function: createConfigLoader()

> **createConfigLoader**(`defaultCwd?`): `object`

Creates a configuration loader for reading and validating CLI configuration files.

## Parameters

### defaultCwd?

`string` = `...`

Working directory for config resolution

## Returns

Config loader instance

### loadFromFile

> **loadFromFile**: (`filePath?`, `customCwd?`) => [`CliConfig`](../interfaces/CliConfig.md)

Loads configuration from a file path or standard candidate.

#### Parameters

##### filePath?

`string`

##### customCwd?

`string`

#### Returns

[`CliConfig`](../interfaces/CliConfig.md)

### parseConfigString

> **parseConfigString**: (`content`) => [`CliConfig`](../interfaces/CliConfig.md)

Parses and validates raw configuration text (YAML or JSON).

#### Parameters

##### content

`string`

#### Returns

[`CliConfig`](../interfaces/CliConfig.md)

### validateCliConfig

> **validateCliConfig**: (`config`) => `void`

Validates the entire CLI schema configuration.

#### Parameters

##### config

[`CliConfig`](../interfaces/CliConfig.md)

#### Returns

`void`

## Example

```ts
const loader = createConfigLoader();
const config = loader.loadFromFile('cli.yaml');
// Returns validated CliConfig
```
