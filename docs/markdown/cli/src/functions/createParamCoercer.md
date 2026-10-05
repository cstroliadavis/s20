[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [cli/src](../README.md) / createParamCoercer

# Function: createParamCoercer()

> **createParamCoercer**(`defaultCwd?`): `object`

Creates a parameter coercion and validation utility.

## Parameters

### defaultCwd?

`string` = `...`

Working directory for file path resolution

## Returns

Parameter coercer instance

### coerce

> **coerce**: (`param`, `rawValue`, `options?`) => `unknown`

Internal dispatcher for coercing an individual parameter value.

#### Parameters

##### param

[`ParamConfig`](../interfaces/ParamConfig.md)

##### rawValue

`unknown`

##### options?

[`CoerceOptions`](../interfaces/CoerceOptions.md)

#### Returns

`unknown`

## Example

```ts
const coercer = createParamCoercer();
const date = coercer.coerce({ name: 'start', type: 'date' }, '2026-10-02');
// Returns a parsed Date object
```
