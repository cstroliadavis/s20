[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [logging/src](../README.md) / LogFunctionDeps

# Interface: LogFunctionDeps

Dependencies supplied when creating a log function instance.

## Properties

### configManager

> **configManager**: `object`

Configuration manager for updating and resolving active logger settings.

#### getConfig

> **getConfig**: () => [`LoggerConfig`](LoggerConfig.md)

##### Returns

[`LoggerConfig`](LoggerConfig.md)

#### resolveEffective

> **resolveEffective**: (`page?`) => [`EffectiveSettings`](EffectiveSettings.md)

##### Parameters

###### page?

[`PageContext`](PageContext.md)

##### Returns

[`EffectiveSettings`](EffectiveSettings.md)

#### updateConfig

> **updateConfig**: (`patch`) => [`LoggerConfig`](LoggerConfig.md)

##### Parameters

###### patch

`Partial`\<[`LoggerConfig`](LoggerConfig.md)\>

##### Returns

[`LoggerConfig`](LoggerConfig.md)

***

### contextStore

> **contextStore**: `object`

Context store for managing trace spans.

#### createChildSpan

> **createChildSpan**: \{(`options?`): [`ExecutionSpan`](ExecutionSpan.md); (`parentSpan?`, `correlationIdGenerator?`, `spanIdGenerator?`): [`ExecutionSpan`](ExecutionSpan.md); \}

##### Call Signature

> (`options?`): [`ExecutionSpan`](ExecutionSpan.md)

###### Parameters

###### options?

[`CreateSpanOptions`](CreateSpanOptions.md)

###### Returns

[`ExecutionSpan`](ExecutionSpan.md)

##### Call Signature

> (`parentSpan?`, `correlationIdGenerator?`, `spanIdGenerator?`): [`ExecutionSpan`](ExecutionSpan.md)

###### Parameters

###### parentSpan?

[`ExecutionSpan`](ExecutionSpan.md)

###### correlationIdGenerator?

() => `string`

###### spanIdGenerator?

() => `string`

###### Returns

[`ExecutionSpan`](ExecutionSpan.md)

#### getActiveSpan

> **getActiveSpan**: () => [`ExecutionSpan`](ExecutionSpan.md) \| `undefined`

##### Returns

[`ExecutionSpan`](ExecutionSpan.md) \| `undefined`

#### runWithSpan

> **runWithSpan**: \<`T`\>(`span`, `fn`) => `T`

##### Type Parameters

###### T

`T`

##### Parameters

###### span

[`ExecutionSpan`](ExecutionSpan.md)

###### fn

() => `T`

##### Returns

`T`

***

### emitter

> **emitter**: `object`

Event bus for emitting and subscribing to log events.

#### emit

> **emit**: (`event`, `payload`) => `void`

##### Parameters

###### event

[`LogEventType`](../type-aliases/LogEventType.md)

###### payload

[`LogEvent`](LogEvent.md)

##### Returns

`void`

#### off

> **off**: (`event`, `handler`) => `void`

##### Parameters

###### event

[`LogEventType`](../type-aliases/LogEventType.md)

###### handler

[`LogHandler`](../type-aliases/LogHandler.md)

##### Returns

`void`

#### on

> **on**: (`event`, `handler`) => [`Unsubscribe`](../type-aliases/Unsubscribe.md)

##### Parameters

###### event

[`LogEventType`](../type-aliases/LogEventType.md)

###### handler

[`LogHandler`](../type-aliases/LogHandler.md)

##### Returns

[`Unsubscribe`](../type-aliases/Unsubscribe.md)

***

### page?

> `optional` **page?**: [`PageContext`](PageContext.md)

Page or file context bound to this log instance.
