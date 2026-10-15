[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [logging/src](../README.md) / createEventEmitter

# Function: createEventEmitter()

> **createEventEmitter**(): `object`

Creates an event bus for subscribing to and broadcasting log events.

## Returns

`object`

An emitter with subscription and dispatch methods.

### clear

> **clear**: () => `void`

#### Returns

`void`

### emit

> **emit**: (`event`, `payload`) => `void`

#### Parameters

##### event

[`LogEventType`](../type-aliases/LogEventType.md)

##### payload

[`LogEvent`](../interfaces/LogEvent.md)

#### Returns

`void`

### listenerCount

> **listenerCount**: (`event`) => `number`

#### Parameters

##### event

[`LogEventType`](../type-aliases/LogEventType.md)

#### Returns

`number`

### off

> **off**: (`event`, `handler`) => `void`

#### Parameters

##### event

[`LogEventType`](../type-aliases/LogEventType.md)

##### handler

[`LogHandler`](../type-aliases/LogHandler.md)

#### Returns

`void`

### on

> **on**: (`event`, `handler`) => [`Unsubscribe`](../type-aliases/Unsubscribe.md)

#### Parameters

##### event

[`LogEventType`](../type-aliases/LogEventType.md)

##### handler

[`LogHandler`](../type-aliases/LogHandler.md)

#### Returns

[`Unsubscribe`](../type-aliases/Unsubscribe.md)

## Example

```ts
const emitter = createEventEmitter();
const unsubscribe = emitter.on('log', (event) => {
  console.log(event.message);
});
emitter.emit('info', eventPayload);
unsubscribe();
```
