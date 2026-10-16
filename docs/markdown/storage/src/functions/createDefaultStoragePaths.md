[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [storage/src](../README.md) / createDefaultStoragePaths

# Function: createDefaultStoragePaths()

> **createDefaultStoragePaths**(`baseDir?`): [`StoragePaths`](../interfaces/StoragePaths.md)

Creates default local filesystem storage paths resolved against a base directory.

## Parameters

### baseDir?

`string` = `...`

Base root directory for data file resolution (defaults to process.cwd())

## Returns

[`StoragePaths`](../interfaces/StoragePaths.md)

Resolved StoragePaths configuration

## Example

```ts
const paths = createDefaultStoragePaths('/path/to/project');
// Returns paths with eventsFilePath resolving to '/path/to/project/data/events.csv'
```
