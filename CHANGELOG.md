# weblate-mcp-server

## 1.1.0

### Minor Changes

- Added comprehensive Translation Statistics Dashboard with 7 new tools for analytics and insights
- Added Change Tracking & History functionality with 4 new tools for monitoring translation activity
- Refactored tool architecture into separate, focused files for better maintainability
- Migrated from manual HTTP requests to generated OpenAPI client for improved type safety
- Enhanced translation management with advanced search and filtering capabilities

### New Features

#### 📊 Translation Statistics Dashboard
- `getProjectStatistics` - Project-level completion rates and metrics
- `getComponentStatistics` - Component-specific translation analytics  
- `getProjectDashboard` - Comprehensive dashboard with all component statistics
- `getTranslationStatistics` - Translation-specific metrics and quality data
- `getComponentLanguageProgress` - Multi-language progress tracking with visual progress bars
- `getLanguageStatistics` - Cross-project language performance analytics
- `getUserStatistics` - User contribution statistics and activity metrics

#### 📈 Change Tracking & History
- `listRecentChanges` - Real-time change monitoring across all projects
- `getProjectChanges` - Project-specific change history
- `getComponentChanges` - Component-focused change tracking
- `getChangesByUser` - User activity monitoring and audit logs

#### 🏗️ Architecture Improvements
- Separated tools into focused files (projects, components, languages, translations, changes, statistics)
- Added `WeblateStatisticsService` for analytics operations
- Added `WeblateChangesService` for change tracking
- Enhanced error handling and graceful degradation
- Improved dependency injection and service composition

## 1.0.4

### Patch Changes

- 7cdd8bf: Docs

## 1.0.3

### Patch Changes

- 2b13d64: Update repository links

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
