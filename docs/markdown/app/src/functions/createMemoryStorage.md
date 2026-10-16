[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [app/src](../README.md) / createMemoryStorage

# Function: createMemoryStorage()

> **createMemoryStorage**(): [`S20Storage`](../interfaces/S20Storage.md)

Creates an isolated in-memory storage adapter implementing the S20Storage port.

## Returns

[`S20Storage`](../interfaces/S20Storage.md)

S20Storage instance backed by in-memory arrays

## Example

```ts
const storage = createMemoryStorage();
const service = createS20Service({ config: createDefaultConfig(), storage });
await service.recordEvent({ task: 'Ticket 5260' });
// Persists event and task in memory without filesystem access
```
