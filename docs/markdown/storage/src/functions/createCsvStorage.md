[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [storage/src](../README.md) / createCsvStorage

# Function: createCsvStorage()

> **createCsvStorage**(`paths`): [`S20Storage`](../../../app/src/interfaces/S20Storage.md)

Creates a CSV persistence adapter implementing the S20Storage port interface.

## Parameters

### paths

[`CsvStorageOptions`](../type-aliases/CsvStorageOptions.md)

Local filesystem directory and file paths for events.csv and tasks.csv

## Returns

[`S20Storage`](../../../app/src/interfaces/S20Storage.md)

S20Storage adapter backed by CSV files

## Example

```ts
const paths = createDefaultStoragePaths();
const storage = createCsvStorage(paths);
const events = await storage.getEvents();
// Returns array of EventRecord entries read from events.csv
```
