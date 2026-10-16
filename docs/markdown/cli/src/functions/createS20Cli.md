[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [cli/src](../README.md) / createS20Cli

# Function: createS20Cli()

> **createS20Cli**(`deps`): [`CliToolInstance`](../interfaces/CliToolInstance.md)

Creates and initializes an S20 Command Line Interface presentation instance from the YAML schema.

## Parameters

### deps

[`CliDependencies`](../interfaces/CliDependencies.md)

Injected CLI dependencies including the application service and optional schema path

## Returns

[`CliToolInstance`](../interfaces/CliToolInstance.md)

Fully configured CLI tool instance ready for execution and shell completion

## Example

```ts
const config = createDefaultConfig();
const storage = createMemoryStorage();
const service = createS20Service({ config, storage });
const cli = createS20Cli({ service });

await cli.execute(['Ticket 5260', '--duration=1.5']);
// Records an event for 'Ticket 5260' and logs confirmation to console
```
