[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [cli/src](../README.md) / CliDependencies

# Interface: CliDependencies

External dependencies required to instantiate and execute the S20 CLI presentation adapter.

## Properties

### configPath?

> `optional` **configPath?**: `string`

Optional custom filesystem path to the YAML CLI schema definition file.

***

### service

> **service**: [`S20Service`](../../../app/src/interfaces/S20Service.md)

Application service instance coordinating time calculations, storage, and suggestions.
