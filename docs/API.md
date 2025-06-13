# API Reference

This document provides a comprehensive reference for all MCP tools available in the Weblate MCP Server.

## 🔧 Tool Categories

- [Project Management](#project-management)
- [Component Management](#component-management)
- [Translation Management](#translation-management)
- [Language Management](#language-management)

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

### `list_translations`

List all translations for a component.

**Parameters:**
- `project_slug` (string, required): Project slug identifier
- `component_slug` (string, required): Component slug identifier

**Returns:**
```typescript
{
  results: Translation[];
  count: number;
  next?: string;
  previous?: string;
}
```

**Example:**
```json
{
  "name": "list_translations",
  "arguments": {
    "project_slug": "myproject",
    "component_slug": "frontend"
  }
}
```

### `get_translation`

Get detailed information about a specific translation.

**Parameters:**
- `project_slug` (string, required): Project slug identifier
- `component_slug` (string, required): Component slug identifier
- `language_code` (string, required): Language code (e.g., "en", "fr", "de")

**Returns:** `Translation`

**Example:**
```json
{
  "name": "get_translation",
  "arguments": {
    "project_slug": "myproject",
    "component_slug": "frontend",
    "language_code": "fr"
  }
}
```

### `update_translation`

Update translation strings for a specific translation.

**Parameters:**
- `project_slug` (string, required): Project slug identifier
- `component_slug` (string, required): Component slug identifier
- `language_code` (string, required): Language code
- `translations` (object, required): Key-value pairs of translation strings

**Returns:** `Translation`

**Example:**
```json
{
  "name": "update_translation",
  "arguments": {
    "project_slug": "myproject",
    "component_slug": "frontend",
    "language_code": "fr",
    "translations": {
      "hello": "Bonjour",
      "goodbye": "Au revoir"
    }
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

## Best Practices

1. **Use specific slugs**: Always use the exact project and component slugs
2. **Handle pagination**: Large result sets may be paginated
3. **Check permissions**: Ensure your API token has the necessary permissions
4. **Validate input**: Provide valid parameters to avoid errors
5. **Monitor rate limits**: Be mindful of API rate limiting 