[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [logging/src](../README.md) / CreateSpanOptions

# Interface: CreateSpanOptions

Options for creating a child execution span.

## Properties

### className?

> `optional` **className?**: `string`

Enclosing module or component name.

***

### correlationIdGenerator?

> `optional` **correlationIdGenerator?**: () => `string`

Function generating trace correlation IDs for root spans.

#### Returns

`string`

***

### functionName?

> `optional` **functionName?**: `string`

Name of the executing function.

***

### parentSpan?

> `optional` **parentSpan?**: [`ExecutionSpan`](ExecutionSpan.md)

Parent span to link to, if this span is nested.

***

### spanIdGenerator?

> `optional` **spanIdGenerator?**: () => `string`

Function generating span IDs.

#### Returns

`string`
