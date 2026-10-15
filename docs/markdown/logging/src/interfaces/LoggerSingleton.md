[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [logging/src](../README.md) / LoggerSingleton

# Interface: LoggerSingleton()

Global logger object for configuring settings, subscribing to events, and creating scoped loggers.

> **LoggerSingleton**(`pageOrConfig?`, `config?`): [`LogFunction`](../type-aliases/LogFunction.md)

Scopes a logger to a page context or updates global configuration.

## Parameters

### pageOrConfig?

[`PageContext`](PageContext.md) \| `Partial`\<[`LoggerConfig`](LoggerConfig.md)\>

### config?

`Partial`\<[`LoggerConfig`](LoggerConfig.md)\>

## Returns

[`LogFunction`](../type-aliases/LogFunction.md)

## Properties

### config

> **config**: (`options?`) => [`LogFunction`](../type-aliases/LogFunction.md)

Alias for configure. Updates global configuration settings and returns the root log function.

#### Parameters

##### options?

`Partial`\<[`LoggerConfig`](LoggerConfig.md)\>

#### Returns

[`LogFunction`](../type-aliases/LogFunction.md)

***

### configure

> **configure**: (`options?`) => [`LogFunction`](../type-aliases/LogFunction.md)

Updates global logger configuration settings and returns the root log function.

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

Logs diagnostic messages at `'debug'` severity.

***

### error

> **error**: [`LogMethodCallable`](../type-aliases/LogMethodCallable.md)

Logs errors at `'error'` severity.

***

### forPage

> **forPage**: (`page`) => [`LogFunction`](../type-aliases/LogFunction.md)

Creates a child logger scoped to a file or page context.

#### Parameters

##### page

[`PageContext`](PageContext.md)

#### Returns

[`LogFunction`](../type-aliases/LogFunction.md)

***

### getConfig

> **getConfig**: () => [`LoggerConfig`](LoggerConfig.md)

Returns a copy of the active configuration.

#### Returns

[`LoggerConfig`](LoggerConfig.md)

***

### info

> **info**: [`LogMethodCallable`](../type-aliases/LogMethodCallable.md)

Logs informational messages at `'info'` severity.

***

### log

> **log**: [`LogFunction`](../type-aliases/LogFunction.md)

Self-reference to the root log function for destructuring.

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

Subscribes to global log events.

#### Parameters

##### event

[`LogEventType`](../type-aliases/LogEventType.md)

##### handler

[`LogHandler`](../type-aliases/LogHandler.md)

#### Returns

[`Unsubscribe`](../type-aliases/Unsubscribe.md)

***

### reset

> **reset**: () => `void`

Clears event listeners and resets configuration to defaults.

#### Returns

`void`

***

### trace

> **trace**: [`LogMethodCallable`](../type-aliases/LogMethodCallable.md)

Logs trace details at `'trace'` severity.

***

### use

> **use**: \<`Options`, `Return`\>(`plugin`, `options?`) => `Return`

Registers a plugin with the global logger.

#### Type Parameters

##### Options

`Options`

##### Return

`Return` = `void` \| [`Unsubscribe`](../type-aliases/Unsubscribe.md)

#### Parameters

##### plugin

[`LoggerPlugin`](../type-aliases/LoggerPlugin.md)\<`Options`, `LoggerSingleton`, `Return`\>

##### options?

`Options`

#### Returns

`Return`

***

### warn

> **warn**: [`LogMethodCallable`](../type-aliases/LogMethodCallable.md)

Logs warnings at `'warn'` severity.
