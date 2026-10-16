[**s20 v0.1.0**](../../../README.md)

***

[s20](../../../modules.md) / [storage/src](../README.md) / StoragePaths

# Interface: StoragePaths

Local filesystem paths and rotation limits for CSV persistence and logging.

## Properties

### categoryFilePath

> **categoryFilePath**: `string`

Path to the category CSV file.

***

### dataDir

> **dataDir**: `string`

Root directory housing all CSV storage files.

***

### eventsFilePath

> **eventsFilePath**: `string`

Path to the events chronological log CSV file.

***

### logDir

> **logDir**: `string`

Directory path where rotating JSONL application logs are stored.

***

### logMaxRows

> **logMaxRows**: `number`

Maximum number of rows per JSONL log file before rotating to a new file.

***

### projectFilePath

> **projectFilePath**: `string`

Path to the project definitions CSV file.

***

### tasksFilePath

> **tasksFilePath**: `string`

Path to the aggregate tasks status CSV file.
