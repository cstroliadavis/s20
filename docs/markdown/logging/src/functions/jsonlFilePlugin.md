[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [logging/src](../README.md) / jsonlFilePlugin

# Function: jsonlFilePlugin()

> **jsonlFilePlugin**(`logger`, `options?`): [`Unsubscribe`](../type-aliases/Unsubscribe.md)

Attaches a rotating JSONL file writer plugin to the logger, rolling over every `maxRows` (5000).

## Parameters

### logger

[`LoggerTarget`](../interfaces/LoggerTarget.md)

Logger singleton or scoped log function to observe.

### options?

[`JsonlFilePluginOptions`](../interfaces/JsonlFilePluginOptions.md)

Directory, base filename, custom formatter, and row limit options.

## Returns

[`Unsubscribe`](../type-aliases/Unsubscribe.md)

Unsubscribe function to stop writing log events to disk.

## Example

```ts
import { jsonlFilePlugin, logger } from '@s20/logging';

logger.use(jsonlFilePlugin, { logDir: './data/logs', maxRows: 5000 });
```
