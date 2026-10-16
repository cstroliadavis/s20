[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [app/src](../README.md) / applyEventToTask

# Function: applyEventToTask()

> **applyEventToTask**(`existing`, `event`): [`TaskRecord`](../interfaces/TaskRecord.md)

Applies a newly recorded event to an existing task record without mutating the original object.

## Parameters

### existing

[`TaskRecord`](../interfaces/TaskRecord.md)

Existing aggregate task record

### event

[`EventInput`](../interfaces/EventInput.md)

Newly recorded event input

## Returns

[`TaskRecord`](../interfaces/TaskRecord.md)

Updated task record with accumulated duration and completion timestamp

## Example

```ts
const updated = applyEventToTask(existingTask, {
  date: '2026-10-03',
  duration: 0.5,
  isDone: true,
  notes: '',
  start: '10:00',
  task: 'Ticket 5260',
});
// Returns new TaskRecord with totalTime increased by 0.5 and finished set to '2026-10-03 10:30'
```
