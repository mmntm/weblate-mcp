---
"@mmntm/weblate-mcp": patch
---

writeTranslation and bulkWriteTranslations accept an array of plural forms as `value`, sent to Weblate as is. Plural forms are shown separated by ` | ` instead of being concatenated.
