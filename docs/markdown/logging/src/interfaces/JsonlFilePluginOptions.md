[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [logging/src](../README.md) / JsonlFilePluginOptions

# Interface: JsonlFilePluginOptions

Configuration options for the rotating JSONL file output plugin.

## Properties

### baseName?

> `optional` **baseName?**: `string`

Base filename prefix used when generating sequential `.jsonl` files. Defaults to `'s20'`.

***

### formatter?

> `optional` **formatter?**: (`event`) => `string`

Custom serializer converting a [LogEvent](LogEvent.md) into a single line of text.

#### Parameters

##### event

[`LogEvent`](LogEvent.md)

#### Returns

`string`

***

### logDir?

> `optional` **logDir?**: `string`

Directory path where rotating `.jsonl` files are stored. Defaults to `'data/logs'`.

***

### maxRows?

> `optional` **maxRows?**: `number`

Maximum number of rows written to a single `.jsonl` file before rolling over. Defaults to `5000`.
