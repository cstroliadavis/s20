[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [logging/src](../README.md) / LoggerConfig

# Interface: LoggerConfig

Global logger configuration options, filters, and ID generators.

## Properties

### appName?

> `optional` **appName?**: `string`

Application name for identifying the service across log events.

***

### appVersion?

> `optional` **appVersion?**: `string`

Application release version.

***

### categories?

> `optional` **categories?**: `Record`\<`string`, [`PageFilterConfig`](PageFilterConfig.md)\>

Filter rules keyed by category name.

***

### correlationIdGenerator?

> `optional` **correlationIdGenerator?**: () => `string`

Custom function generating correlation IDs for root traces.

#### Returns

`string`

***

### defaultLevel?

> `optional` **defaultLevel?**: [`LogLevel`](../type-aliases/LogLevel.md)

Default minimum log level when no specific level is set.

***

### enabled?

> `optional` **enabled?**: `boolean`

Whether logging is enabled across the application.

***

### environment?

> `optional` **environment?**: `string`

Deployment environment name.

***

### formatter?

> `optional` **formatter?**: (`event`) => `string`

Default formatter for converting log events to text.

#### Parameters

##### event

[`LogEvent`](LogEvent.md)

#### Returns

`string`

***

### level?

> `optional` **level?**: [`LogLevel`](../type-aliases/LogLevel.md)

Minimum severity level required to emit logs.

***

### pages?

> `optional` **pages?**: `Record`\<`string`, [`PageFilterConfig`](PageFilterConfig.md)\>

Filter rules keyed by page name or file path.

***

### serverName?

> `optional` **serverName?**: `string`

Host or server instance name emitting log events.

***

### spanIdGenerator?

> `optional` **spanIdGenerator?**: () => `string`

Custom function generating span IDs.

#### Returns

`string`
