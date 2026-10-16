[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [app/src](../README.md) / createDefaultConfig

# Function: createDefaultConfig()

> **createDefaultConfig**(`overrides?`): [`S20Config`](../interfaces/S20Config.md)

Creates a platform-agnostic default S20 application configuration with optional overrides.

## Parameters

### overrides?

`Partial`\<[`S20Config`](../interfaces/S20Config.md)\>

Optional partial configuration values to override defaults

## Returns

[`S20Config`](../interfaces/S20Config.md)

Configured S20 domain options

## Example

```ts
const config = createDefaultConfig({ roundingIncrement: 30 });
// Returns S20Config with 30-minute rounding increment and preset task defaults
```
