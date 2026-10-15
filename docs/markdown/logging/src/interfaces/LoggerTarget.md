[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [logging/src](../README.md) / LoggerTarget

# Interface: LoggerTarget

Event subscription interface implemented by loggers and plugin targets.

## Properties

### off

> **off**: (`event`, `handler`) => `void`

Removes a previously registered event listener.

#### Parameters

##### event

[`LogEventType`](../type-aliases/LogEventType.md)

##### handler

[`LogHandler`](../type-aliases/LogHandler.md)

#### Returns

`void`

***

### on

> **on**: (`event`, `handler`) => [`Unsubscribe`](../type-aliases/Unsubscribe.md)

Subscribes to log events on a specific severity, `'log'`, or `'*'` channel.

#### Parameters

##### event

[`LogEventType`](../type-aliases/LogEventType.md)

##### handler

[`LogHandler`](../type-aliases/LogHandler.md)

#### Returns

[`Unsubscribe`](../type-aliases/Unsubscribe.md)
