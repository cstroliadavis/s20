[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [core/src](../README.md) / createDefaultConfig

# Function: createDefaultConfig()

> **createDefaultConfig**(`baseDir?`): [`S20Config`](../interfaces/S20Config.md)

Creates default configuration instance resolved against base directory.

## Parameters

### baseDir?

`string` = `...`

Base root directory for data file resolution

## Returns

[`S20Config`](../interfaces/S20Config.md)

Configured S20 options

## Example

```ts
const config = createDefaultConfig('/path/to/project');
// Returns config with eventsFilePath resolving to '/path/to/project/data/events.csv'
```
