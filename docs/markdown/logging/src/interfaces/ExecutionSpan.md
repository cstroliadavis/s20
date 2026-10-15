[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [logging/src](../README.md) / ExecutionSpan

# Interface: ExecutionSpan

Active execution span tracking timing and ancestry for a function call.

## Properties

### className?

> `optional` **className?**: `string`

Enclosing module or component name, when set.

***

### correlationId

> **correlationId**: `string`

Correlation ID shared across all spans in this trace.

***

### depth

> **depth**: `number`

Call nesting depth, starting at 0 for root spans.

***

### functionName?

> `optional` **functionName?**: `string`

Name of the executing function.

***

### parentSpanId?

> `optional` **parentSpanId?**: `string`

Span ID of the caller span, if nested.

***

### spanId

> **spanId**: `string`

Unique ID for this span.

***

### startTime

> **startTime**: `number`

Performance timestamp in milliseconds when the span started.
