[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [app/src](../README.md) / createS20Service

# Function: createS20Service()

> **createS20Service**(`deps`): `object`

Creates S20 application service coordinating time calculations and storage.

## Parameters

### deps

[`ServiceDependencies`](../interfaces/ServiceDependencies.md)

Config and storage dependencies

## Returns

Application service instance

### getTaskSuggestions

> **getTaskSuggestions**: () => `Promise`\<`string`[]\>

#### Returns

`Promise`\<`string`[]\>

### listEvents

> **listEvents**: () => `Promise`\<[`EventRecord`](../interfaces/EventRecord.md)[]\>

#### Returns

`Promise`\<[`EventRecord`](../interfaces/EventRecord.md)[]\>

### listTasks

> **listTasks**: () => `Promise`\<[`TaskRecord`](../interfaces/TaskRecord.md)[]\>

#### Returns

`Promise`\<[`TaskRecord`](../interfaces/TaskRecord.md)[]\>

### recordEvent

> **recordEvent**: (`options`) => `Promise`\<[`EventRecord`](../interfaces/EventRecord.md)\>

Records an event and updates task records.

#### Parameters

##### options

[`AddEventOptions`](../interfaces/AddEventOptions.md)

#### Returns

`Promise`\<[`EventRecord`](../interfaces/EventRecord.md)\>

## Example

```ts
const config = createDefaultConfig();
const storage = createStorage(config);
const service = createS20Service({ config, storage });

const event = await service.recordEvent({ task: 'Ticket 5260' });
// Records event in events.csv and updates tasks.csv
```
