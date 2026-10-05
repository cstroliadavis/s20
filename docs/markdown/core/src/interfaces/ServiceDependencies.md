[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [core/src](../README.md) / ServiceDependencies

# Interface: ServiceDependencies

Service dependencies bundle required to instantiate the S20 service.

## Properties

### config

> **config**: [`S20Config`](S20Config.md)

Global configuration containing rounding rules, durations, and file paths.

***

### storage

> **storage**: `object`

CSV storage engine interface for persisting events and synchronizing tasks.

#### addEvent

> **addEvent**: (`event`) => `Promise`\<[`EventRecord`](EventRecord.md)\>

##### Parameters

###### event

[`EventInput`](EventInput.md)

##### Returns

`Promise`\<[`EventRecord`](EventRecord.md)\>

#### getEvents

> **getEvents**: () => `Promise`\<[`EventRecord`](EventRecord.md)[]\>

##### Returns

`Promise`\<[`EventRecord`](EventRecord.md)[]\>

#### getTasks

> **getTasks**: () => `Promise`\<[`TaskRecord`](TaskRecord.md)[]\>

##### Returns

`Promise`\<[`TaskRecord`](TaskRecord.md)[]\>

#### getTaskSuggestions

> **getTaskSuggestions**: () => `Promise`\<`string`[]\>

##### Returns

`Promise`\<`string`[]\>

#### init

> **init**: () => `Promise`\<`void`\>

##### Returns

`Promise`\<`void`\>
