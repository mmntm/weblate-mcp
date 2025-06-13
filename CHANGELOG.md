# weblate-mcp-server

## 1.0.2

### Patch Changes

- Add npx executable support for easy MCP server usage

  - Added `bin` field to package.json for `weblate-mcp` command
  - Added shebang to main.ts for direct node execution
  - Added postbuild script to make dist/main.js executable
  - Added comprehensive setup documentation (MCP_SETUP.md)
  - Updated README with npx usage examples and configuration
  - Now works exactly like @modelcontextprotocol/server-puppeteer

## 1.0.1

### Patch Changes

- Initial release of Weblate MCP server

  - Complete refactored codebase with modular services
  - Separated types from business logic
  - Added comprehensive GitHub Actions workflows
  - Configured for automated releases with Changesets

## 1.0.1

### Patch Changes

- 23ca2db: Refactor codebase for better maintainability and separation of concerns

  - Split large WeblateApiService into focused, single-responsibility services
  - Separate types from business logic into dedicated types folder
  - Create base service for shared HTTP client configuration
  - Maintain backward compatibility with existing public API
  - Organize services into logical subfolders (weblate/, types/)
  - Add centralized exports via index files
