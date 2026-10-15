[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [logging/src](../README.md) / formatAsJson

# Function: formatAsJson()

> **formatAsJson**(`event`): `string`

Serializes a log event directly to a single-line JSON string.

## Parameters

### event

[`LogEvent`](../interfaces/LogEvent.md)

Log event to serialize.

## Returns

`string`

Serialized JSON string.

## Example

```ts
const line = formatAsJson(event);
```
