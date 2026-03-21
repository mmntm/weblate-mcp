---
"@mmntm/weblate-mcp": minor
---

Make componentSlug optional in searchUnitsWithFilters

The `componentSlug` parameter in the `searchUnitsWithFilters` tool is now optional. When omitted, the search will query translation units across all components in the specified project.

**Changes:**
- Updated `componentSlug` parameter from required to optional in tool schema
- Modified search logic to skip component filter when `componentSlug` is not provided
- Updated all result messages to reflect whether component scope is applied

This enhancement enables more flexible translation searches, allowing users to find strings across entire projects without specifying individual components.
