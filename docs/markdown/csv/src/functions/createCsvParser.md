[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [csv/src](../README.md) / createCsvParser

# Function: createCsvParser()

> **createCsvParser**(`options?`): [`CsvParser`](../interfaces/CsvParser.md)

Creates a streaming, stateful CSV parser instance.

## Parameters

### options?

[`CsvParserOptions`](../interfaces/CsvParserOptions.md)

Configuration options for delimiter, quotes, headers, and trimming.

## Returns

[`CsvParser`](../interfaces/CsvParser.md)

A stateful parser object with write, end, parse, and reset methods.

## Example

```ts
const parser = createCsvParser({ delimiter: ',' });
const rows = parser.parse('name,age\nAlice,30');
// Returns [['name', 'age'], ['Alice', '30']]
```
