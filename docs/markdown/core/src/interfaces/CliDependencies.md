[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [core/src](../README.md) / CliDependencies

# Interface: CliDependencies

External dependencies required to instantiate and execute the S20 CLI.

## Properties

### config

> **config**: [`S20Config`](S20Config.md)

Runtime configuration containing CSV storage file paths and rounding rules.

***

### configPath?

> `optional` **configPath?**: `string`

Optional custom filesystem path to the YAML CLI schema definition file.

***

### service

> **service**: `object`

Application service instance coordinating time calculations, storage, and suggestions.

#### getTaskSuggestions

> **getTaskSuggestions**: () => `Promise`\<`string`[]\>

##### Returns

`Promise`\<`string`[]\>

#### listEvents

> **listEvents**: () => `Promise`\<[`EventRecord`](EventRecord.md)[]\>

##### Returns

`Promise`\<[`EventRecord`](EventRecord.md)[]\>

#### listTasks

> **listTasks**: () => `Promise`\<[`TaskRecord`](TaskRecord.md)[]\>

##### Returns

`Promise`\<[`TaskRecord`](TaskRecord.md)[]\>

#### recordEvent

> **recordEvent**: (`options`) => `Promise`\<[`EventRecord`](EventRecord.md)\>

Records an event and updates task records.

##### Parameters

###### options

[`AddEventOptions`](AddEventOptions.md)

##### Returns

`Promise`\<[`EventRecord`](EventRecord.md)\>

***

### storage

> **storage**: `object`

CSV storage engine instance for direct data inspection and persistence operations.

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
