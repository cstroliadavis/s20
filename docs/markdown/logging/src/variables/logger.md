[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [logging/src](../README.md) / logger

# Variable: logger

> `const` **logger**: [`LoggerSingleton`](../interfaces/LoggerSingleton.md)

Global logger instance for logging, updating configuration, and registering plugins.

Can be called as a function with a page context to create a scoped logger:
`const log = logger({ name: 'storage.ts' })`.

## Example

```ts
import { logger } from '@s20/logging';

const log = logger({ name: 'storage.ts' });
log.info('Event persisted', { id: 1 });
```
