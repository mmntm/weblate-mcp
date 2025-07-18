---
'@mmntm/weblate-mcp': minor
---

Add comprehensive Translation Statistics Dashboard and Change Tracking functionality

## 📊 Translation Statistics Dashboard

Added 7 new powerful analytics tools for comprehensive translation insights:

- **getProjectStatistics** - Project-level completion rates, string counts, and progress metrics
- **getComponentStatistics** - Component-specific translation analytics with detailed breakdowns
- **getProjectDashboard** - Complete dashboard overview with all component statistics
- **getTranslationStatistics** - Translation-specific metrics including quality data and failing checks
- **getComponentLanguageProgress** - Multi-language progress tracking with visual progress bars
- **getLanguageStatistics** - Cross-project language performance analytics
- **getUserStatistics** - User contribution statistics and activity metrics

## 📈 Change Tracking & History

Added 4 new tools for comprehensive change monitoring and audit capabilities:

- **listRecentChanges** - Real-time change monitoring across all projects with filtering
- **getProjectChanges** - Project-specific change history and activity logs
- **getComponentChanges** - Component-focused change tracking
- **getChangesByUser** - User activity monitoring with 52+ categorized action types

## 🏗️ Architecture Improvements

- **Refactored tool architecture** - Separated tools into focused files by functionality (projects, components, languages, translations, changes, statistics)
- **Added WeblateStatisticsService** - Dedicated service for analytics operations with proper error handling
- **Added WeblateChangesService** - Specialized service for change tracking and history
- **Enhanced OpenAPI integration** - Migrated from manual HTTP requests to generated client for type safety
- **Improved dependency injection** - Fixed circular dependencies and enhanced service composition
- **Visual enhancements** - Added progress bars, emoji indicators, and rich formatting

## 📚 Documentation Updates

- **Comprehensive API documentation** - Added detailed tool specifications with examples
- **Updated architecture diagrams** - Reflected new service structure and dependencies
- **Enhanced README** - Updated feature tables and capabilities overview
- **Complete changelog** - Detailed version history and feature additions

This release significantly enhances the translation management capabilities with professional-grade analytics, monitoring, and workflow tools. 