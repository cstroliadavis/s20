[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [logging/src](../README.md) / buildLoggerMetadata

# Function: buildLoggerMetadata()

> **buildLoggerMetadata**(`page?`, `config?`): [`LogLoggerMetadata`](../interfaces/LogLoggerMetadata.md) \| `undefined`

Assembles metadata describing the logger context from active configuration and page settings.

## Parameters

### page?

[`PageContext`](../interfaces/PageContext.md)

Optional page or file context scoped to a specific logger.

### config?

[`LoggerConfig`](../interfaces/LoggerConfig.md)

Optional active global configuration settings.

## Returns

[`LogLoggerMetadata`](../interfaces/LogLoggerMetadata.md) \| `undefined`

Combined logger metadata, or undefined if no metadata attributes are present.

## Example

```ts
const meta = buildLoggerMetadata(page, config);
```
