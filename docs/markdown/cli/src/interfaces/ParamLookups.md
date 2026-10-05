[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [cli/src](../README.md) / ParamLookups

# Interface: ParamLookups

Fast lookup indexes mapping flag tokens and names to parameter configurations.

## Properties

### aliases

> **aliases**: `Map`\<`string`, [`ParamConfig`](ParamConfig.md)\>

Map of alias tokens (e.g. 'f' or 'force') to parameter configurations.

***

### flags

> **flags**: `Map`\<`string`, [`ParamConfig`](ParamConfig.md)\>

Map of boolean flag names and single-letter characters to configurations.

***

### names

> **names**: `Map`\<`string`, [`ParamConfig`](ParamConfig.md)\>

Map of primary parameter names to configurations.

***

### negators

> **negators**: `Map`\<`string`, [`ParamConfig`](ParamConfig.md)\>

Map of negator names (e.g. 'no-force') to parameter configurations.
