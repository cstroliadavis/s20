[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [logging/src](../README.md) / createContextStore

# Function: createContextStore()

> **createContextStore**(): [`ContextStore`](../interfaces/ContextStore.md)

Creates an AsyncLocalStorage store for tracking active execution spans across async calls.

## Returns

[`ContextStore`](../interfaces/ContextStore.md)

Context store providing span creation, active span retrieval, and scope execution.

## Example

```ts
const contextStore = createContextStore();
const childSpan = contextStore.createChildSpan();
contextStore.runWithSpan(childSpan, () => {
  const active = contextStore.getActiveSpan();
});
```
