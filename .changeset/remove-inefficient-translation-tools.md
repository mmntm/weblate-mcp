---
"@mmntm/weblate-mcp": minor
---

Remove inefficient translation tools to enforce better LLM usage patterns

- Removed `listTranslationKeys` tool that encouraged inefficient list-then-check patterns
- Removed `searchTranslationKeys` tool that only returned key names without translation status
- Removed `searchTranslationsByKey` tool that was duplicate functionality
- Kept efficient tools: `searchUnitsWithFilters`, `searchStringInProject`, `writeTranslation`, `findTranslationsForKey`, and `getTranslationForKey`
- LLMs are now guided toward using Weblate's native filtering syntax via `searchUnitsWithFilters` for optimal performance

This change prevents LLMs from making thousands of individual API calls when they could use a single efficient filtered search instead. 