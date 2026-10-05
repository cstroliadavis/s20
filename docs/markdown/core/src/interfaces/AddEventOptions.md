[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [core/src](../README.md) / AddEventOptions

# Interface: AddEventOptions

Input options for adding a new tracking event via the service.

## Properties

### date?

> `optional` **date?**: `string` \| `Date`

Explicit event date (Date instance or YYYY-MM-DD string). Defaults to current date.

***

### done?

> `optional` **done?**: `boolean`

Completion flag. When true, records a finished timestamp on the task. Defaults to false.

***

### duration?

> `optional` **duration?**: `string` \| `number`

Event duration string ('15m', '1h', '2.25') or decimal hours number.

***

### notes?

> `optional` **notes?**: `string`

Optional notes or contextual reason for the event.

***

### start?

> `optional` **start?**: `string`

24-hour start time string (HH:MM). When omitted, calculated from duration and rounding rules.

***

### task

> **task**: `string`

Task title or ticket identifier.
