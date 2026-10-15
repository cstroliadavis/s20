[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [logging/src](../README.md) / ContextStore

# Interface: ContextStore

Manages active trace spans across asynchronous execution paths.

## Properties

### createChildSpan

> **createChildSpan**: \{(`options?`): [`ExecutionSpan`](ExecutionSpan.md); (`parentSpan?`, `correlationIdGenerator?`, `spanIdGenerator?`): [`ExecutionSpan`](ExecutionSpan.md); \}

Creates a child span linked to a parent span or specified options.

#### Call Signature

> (`options?`): [`ExecutionSpan`](ExecutionSpan.md)

##### Parameters

###### options?

[`CreateSpanOptions`](CreateSpanOptions.md)

##### Returns

[`ExecutionSpan`](ExecutionSpan.md)

#### Call Signature

> (`parentSpan?`, `correlationIdGenerator?`, `spanIdGenerator?`): [`ExecutionSpan`](ExecutionSpan.md)

##### Parameters

###### parentSpan?

[`ExecutionSpan`](ExecutionSpan.md)

###### correlationIdGenerator?

() => `string`

###### spanIdGenerator?

() => `string`

##### Returns

[`ExecutionSpan`](ExecutionSpan.md)

***

### getActiveSpan

> **getActiveSpan**: () => [`ExecutionSpan`](ExecutionSpan.md) \| `undefined`

Returns the span currently active in this async context.

#### Returns

[`ExecutionSpan`](ExecutionSpan.md) \| `undefined`

***

### runWithSpan

> **runWithSpan**: \<`T`\>(`span`, `callback`) => `T`

Runs a callback with the given span set as the active context.

#### Type Parameters

##### T

`T`

#### Parameters

##### span

[`ExecutionSpan`](ExecutionSpan.md)

##### callback

() => `T`

#### Returns

`T`
