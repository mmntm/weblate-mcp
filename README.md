# Weblate MCP Server

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server for intelligent translation migration between Weblate projects. This server enables contextual translation migration with smart matching and format transformation capabilities.

## 🌟 Features

- **🔄 Intelligent Translation Migration**: Find and migrate translations between projects with context-aware matching
- **🔧 Format Transformation**: Automatically convert between gettext (`%s`) and ICU message format (`{placeholder}`)
- **🔍 Contextual Search**: Search for translations by content across projects
- **🔑 Key-Based Discovery**: Search and find translations by key patterns, not just content
- **📊 Project Management**: List projects, components, and languages
- **✏️ Translation Updates**: Write and approve translations programmatically
- **🚀 Multiple Transports**: HTTP/SSE, Streamable HTTP, and STDIO support
- **🛡️ Type Safety**: Full TypeScript implementation with comprehensive error handling

## 🎯 Use Case

Perfect for migrating from legacy projects (e.g., PHP with gettext format like `#g_loc_form_submit_btn`) to modern projects (e.g., React with ICU format like `forms.changeLocation.submit`).

### 🔑 Key-Based Translation Discovery

**The Problem**: You know a translation key exists in your project, but you don't know its exact location or content. Traditional search by content fails when you only have the key.

**The Solution**: Our new key-based search functionality lets you:
- **Find by Key**: `searchTranslationsByKey("user.profile")` finds all translations with keys containing "user.profile"
- **Discover All Translations**: `findTranslationsForKey("common.submit")` shows this key across all components and languages
- **Browse Keys**: `listTranslationKeys()` shows all available keys in a project
- **Pattern Matching**: `searchTranslationKeys("button")` finds all button-related keys

### 🔄 Intelligent Migration Workflow

Instead of manually finding and copying translations, you can say:
> "Migrate the Submit button translation from legacy-app to new-app"

The server will:
1. 🔍 Search for "Submit" in the legacy project (by content OR key)
2. 🎯 Find the best matching translation using intelligent algorithms
3. 🔄 Transform the format if needed (`%s` → `{placeholder}`)
4. ✍️ Write it to the specified key in the new project

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm package manager
- Weblate instance with API access

### Installation
```bash
# Clone and install
git clone <this-repo>
cd weblate-mcp
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your Weblate API URL and token

# Build and start
pnpm build
pnpm start
```

Server runs on `http://localhost:3001` by default.

### Environment Configuration
```env
WEBLATE_API_URL=https://your-weblate-instance.com
WEBLATE_API_TOKEN=your-api-token-here
PORT=3001
NODE_ENV=production
LOG_LEVEL=info
```

## 🔗 MCP Client Configuration

### Claude Desktop
Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "weblate": {
      "command": "node",
      "args": ["/path/to/weblate-mcp/dist/main.js"],
      "env": {
        "WEBLATE_API_URL": "https://your-weblate-instance.com",
        "WEBLATE_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

### HTTP Clients (Cursor, VS Code, Web Apps)
```json
{
  "transport": "http",
  "url": "http://localhost:3001/mcp"
}
```

## 🛠️ Available Tools

### 🔄 Core Migration
| Tool | Description |
|------|-------------|
| **`migrateTranslationBetweenProjects`** | Intelligently migrate translations with format transformation |

### 🔍 Discovery & Search
| Tool | Description |
|------|-------------|
| **`listProjects`** | List all Weblate projects |
| **`listComponents`** | List components in a project |
| **`listLanguages`** | List available languages |
| **`searchStringInProject`** | Search for translations by content |
| **`searchTranslationsByKey`** | Search for translations by key pattern |
| **`findTranslationsForKey`** | Find all translations for a specific key across components/languages |
| **`listTranslationKeys`** | List all translation keys in a project |
| **`searchTranslationKeys`** | Search for translation keys by pattern |

### 📝 Management
| Tool | Description |
|------|-------------|
| **`getTranslationForKey`** | Get specific translation by key |
| **`writeTranslation`** | Update translation values |

## 💡 Usage Examples

### Basic Migration
```typescript
// Migrate a submit button
await migrateTranslationBetweenProjects({
  oldProjectSlug: "legacy-app",
  newProjectSlug: "new-app",
  newComponentSlug: "frontend",
  newLanguageCode: "en",
  targetKey: "forms.common.submit",
  searchValue: "Submit"
});
```

### Context-Aware Migration
```typescript
// Migrate with context for better matching
await migrateTranslationBetweenProjects({
  oldProjectSlug: "legacy-app",
  newProjectSlug: "new-app",
  newComponentSlug: "frontend",
  newLanguageCode: "en",
  targetKey: "errors.validation.email",
  searchValue: "Invalid email",
  contextDescription: "email validation in login form"
});
```

### Key-Based Search & Discovery
```typescript
// Find all translations for a specific key across all languages
await findTranslationsForKey({
  projectSlug: "my-app",
  key: "common.button.submit"
});

// Search for translations by key pattern
await searchTranslationsByKey({
  projectSlug: "my-app",
  keyPattern: "button",
  exactMatch: false
});

// List all available translation keys
await listTranslationKeys({
  projectSlug: "my-app",
  componentSlug: "frontend" // optional
});

// Search for keys matching a pattern
await searchTranslationKeys({
  projectSlug: "my-app",
  keyPattern: "error",
  componentSlug: "frontend" // optional
});
```

### Bulk Migration Workflow
```typescript
// 1. Search for all error messages
const errors = await searchStringInProject({
  projectSlug: "legacy-app",
  value: "error",
  searchIn: "source"
});

// 2. Migrate each error with proper context
for (const error of errors.matches) {
  await migrateTranslationBetweenProjects({
    oldProjectSlug: "legacy-app",
    newProjectSlug: "new-app",
    newComponentSlug: "frontend",
    newLanguageCode: "en",
    targetKey: generateNewKey(error.key), // Your custom logic
    searchValue: error.source,
    contextDescription: `Error message: ${error.context}`
  });
}
```

## 🔧 Format Transformation

Automatically converts between translation formats:

| Old Format (gettext) | New Format (ICU) | Example |
|---------------------|------------------|---------|
| `%s` | `{placeholder}` | `"Hello %s"` → `"Hello {placeholder}"` |
| `%{name}` | `{name}` | `"Hello %{name}"` → `"Hello {name}"` |
| `%d`, `%i` | `{number}` | `"Found %d items"` → `"Found {number} items"` |
| `%f` | `{decimal}` | `"Price: %f"` → `"Price: {decimal}"` |
| `$variable` | `{variable}` | `"Hello $user"` → `"Hello {user}"` |

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[📖 Documentation Overview](./docs/README.md)** | Complete documentation hub |
| **[⚙️ Setup Guide](./docs/setup.md)** | Installation and configuration |
| **[📋 API Documentation](./docs/api.md)** | All tools with examples and parameters |
| **[🔄 Migration Guide](./docs/migration-guide.md)** | Step-by-step migration workflows |
| **[🔌 Client Configuration](./docs/mcp-client-config.md)** | Configure various MCP clients |
| **[🛠️ Development Guide](./docs/development.md)** | Contributing and extending the server |

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   MCP Client    │───▶│  Weblate MCP     │───▶│  Weblate API    │
│  (IDE/Editor)   │    │     Server       │    │   (REST API)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   7 MCP Tools    │
                       │ • listProjects   │
                       │ • searchString   │
                       │ • migrate...     │
                       │ • etc.          │
                       └──────────────────┘
```

**Technology Stack:**
- **NestJS**: Modern Node.js framework with dependency injection
- **TypeScript**: Full type safety and IntelliSense support
- **Weblate REST API**: Comprehensive API wrapper with interfaces
- **MCP Protocol**: Standard Model Context Protocol implementation
- **Zod**: Runtime type validation for all inputs

## 🧪 Development

### Development Setup
```bash
# Start development server with hot reload
pnpm start:dev

# Run tests
pnpm test

# Run end-to-end tests
pnpm test:e2e

# Generate test coverage
pnpm test:cov

# Build for production
pnpm build
```

### Adding New Tools
1. Create tool file in `src/mcp/tools/`
2. Implement with `@Tool` decorator
3. Add to `McpModule` providers
4. Write tests
5. Update documentation

See [Development Guide](./docs/development.md) for detailed instructions.

## 🎯 Use Cases

### Legacy to Modern Migration
- **PHP gettext** → **JavaScript/TypeScript i18n**
- **Rails i18n** → **React Intl**
- **Old key structures** → **Organized hierarchies**

### Development Workflow Integration
- Say **"migrate the cancel button"** while coding
- Server finds, transforms, and writes the translation
- Focus on building, not translation management

### Translation Maintenance
- **Bulk find-and-replace** operations
- **Status and approval** management
- **Cross-project consistency** checks

## 🔒 Security & Production

- **API Token Security**: Store tokens securely, use environment variables
- **Rate Limiting**: Built-in request throttling and retry logic
- **Error Handling**: Comprehensive error responses with debugging info
- **Health Checks**: `/health` endpoint for monitoring
- **Docker Support**: Production-ready containerization

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](./docs/development.md#contributing):

1. **Fork** the repository
2. **Create** a feature branch from main
3. **Implement** changes with tests
4. **Update** documentation
5. **Submit** a pull request

### Code Style
- Use TypeScript for type safety
- Follow NestJS conventions
- Add comprehensive tests
- Update documentation

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- **Weblate**: For providing an excellent translation management platform
- **Model Context Protocol**: For the standardized protocol specification
- **NestJS**: For the robust application framework
- **Contributors**: Everyone who helps improve this project

---

**Built with ❤️ for the translation community**

*Need help? Check our [documentation](./docs/) or create an [issue](./issues)!* 