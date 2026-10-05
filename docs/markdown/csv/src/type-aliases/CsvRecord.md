[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [csv/src](../README.md) / CsvRecord

# Type Alias: CsvRecord

> **CsvRecord** = `Record`\<`string`, `string`\>

Represents a single parsed CSV row as a key-value record mapping column headers to cell strings.

Produced by the parser when `columns: true` or custom header arrays are supplied.

## Example

```ts
const record: CsvRecord = { age: '30', name: 'Alice' };
// Access cells by header name
```
