[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [cli/src](../README.md) / createCli

# Variable: createCli

> `const` **createCli**: (`initOptions`) => [`CliToolInstance`](../interfaces/CliToolInstance.md) = `createCliTool`

Alias for createCliTool.

Creates and initializes a CLI tool application instance.

## Parameters

### initOptions?

`string` \| [`CliConfig`](../interfaces/CliConfig.md) \| [`CliToolOptions`](../interfaces/CliToolOptions.md)

Configuration object, file path, or options

## Returns

[`CliToolInstance`](../interfaces/CliToolInstance.md)

CLI tool application instance

## Example

```ts
const cli = createCliTool({ config: 'cli.yaml' });
cli.on('create-user', ({ params }) => console.log(params));
await cli.execute();
// Executes the CLI and triggers handlers
```
