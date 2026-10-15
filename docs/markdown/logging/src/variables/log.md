[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [logging/src](../README.md) / log

# Variable: log

> `const` **log**: [`LogFunction`](../type-aliases/LogFunction.md)

Root logging function.

Prefer obtaining a scoped log function via `const log = logger({ name: ... })`
or `const log = logger.config(...)` to preserve module context.
