---
"@mmntm/weblate-mcp": minor
---

Add bulkWriteTranslations tool for efficient batch translation updates

- Added `bulkWriteTranslations` MCP tool for updating multiple translations in a single operation
- Implemented concurrency control (5 parallel requests) to prevent API overload
- Added comprehensive error handling with individual failure tracking
- Provides detailed success/failure reporting with summary statistics
- Supports batch approval functionality for translations
- Added progress logging for monitoring large batch operations
- Updated all documentation to include the new bulk update functionality

This tool is ideal for:
- CSV/Excel import workflows
- Mass correction of translation errors
- Batch approval of multiple translations
- Migration of translations between components

The bulk update tool processes translations efficiently while providing detailed feedback about successes and failures, making it safe for large-scale translation operations. 