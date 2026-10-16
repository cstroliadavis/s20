[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [app/src](../README.md) / computeNextId

# Function: computeNextId()

> **computeNextId**(`records`): `number`

Calculates the next sequential integer identifier for a collection of records.

## Parameters

### records

`object`[]

Collection of records containing numeric id properties

## Returns

`number`

Next available incremental integer ID (starting at 1)

## Example

```ts
const nextId = computeNextId([{ id: 1 }, { id: 4 }]);
// Returns 5
```
