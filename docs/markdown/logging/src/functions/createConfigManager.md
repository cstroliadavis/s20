[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [logging/src](../README.md) / createConfigManager

# Function: createConfigManager()

> **createConfigManager**(`initial?`): `object`

Creates a manager for reading, updating, and resolving logger configuration.

## Parameters

### initial?

`Partial`\<[`LoggerConfig`](../interfaces/LoggerConfig.md)\>

Starting configuration values to apply over defaults.

## Returns

`object`

Methods to update settings and resolve active filters for pages or categories.

### getConfig

> **getConfig**: () => [`LoggerConfig`](../interfaces/LoggerConfig.md)

#### Returns

[`LoggerConfig`](../interfaces/LoggerConfig.md)

### reset

> **reset**: () => `void`

#### Returns

`void`

### resolveEffective

> **resolveEffective**: (`page?`) => [`EffectiveSettings`](../interfaces/EffectiveSettings.md)

#### Parameters

##### page?

[`PageContext`](../interfaces/PageContext.md)

#### Returns

[`EffectiveSettings`](../interfaces/EffectiveSettings.md)

### updateConfig

> **updateConfig**: (`patch`) => [`LoggerConfig`](../interfaces/LoggerConfig.md)

#### Parameters

##### patch

`Partial`\<[`LoggerConfig`](../interfaces/LoggerConfig.md)\>

#### Returns

[`LoggerConfig`](../interfaces/LoggerConfig.md)

## Example

```ts
const manager = createConfigManager({ level: 'debug' });
manager.updateConfig({ level: 'warn' });
const effective = manager.resolveEffective();
```
