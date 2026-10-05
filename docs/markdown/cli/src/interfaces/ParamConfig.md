[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [cli/src](../README.md) / ParamConfig

# Interface: ParamConfig

Configuration schema for an individual command parameter.

## Properties

### alias?

> `optional` **alias?**: `string` \| `string`[]

Optional single-character or multi-character alias flags.

***

### allowCustom?

> `optional` **allowCustom?**: `boolean`

If true, allows custom unlisted values for select parameters.

***

### default?

> `optional` **default?**: `unknown`

Default fallback value if parameter is not supplied in CLI arguments.

***

### description?

> `optional` **description?**: `string`

Human-readable explanation of parameter purpose for help documentation.

***

### isDefault?

> `optional` **isDefault?**: `boolean`

Indicates if this parameter serves as the primary positional argument.

***

### items?

> `optional` **items?**: [`ParamItems`](../type-aliases/ParamItems.md)

Available options or choices for parameter type or suggestions.

***

### name

> **name**: `string`

Unique name identifier for the parameter.

***

### negator?

> `optional` **negator?**: `boolean`

If true, enables automatic `--no-<name>` boolean inversion flag.

***

### type

> **type**: [`ParamType`](../type-aliases/ParamType.md)

Data type used for coercion and validation.
