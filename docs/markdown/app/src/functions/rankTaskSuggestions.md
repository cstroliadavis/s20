[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [app/src](../README.md) / rankTaskSuggestions

# Function: rankTaskSuggestions()

> **rankTaskSuggestions**(`tasks`): `string`[]

Ranks and deduplicates task names with unfinished tasks prioritized first.

## Parameters

### tasks

[`TaskRecord`](../interfaces/TaskRecord.md)[]

Collection of aggregate task records

## Returns

`string`[]

Ordered list of unique task names for completion suggestions

## Example

```ts
const suggestions = rankTaskSuggestions(tasks);
// Returns ['Active Task', 'Completed Task']
```
