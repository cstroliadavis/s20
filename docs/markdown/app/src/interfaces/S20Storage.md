[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [app/src](../README.md) / S20Storage

# Interface: S20Storage

Persistence port contract for reading and persisting S20 events and tasks across any storage backend.

## Properties

### appendEvent

> **appendEvent**: (`event`) => `Promise`\<`void`\>

Appends a newly created event record to persistent storage.

#### Parameters

##### event

[`EventRecord`](EventRecord.md)

#### Returns

`Promise`\<`void`\>

***

### appendTask

> **appendTask**: (`task`) => `Promise`\<`void`\>

Appends a newly created task record to persistent storage.

#### Parameters

##### task

[`TaskRecord`](TaskRecord.md)

#### Returns

`Promise`\<`void`\>

***

### getEvents

> **getEvents**: () => `Promise`\<[`EventRecord`](EventRecord.md)[]\>

Retrieves all chronological event records from storage.

#### Returns

`Promise`\<[`EventRecord`](EventRecord.md)[]\>

***

### getTasks

> **getTasks**: () => `Promise`\<[`TaskRecord`](TaskRecord.md)[]\>

Retrieves all aggregate task records from storage.

#### Returns

`Promise`\<[`TaskRecord`](TaskRecord.md)[]\>

***

### init

> **init**: () => `Promise`\<`void`\>

Initializes the underlying storage backend if needed.

#### Returns

`Promise`\<`void`\>

***

### saveTasks

> **saveTasks**: (`tasks`) => `Promise`\<`void`\>

Saves the updated collection of aggregate task records to storage.

#### Parameters

##### tasks

[`TaskRecord`](TaskRecord.md)[]

#### Returns

`Promise`\<`void`\>
