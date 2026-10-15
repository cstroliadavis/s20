[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [logging/src](../README.md) / LogFunctionExtensions

# Interface: LogFunctionExtensions

Severity helpers, configuration methods, and event hooks attached to the log function.

## Properties

### config

> **config**: (`options?`) => [`LogFunction`](../type-aliases/LogFunction.md)

Alias for configure. Updates logger settings and returns this log function.

#### Parameters

##### options?

`Partial`\<[`LoggerConfig`](LoggerConfig.md)\>

#### Returns

[`LogFunction`](../type-aliases/LogFunction.md)

***

### configure

> **configure**: (`options?`) => [`LogFunction`](../type-aliases/LogFunction.md)

Updates logger configuration settings and returns this log function.

#### Parameters

##### options?

`Partial`\<[`LoggerConfig`](LoggerConfig.md)\>

#### Returns

[`LogFunction`](../type-aliases/LogFunction.md)

***

### critical

> **critical**: [`LogMethodCallable`](../type-aliases/LogMethodCallable.md)

Logs critical errors at `'critical'` severity.

***

### debug

> **debug**: [`LogMethodCallable`](../type-aliases/LogMethodCallable.md)

Logs diagnostic details at `'debug'` severity.

***

### error

> **error**: [`LogMethodCallable`](../type-aliases/LogMethodCallable.md)

Logs errors at `'error'` severity.

***

### forPage

> **forPage**: (`page`) => [`LogFunction`](../type-aliases/LogFunction.md)

Creates a logger scoped to a specific file or page context.

#### Parameters

##### page

[`PageContext`](PageContext.md)

#### Returns

[`LogFunction`](../type-aliases/LogFunction.md)

***

### info

> **info**: [`LogMethodCallable`](../type-aliases/LogMethodCallable.md)

Logs informational messages at `'info'` severity.

***

### log

> **log**: [`LogFunction`](../type-aliases/LogFunction.md)

Self-reference to this log function for destructuring.

***

### off

> **off**: (`event`, `handler`) => `void`

Removes a registered event listener.

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

Subscribes to log events for this logger.

#### Parameters

##### event

[`LogEventType`](../type-aliases/LogEventType.md)

##### handler

[`LogHandler`](../type-aliases/LogHandler.md)

#### Returns

[`Unsubscribe`](../type-aliases/Unsubscribe.md)

***

### trace

> **trace**: [`LogMethodCallable`](../type-aliases/LogMethodCallable.md)

Logs trace details at `'trace'` severity.

***

### use

> **use**: \<`Options`, `Return`\>(`plugin`, `options?`) => `Return`

Registers a plugin with this log function.

#### Type Parameters

##### Options

`Options`

##### Return

`Return` = `void` \| [`Unsubscribe`](../type-aliases/Unsubscribe.md)

#### Parameters

##### plugin

[`LoggerPlugin`](../type-aliases/LoggerPlugin.md)\<`Options`, [`LogFunction`](../type-aliases/LogFunction.md), `Return`\>

##### options?

`Options`

#### Returns

`Return`

***

### warn

> **warn**: [`LogMethodCallable`](../type-aliases/LogMethodCallable.md)

Logs warnings at `'warn'` severity.
