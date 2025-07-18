# API Reference

This document provides a comprehensive reference for all MCP tools available in the Weblate MCP Server.

## 🔧 Tool Categories

- [Project Management](#project-management)
- [Component Management](#component-management)
- [Translation Management](#translation-management)
- [Language Management](#language-management)
- [Translation Statistics Dashboard](#translation-statistics-dashboard)
- [Change Tracking & History](#change-tracking--history)

---

## Project Management

### `list_projects`

List all projects in the Weblate instance.

**Parameters:** None

**Returns:**
```typescript
{
  results: Project[];
  count: number;
  next?: string;
  previous?: string;
}
```

**Example Response:**
```json
{
  "results": [
    {
      "url": "https://weblate.example.com/api/projects/myproject/",
      "name": "My Project",
      "slug": "myproject",
      "web": "https://example.com",
      "source_language": {
        "code": "en",
        "name": "English"
      },
      "components_list_url": "https://weblate.example.com/api/projects/myproject/components/"
    }
  ],
  "count": 1
}
```

### `get_project`

Get detailed information about a specific project.

**Parameters:**
- `slug` (string, required): Project slug identifier

**Returns:** `Project`

**Example:**
```json
{
  "name": "get_project",
  "arguments": {
    "slug": "myproject"
  }
}
```

### `create_project`

Create a new project in Weblate.

**Parameters:**
- `name` (string, required): Project name
- `slug` (string, required): Project slug (URL identifier)
- `web` (string, optional): Project website URL
- `source_language` (string, optional): Source language code (default: "en")

**Returns:** `Project`

**Example:**
```json
{
  "name": "create_project",
  "arguments": {
    "name": "New Project",
    "slug": "new-project",
    "web": "https://example.com",
    "source_language": "en"
  }
}
```

---

## Component Management

### `list_components`

List all components in a project.

**Parameters:**
- `project_slug` (string, required): Project slug identifier

**Returns:**
```typescript
{
  results: Component[];
  count: number;
  next?: string;
  previous?: string;
}
```

**Example:**
```json
{
  "name": "list_components",
  "arguments": {
    "project_slug": "myproject"
  }
}
```

### `get_component`

Get detailed information about a specific component.

**Parameters:**
- `project_slug` (string, required): Project slug identifier
- `component_slug` (string, required): Component slug identifier

**Returns:** `Component`

**Example:**
```json
{
  "name": "get_component",
  "arguments": {
    "project_slug": "myproject",
    "component_slug": "frontend"
  }
}
```

### `create_component`

Create a new component in a project.

**Parameters:**
- `project_slug` (string, required): Project slug identifier
- `name` (string, required): Component name
- `slug` (string, required): Component slug
- `file_format` (string, required): File format (e.g., "po", "json", "yaml")
- `filemask` (string, required): File mask pattern
- `repo` (string, required): Repository URL
- `branch` (string, optional): Repository branch (default: "main")
- `vcs` (string, optional): Version control system (default: "git")

**Returns:** `Component`

**Example:**
```json
{
  "name": "create_component",
  "arguments": {
    "project_slug": "myproject",
    "name": "Frontend Translations",
    "slug": "frontend",
    "file_format": "json",
    "filemask": "locales/*.json",
    "repo": "https://github.com/example/repo.git",
    "branch": "main"
  }
}
```

---

## Translation Management

### `searchUnitsWithFilters` ⭐ **Recommended**

Search translation units using Weblate's powerful filtering syntax. This is the most efficient way to find translations by status, content, or other criteria.

**Parameters:**
- `projectSlug` (string, required): The slug of the project
- `componentSlug` (string, required): The slug of the component  
- `languageCode` (string, required): The language code (e.g., "sk", "cs", "fr")
- `searchQuery` (string, required): Weblate search query using their filter syntax
- `limit` (number, optional): Maximum number of results to return (default: 50, max: 200)

**Supported Search Queries:**
- `state:=0` - Find untranslated strings
- `state:=10` - Find strings that need editing
- `state:>=20` - Find translated/approved strings
- `source:"login"` - Find strings containing "login" in source text
- `target:"bonjour"` - Find strings containing "bonjour" in target text
- `has:suggestion` - Find strings with suggestions
- `component:common AND state:=0` - Complex queries with multiple filters

**Returns:**
```typescript
{
  results: Unit[];
  count: number;
  formattedText: string; // Human-readable formatted results
}
```

**Example:**
```json
{
  "name": "searchUnitsWithFilters",
  "arguments": {
    "projectSlug": "myproject",
    "componentSlug": "frontend", 
    "languageCode": "fr",
    "searchQuery": "state:=0",
    "limit": 20
  }
}
```

### `searchStringInProject`

Search for translations containing specific text across a project.

**Parameters:**
- `projectSlug` (string, required): The slug of the project to search in
- `value` (string, required): The text to search for
- `searchIn` (enum, optional): Where to search - "source", "target", or "both" (default: "both")

**Returns:**
```typescript
{
  results: Unit[];
  count: number;
  formattedText: string;
}
```

**Example:**
```json
{
  "name": "searchStringInProject", 
  "arguments": {
    "projectSlug": "myproject",
    "value": "login",
    "searchIn": "both"
  }
}
```

### `getTranslationForKey`

Get translation value for a specific key in a project.

**Parameters:**
- `projectSlug` (string, required): The slug of the project
- `componentSlug` (string, required): The slug of the component
- `languageCode` (string, required): The language code (e.g., "en", "es", "fr")
- `key` (string, required): The translation key to look up

**Returns:** `Unit`

**Example:**
```json
{
  "name": "getTranslationForKey",
  "arguments": {
    "projectSlug": "myproject",
    "componentSlug": "frontend",
    "languageCode": "fr", 
    "key": "welcome.message"
  }
}
```

### `writeTranslation`

Update or write a translation value for a specific key.

**Parameters:**
- `projectSlug` (string, required): The slug of the project
- `componentSlug` (string, required): The slug of the component
- `languageCode` (string, required): The language code (e.g., "en", "es", "fr")
- `key` (string, required): The translation key to update
- `value` (string, required): The new translation value
- `markAsApproved` (boolean, optional): Whether to mark as approved (default: false)

**Returns:** `Unit`

**Example:**
```json
{
  "name": "writeTranslation",
  "arguments": {
    "projectSlug": "myproject",
    "componentSlug": "frontend",
    "languageCode": "fr",
    "key": "welcome.message",
    "value": "Bienvenue sur notre plateforme",
    "markAsApproved": true
  }
}
```

### `findTranslationsForKey`

Find all translations for a specific key across all components and languages in a project.

**Parameters:**
- `projectSlug` (string, required): The slug of the project
- `key` (string, required): The exact translation key to find

**Returns:**
```typescript
{
  results: Unit[];
  groupedByComponent: Record<string, Unit[]>;
  formattedText: string;
}
```

**Example:**
```json
{
  "name": "findTranslationsForKey",
  "arguments": {
    "projectSlug": "myproject",
    "key": "welcome.message"
  }
}
```

---

## Language Management

### `list_languages`

List all available languages in the Weblate instance.

**Parameters:** None

**Returns:**
```typescript
{
  results: Language[];
  count: number;
  next?: string;
  previous?: string;
}
```

**Example Response:**
```json
{
  "results": [
    {
      "code": "en",
      "name": "English",
      "direction": "ltr",
      "population": 1500000000
    },
    {
      "code": "fr",
      "name": "French",
      "direction": "ltr",
      "population": 280000000
    }
  ],
  "count": 2
}
```

### `get_language`

Get detailed information about a specific language.

**Parameters:**
- `code` (string, required): Language code (e.g., "en", "fr", "de")

**Returns:** `Language`

**Example:**
```json
{
  "name": "get_language",
  "arguments": {
    "code": "fr"
  }
}
```

---

## Data Types

### Project

```typescript
interface Project {
  url: string;
  name: string;
  slug: string;
  web?: string;
  source_language: Language;
  components_list_url: string;
  languages_url: string;
  repository_url: string;
  statistics_url: string;
  lock_url: string;
  changes_list_url: string;
  translation_review: boolean;
  source_review: boolean;
  set_language_team: boolean;
  enable_hooks: boolean;
  instructions: string;
  use_shared_tm: boolean;
  contribute_shared_tm: boolean;
  access_control: number;
  translation_start: boolean;
  source_language_code: string;
  language_aliases: string;
}
```

### Component

```typescript
interface Component {
  url: string;
  name: string;
  slug: string;
  project: {
    name: string;
    slug: string;
    url: string;
  };
  vcs: string;
  repo: string;
  git_export: string;
  branch: string;
  filemask: string;
  template: string;
  edit_template: boolean;
  intermediate: string;
  new_base: string;
  file_format: string;
  license: string;
  agreement: string;
  new_lang: string;
  language_code_style: string;
  source_language: Language;
  push: string;
  push_branch: string;
  check_flags: string;
  priority: number;
  enforced_checks: string[];
  restricted: boolean;
  repoweb: string;
  report_source_bugs: string;
  merge_style: string;
  commit_message: string;
  add_message: string;
  delete_message: string;
  merge_message: string;
  addon_message: string;
  pull_message: string;
  allow_translation_propagation: boolean;
  enable_suggestions: boolean;
  suggestion_voting: boolean;
  suggestion_autoaccept: number;
  push_on_commit: boolean;
  commit_pending_age: number;
  auto_lock_error: boolean;
  language_regex: string;
  variant_regex: string;
  translations_url: string;
  repository_url: string;
  statistics_url: string;
  lock_url: string;
  links_url: string;
  changes_list_url: string;
}
```

### Translation

```typescript
interface Translation {
  url: string;
  language: Language;
  component: {
    name: string;
    slug: string;
    url: string;
  };
  language_code: string;
  id: number;
  filename: string;
  revision: string;
  web_url: string;
  share_url: string;
  translate_url: string;
  repository_url: string;
  statistics_url: string;
  file_url: string;
  changes_list_url: string;
  units_list_url: string;
  total: number;
  total_words: number;
  total_chars: number;
  fuzzy: number;
  fuzzy_percent: number;
  translated: number;
  translated_percent: number;
  translated_words: number;
  translated_words_percent: number;
  translated_chars: number;
  translated_chars_percent: number;
  failing_checks: number;
  failing_checks_percent: number;
  failing_checks_words: number;
  failing_checks_words_percent: number;
  have_suggestion: number;
  have_comment: number;
  last_change: string;
  last_author: string;
  repository_url_push: string;
  is_template: boolean;
  is_source: boolean;
}
```

### Language

```typescript
interface Language {
  code: string;
  name: string;
  direction: 'ltr' | 'rtl';
  population: number;
  plural: {
    number: number;
    formula: string;
  };
  aliases: string[];
  url: string;
  web_url: string;
  statistics_url: string;
}
```

---

## Error Handling

All tools may return errors in the following format:

```typescript
interface ErrorResponse {
  error: string;
  message: string;
  details?: any;
}
```

Common error types:
- **Authentication Error**: Invalid or missing API token
- **Not Found**: Resource doesn't exist
- **Validation Error**: Invalid parameters provided
- **Permission Error**: Insufficient permissions
- **Rate Limit**: Too many requests

---

## Rate Limiting

The Weblate API may have rate limiting in place. The MCP server will handle rate limits gracefully and provide appropriate error messages when limits are exceeded.

---

## Authentication

All API calls require a valid Weblate API token. Configure your token in the environment variables:

```env
WEBLATE_API_TOKEN=your-api-token-here
```

You can generate an API token in your Weblate user settings under "API access".

---

## Translation Statistics Dashboard

### `getProjectStatistics`

Get comprehensive statistics for a project including completion rates and string counts.

**Parameters:**
- `projectSlug` (string, required): The slug of the project

**Returns:**
```typescript
{
  name: string;
  slug: string;
  translated_percent: number;
  approved_percent: number;
  readonly_percent: number;
  nottranslated_percent: number;
  total: number;
  translated: number;
  approved: number;
  nottranslated: number;
  readonly: number;
  web_url: string;
  repository_url: string;
}
```

**Example Response:**
```json
{
  "name": "Amateri.com - frontend",
  "slug": "amateri-com-frontend",
  "translated_percent": 85.2,
  "approved_percent": 78.1,
  "readonly_percent": 5.3,
  "nottranslated_percent": 14.8,
  "total": 1250,
  "translated": 1065,
  "approved": 976,
  "nottranslated": 185,
  "readonly": 66,
  "web_url": "https://translate.amateri.dev/projects/amateri-com-frontend/",
  "repository_url": "https://github.com/example/repo"
}
```

### `getComponentStatistics`

Get detailed statistics for a specific component.

**Parameters:**
- `projectSlug` (string, required): The slug of the project
- `componentSlug` (string, required): The slug of the component

**Returns:** Same structure as `getProjectStatistics` but for a specific component.

### `getProjectDashboard`

Get a comprehensive dashboard overview for a project with all component statistics.

**Parameters:**
- `projectSlug` (string, required): The slug of the project

**Returns:**
```typescript
{
  project: ProjectStatistics;
  components: Array<{
    component: string;
    slug: string;
    statistics: ComponentStatistics | null;
    error?: string;
  }>;
}
```

**Example Response:**
```json
{
  "project": {
    "name": "Amateri.com - frontend",
    "translated_percent": 85.2,
    "total": 1250
  },
  "components": [
    {
      "component": "common",
      "slug": "common",
      "statistics": {
        "translated_percent": 92.5,
        "total": 300
      }
    }
  ]
}
```

### `getTranslationStatistics`

Get statistics for a specific translation (project/component/language combination).

**Parameters:**
- `projectSlug` (string, required): The slug of the project
- `componentSlug` (string, required): The slug of the component
- `languageCode` (string, required): The language code (e.g., en, es, fr)

**Returns:** Translation-specific statistics including quality metrics.

### `getComponentLanguageProgress`

Get translation progress for all languages in a component.

**Parameters:**
- `projectSlug` (string, required): The slug of the project
- `componentSlug` (string, required): The slug of the component

**Returns:**
```typescript
Array<{
  language: string;
  code: string;
  statistics: TranslationStatistics | null;
  error?: string;
}>
```

### `getLanguageStatistics`

Get statistics for a specific language across all projects.

**Parameters:**
- `languageCode` (string, required): The language code (e.g., en, es, fr)

**Returns:** Language-wide statistics across all projects.

### `getUserStatistics`

Get contribution statistics for a specific user.

**Parameters:**
- `username` (string, required): The username to get statistics for

**Returns:**
```typescript
{
  username: string;
  full_name: string;
  email: string;
  date_joined: string;
  translated: number;
  approved: number;
  suggestions: number;
  comments: number;
  total_changes: number;
  last_login: string;
}
```

---

## Change Tracking & History

### `listRecentChanges`

List recent changes across all projects in Weblate.

**Parameters:**
- `limit` (number, optional): Number of changes to return (default: 20)
- `user` (string, optional): Filter by specific user
- `timestampAfter` (string, optional): Show changes after this timestamp (ISO format)
- `timestampBefore` (string, optional): Show changes before this timestamp (ISO format)

**Returns:**
```typescript
{
  results: Change[];
  count: number;
}
```

### `getProjectChanges`

Get recent changes for a specific project.

**Parameters:**
- `projectSlug` (string, required): The slug of the project

**Returns:** List of changes specific to the project.

### `getComponentChanges`

Get recent changes for a specific component.

**Parameters:**
- `projectSlug` (string, required): The slug of the project
- `componentSlug` (string, required): The slug of the component

**Returns:** List of changes specific to the component.

### `getChangesByUser`

Get recent changes by a specific user.

**Parameters:**
- `user` (string, required): Username to filter by
- `limit` (number, optional): Number of changes to return (default: 20)

**Returns:** List of changes made by the specified user.

---

## Best Practices

1. **Use specific slugs**: Always use the exact project and component slugs
2. **Handle pagination**: Large result sets may be paginated
3. **Check permissions**: Ensure your API token has the necessary permissions
4. **Validate input**: Provide valid parameters to avoid errors
5. **Monitor rate limits**: Be mindful of API rate limiting
6. **Statistics caching**: Statistics may be cached and updated periodically
7. **Dashboard performance**: Use `getProjectDashboard` for comprehensive overviews instead of multiple individual calls 