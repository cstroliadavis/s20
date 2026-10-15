[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [logging/src](../README.md) / PageContext

# Interface: PageContext

Metadata identifying the file, module, or subsystem running the code.

## Indexable

> \[`key`: `string`\]: `unknown`

Additional custom context fields.

## Properties

### appName?

> `optional` **appName?**: `string`

Application name configured on the logger.

***

### appVersion?

> `optional` **appVersion?**: `string`

Application release version configured on the logger.

***

### category?

> `optional` **category?**: `string`

Subsystem or category name, such as `'storage'` or `'cli'`.

***

### environment?

> `optional` **environment?**: `string`

Deployment environment name, such as `'production'` or `'development'`.

***

### location?

> `optional` **location?**: `string`

File path or URL of the script.

***

### name?

> `optional` **name?**: `string`

Human-friendly label for the module or script.

***

### namespace?

> `optional` **namespace?**: `string`

Prefix for grouping related loggers together.

***

### serverName?

> `optional` **serverName?**: `string`

Host or server instance name emitting the log.
