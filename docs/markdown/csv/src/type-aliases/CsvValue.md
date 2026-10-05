[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [csv/src](../README.md) / CsvValue

# Type Alias: CsvValue

> **CsvValue** = `boolean` \| `bigint` \| `number` \| `string` \| `null` \| `undefined` \| `Date`

Represents any JavaScript primitive or date value acceptable as a CSV cell.

Supported values are automatically stringified during serialization (dates are converted to
ISO strings, numbers/booleans are converted to text, and null/undefined become empty cells).

## Example

```ts
const cell: CsvValue = 42;
// Serializes to "42"
```
