[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [csv/src](../README.md) / createCsvStringifier

# Function: createCsvStringifier()

> **createCsvStringifier**(`options?`): [`CsvStringifier`](../interfaces/CsvStringifier.md)

Creates a CSV stringifier instance for serializing rows and records.

## Parameters

### options?

[`CsvStringifierOptions`](../interfaces/CsvStringifierOptions.md) = `{}`

Configuration options for delimiter, quote, escaping, and line breaks.

## Returns

[`CsvStringifier`](../interfaces/CsvStringifier.md)

A stringifier object with formatting methods.

## Example

```ts
const stringifier = createCsvStringifier({ lineBreak: '\n' });
const csv = stringifier.stringifyRows([['name', 'city'], ['Alice', 'New York']]);
// Returns "name,city\nAlice,New York\n"
```
