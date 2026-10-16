[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [app/src](../README.md) / S20Service

# Interface: S20Service

Public contract of the S20 application service.

## Properties

### getTaskSuggestions

> **getTaskSuggestions**: () => `Promise`\<`string`[]\>

Retrieves ranked unique task names with unfinished tasks prioritized first.

#### Returns

`Promise`\<`string`[]\>

***

### listEvents

> **listEvents**: () => `Promise`\<[`EventRecord`](EventRecord.md)[]\>

Lists all chronological event records.

#### Returns

`Promise`\<[`EventRecord`](EventRecord.md)[]\>

***

### listTasks

> **listTasks**: () => `Promise`\<[`TaskRecord`](TaskRecord.md)[]\>

Lists all aggregate task records.

#### Returns

`Promise`\<[`TaskRecord`](TaskRecord.md)[]\>

***

### recordEvent

> **recordEvent**: (`options`) => `Promise`\<[`EventRecord`](EventRecord.md)\>

Records a new tracking event and synchronizes the aggregate task state.

#### Parameters

##### options

[`AddEventOptions`](AddEventOptions.md)

#### Returns

`Promise`\<[`EventRecord`](EventRecord.md)\>
