[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [logging/src](../README.md) / loggerPlugins

# Variable: loggerPlugins

> `const` **loggerPlugins**: `Readonly`\<\{ `jsonlFile`: (`logger`, `options?`) => [`Unsubscribe`](../type-aliases/Unsubscribe.md); \}\>

Bundled logger plugins for S20 CLI file logging.

## Example

```ts
import { logger, loggerPlugins } from '@s20/logging';

logger.use(loggerPlugins.jsonlFile, { maxRows: 5000 });
```
