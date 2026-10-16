[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [app/src](../README.md) / createS20Service

# Function: createS20Service()

> **createS20Service**(`deps`): [`S20Service`](../interfaces/S20Service.md)

Creates S20 application service coordinating time calculations, task rules, and storage.

## Parameters

### deps

[`ServiceDependencies`](../interfaces/ServiceDependencies.md)

Config and storage port dependencies

## Returns

[`S20Service`](../interfaces/S20Service.md)

Application service instance

## Example

```ts
const config = createDefaultConfig();
const storage = createMemoryStorage();
const service = createS20Service({ config, storage });

const event = await service.recordEvent({ task: 'Ticket 5260' });
// Records event and updates aggregate task via the injected storage port
```
