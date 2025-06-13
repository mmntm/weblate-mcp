# Weblate MCP Server Documentation

Welcome to the comprehensive documentation for the Weblate Model Context Protocol (MCP) Server. This documentation will help you understand, install, configure, and contribute to the project.

## 📚 Documentation Overview

### Getting Started
- **[Installation & Setup](./MCP_SETUP.md)** - Complete guide to installing and configuring the MCP server
- **[Quick Start](#quick-start)** - Get up and running in minutes

### Development & Contributing
- **[Development Guide](./DEVELOPMENT.md)** - Setting up the development environment
- **[API Reference](./API.md)** - Complete API documentation
- **[Architecture](./ARCHITECTURE.md)** - Understanding the codebase structure

### Release Management
- **[Release Process](./RELEASE.md)** - How releases are managed and published
- **[Changesets Guide](./CHANGESETS.md)** - Using changesets for version management

## 🚀 Quick Start

### NPX Installation (Recommended)
```bash
# Install and run directly with npx
npx @mmntm/weblate-mcp
```

### Global Installation
```bash
# Install globally
npm install -g @mmntm/weblate-mcp

# Run the server
weblate-mcp
```

### Configuration
Add to your Claude Desktop configuration:
```json
{
  "mcpServers": {
    "weblate": {
      "command": "npx",
      "args": ["-y", "@mmntm/weblate-mcp"],
      "env": {
        "WEBLATE_API_URL": "https://your-weblate-instance.com/api/",
        "WEBLATE_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `WEBLATE_API_URL` | Your Weblate instance API URL | ✅ |
| `WEBLATE_API_TOKEN` | Your Weblate API token | ✅ |
| `PORT` | Server port (default: 3000) | ❌ |
| `NODE_ENV` | Environment mode | ❌ |

## 📖 Available Tools

The MCP server provides the following tools for interacting with Weblate:

### Project Management
- `list_projects` - List all projects
- `get_project` - Get project details
- `create_project` - Create a new project

### Component Management
- `list_components` - List components in a project
- `get_component` - Get component details
- `create_component` - Create a new component

### Translation Management
- `list_translations` - List translations for a component
- `get_translation` - Get translation details
- `update_translation` - Update translation strings

### Language Management
- `list_languages` - List available languages
- `get_language` - Get language details

## 🏗️ Architecture

The server is built with:
- **NestJS** - Modern Node.js framework
- **TypeScript** - Type-safe development
- **MCP SDK** - Model Context Protocol implementation
- **Modular Services** - Clean separation of concerns

```
src/
├── services/weblate/     # Weblate API services
│   ├── base-weblate.service.ts
│   ├── projects.service.ts
│   ├── components.service.ts
│   ├── translations.service.ts
│   └── languages.service.ts
├── types/               # TypeScript definitions
├── tools/              # MCP tool implementations
└── main.ts            # Application entry point
```

## 🤝 Contributing

We welcome contributions! Please see our [Development Guide](./DEVELOPMENT.md) for details on:
- Setting up the development environment
- Code style and conventions
- Testing procedures
- Submitting pull requests

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/mmntm/weblate-mcp)
- [NPM Package](https://www.npmjs.com/package/@mmntm/weblate-mcp)
- [Weblate Documentation](https://docs.weblate.org/)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## 📞 Support

If you encounter any issues or have questions:
1. Check the [documentation](./MCP_SETUP.md)
2. Search [existing issues](https://github.com/mmntm/weblate-mcp/issues)
3. Create a [new issue](https://github.com/mmntm/weblate-mcp/issues/new) 