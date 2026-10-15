[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [logging/src](../README.md) / LOG\_LEVEL\_VALUES

# Variable: LOG\_LEVEL\_VALUES

> `const` **LOG\_LEVEL\_VALUES**: [`LogLevelValues`](../type-aliases/LogLevelValues.md)

Numeric weights used to compare [LogLevel](../type-aliases/LogLevel.md) priorities during filtering.

Higher numbers mean higher severity. The logger emits a message when its weight
meets or exceeds the active threshold:
`LOG_LEVEL_VALUES[messageLevel] >= LOG_LEVEL_VALUES[configuredLevel]`.
