[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [app/src](../README.md) / createS20Cli

# Function: createS20Cli()

> **createS20Cli**(`deps`): [`CliToolInstance`](../../../cli/src/interfaces/CliToolInstance.md)

Creates and initializes an S20 Command Line Interface application instance from the YAML schema.

## Parameters

### deps

[`CliDependencies`](../interfaces/CliDependencies.md)

Injected CLI dependencies including service, storage, and configuration options

## Returns

[`CliToolInstance`](../../../cli/src/interfaces/CliToolInstance.md)

Fully configured CLI tool instance ready for execution and shell completion

## Example

```ts
const config = createDefaultConfig();
const storage = createStorage(config);
const service = createS20Service({ config, storage });
const cli = createS20Cli({ config, service, storage });

await cli.execute(['Ticket 5260', '--duration=1.5']);
// Records an event for 'Ticket 5260' and logs confirmation to console
```
