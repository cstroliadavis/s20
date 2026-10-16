[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [app/src](../README.md) / createNewTaskRecord

# Function: createNewTaskRecord()

> **createNewTaskRecord**(`event`, `nextId`, `config`): [`TaskRecord`](../interfaces/TaskRecord.md)

Creates a new aggregate task record initialized from its first tracked event.

## Parameters

### event

[`EventInput`](../interfaces/EventInput.md)

Event input triggering task creation

### nextId

`number`

Assigned unique task identifier

### config

[`S20Config`](../interfaces/S20Config.md)

S20 domain configuration for category resolution

## Returns

[`TaskRecord`](../interfaces/TaskRecord.md)

Newly constructed TaskRecord

## Example

```ts
const task = createNewTaskRecord(eventInput, 1, createDefaultConfig());
// Returns initialized TaskRecord with started timestamp and resolved category
```
