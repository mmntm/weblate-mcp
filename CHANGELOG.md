# weblate-mcp-server

## 1.0.1

### Patch Changes

- 23ca2db: Refactor codebase for better maintainability and separation of concerns

  - Split large WeblateApiService into focused, single-responsibility services
  - Separate types from business logic into dedicated types folder
  - Create base service for shared HTTP client configuration
  - Maintain backward compatibility with existing public API
  - Organize services into logical subfolders (weblate/, types/)
  - Add centralized exports via index files
