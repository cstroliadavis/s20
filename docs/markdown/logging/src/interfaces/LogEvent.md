[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [logging/src](../README.md) / LogEvent

# Interface: LogEvent

Structured payload for a log message event.

## Properties

### className?

> `optional` **className?**: `string`

Enclosing module or component name.

***

### correlationId?

> `optional` **correlationId?**: `string`

Trace correlation ID linking related spans and log calls.

***

### depth?

> `optional` **depth?**: `number`

Nesting depth of the call when the event was emitted.

***

### duration?

> `optional` **duration?**: `number`

Elapsed execution time in milliseconds when measured.

***

### error?

> `optional` **error?**: [`LogErrorInfo`](LogErrorInfo.md)

Error details if the event records a failure.

***

### eventType

> **eventType**: [`LogEventType`](../type-aliases/LogEventType.md)

Event channel type.

***

### functionName?

> `optional` **functionName?**: `string`

Name of the function that logged the message.

***

### level

> **level**: [`LogLevel`](../type-aliases/LogLevel.md)

Severity level of this log entry.

***

### logger?

> `optional` **logger?**: [`LogLoggerMetadata`](LogLoggerMetadata.md)

Metadata from the logger that emitted this event.

***

### message

> **message**: `string`

Log message text.

***

### metadata?

> `optional` **metadata?**: `Record`\<`string`, `unknown`\>

Custom structured data passed to the log call.

***

### parentSpanId?

> `optional` **parentSpanId?**: `string`

Span ID of the caller span, if nested.

***

### spanId?

> `optional` **spanId?**: `string`

Span ID for the current execution context.

***

### timestamp

> **timestamp**: `string`

ISO 8601 timestamp string when the event was created.
