---
"@mmntm/weblate-mcp": patch
---

Fix module loading errors by upgrading @rekog/mcp-nest from 1.5.2 to 1.9.2

This resolves the "Cannot find module 'zod-json-schema-compat.js'" error that occurred with the older bundled version. Additionally, zod has been upgraded to v4.0.0 to satisfy peer dependencies, and the postbuild script now uses shx for cross-platform chmod compatibility, ensuring the package works correctly on Windows systems.
