[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [logging/src](../README.md) / createLogFunction

# Function: createLogFunction()

> **createLogFunction**(`deps`): [`LogFunction`](../type-aliases/LogFunction.md)

Creates the primary log function, binding severity methods and plugin hooks.

## Parameters

### deps

[`LogFunctionDeps`](../interfaces/LogFunctionDeps.md)

Emitter, configuration manager, and context store dependencies.

## Returns

[`LogFunction`](../type-aliases/LogFunction.md)

Callable log function with attached severity helpers and plugin hooks.

## Example

```ts
const log = createLogFunction(deps);
log('Application started');
log.info('Event recorded', { id: 1 });
```
