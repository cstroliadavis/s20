[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [logging/src](../README.md) / createMemorySink

# Function: createMemorySink()

> **createMemorySink**(): `object`

Creates an in-memory sink that stores log events for test assertions or buffering.

## Returns

`object`

Sink object with handlers to record, read, and clear logs.

### clear

> **clear**: () => `void`

#### Returns

`void`

### getEvents

> **getEvents**: () => [`LogEvent`](../interfaces/LogEvent.md)[]

#### Returns

[`LogEvent`](../interfaces/LogEvent.md)[]

### handler

> **handler**: (`event`) => `void`

#### Parameters

##### event

[`LogEvent`](../interfaces/LogEvent.md)

#### Returns

`void`

## Example

```ts
const memory = createMemorySink();
logger.on('log', memory.handler);
const captured = memory.getEvents();
```
