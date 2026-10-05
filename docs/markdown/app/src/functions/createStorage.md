[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [app/src](../README.md) / createStorage

# Function: createStorage()

> **createStorage**(`config`): `object`

Creates storage engine for managing S20 CSV events and tasks.

## Parameters

### config

[`S20Config`](../interfaces/S20Config.md)

S20 configuration settings

## Returns

`object`

Storage interface

### addEvent

> **addEvent**: (`event`) => `Promise`\<[`EventRecord`](../interfaces/EventRecord.md)\>

#### Parameters

##### event

[`EventInput`](../interfaces/EventInput.md)

#### Returns

`Promise`\<[`EventRecord`](../interfaces/EventRecord.md)\>

### getEvents

> **getEvents**: () => `Promise`\<[`EventRecord`](../interfaces/EventRecord.md)[]\>

#### Returns

`Promise`\<[`EventRecord`](../interfaces/EventRecord.md)[]\>

### getTasks

> **getTasks**: () => `Promise`\<[`TaskRecord`](../interfaces/TaskRecord.md)[]\>

#### Returns

`Promise`\<[`TaskRecord`](../interfaces/TaskRecord.md)[]\>

### getTaskSuggestions

> **getTaskSuggestions**: () => `Promise`\<`string`[]\>

#### Returns

`Promise`\<`string`[]\>

### init

> **init**: () => `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

## Example

```ts
const config = createDefaultConfig();
const storage = createStorage(config);

const events = await storage.getEvents();
// Returns array of EventRecord entries from events.csv
```
