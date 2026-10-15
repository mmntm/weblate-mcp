---
'@mmntm/weblate-mcp': patch
---

Match translation keys exactly when looking up or writing units, so a key cannot select a longer key such as its `.title` sibling. Reject ambiguous single-unit lookups before writing.
