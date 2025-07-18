# Weblate MCP Server Setup

This guide shows you how to configure and use the Weblate MCP (Model Context Protocol) server with Claude Desktop and other MCP-compatible clients.

## Quick Start

### Installation & Configuration

1. **Add to Claude Desktop configuration**
   
   Edit your Claude Desktop configuration file:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

2. **Add the Weblate MCP server configuration**:

```json
{
  "mcpServers": {
    "weblate": {
      "command": "npx",
      "args": ["-y", "@mmntm/weblate-mcp"],
      "env": {
        "WEBLATE_API_URL": "https://your-weblate-instance.com/api",
        "WEBLATE_API_TOKEN": "your-weblate-api-token"
      }
    }
  }
}
```

3. **Environment Variables Required**:
   - `WEBLATE_API_URL`: Your Weblate instance API endpoint (e.g., `https://hosted.weblate.org/api`)
   - `WEBLATE_API_TOKEN`: Your Weblate API authentication token

### Getting Your Weblate API Token

1. Log into your Weblate instance
2. Go to **Settings** → **API access**
3. Create a new token or copy an existing one
4. The token should have appropriate permissions for the projects you want to manage

## Configuration Examples

### Basic Configuration
```json
{
  "mcpServers": {
    "weblate": {
      "command": "npx",
      "args": ["-y", "@mmntm/weblate-mcp"],
      "env": {
        "WEBLATE_API_URL": "https://hosted.weblate.org/api",
        "WEBLATE_API_TOKEN": "wlt_abc123def456..."
      }
    }
  }
}
```

### Self-hosted Weblate
```json
{
  "mcpServers": {
    "weblate": {
      "command": "npx",
      "args": ["-y", "@mmntm/weblate-mcp"],
      "env": {
        "WEBLATE_API_URL": "https://weblate.mycompany.com/api",
        "WEBLATE_API_TOKEN": "wlt_your_token_here"
      }
    }
  }
}
```

### Multiple Weblate Instances
```json
{
  "mcpServers": {
    "weblate-prod": {
      "command": "npx",
      "args": ["-y", "@mmntm/weblate-mcp"],
      "env": {
        "WEBLATE_API_URL": "https://weblate-prod.company.com/api",
        "WEBLATE_API_TOKEN": "wlt_prod_token"
      }
    },
    "weblate-staging": {
      "command": "npx",
      "args": ["-y", "@mmntm/weblate-mcp"],
      "env": {
        "WEBLATE_API_URL": "https://weblate-staging.company.com/api",
        "WEBLATE_API_TOKEN": "wlt_staging_token"
      }
    }
  }
}
```

## Available Tools

Once configured, you'll have access to these translation management tools:

- **listProjects** - List all available Weblate projects
- **listComponents** - List components in a specific project  
- **listLanguages** - List languages available in a project
- **searchUnitsWithFilters** ⭐ - **Efficient search using Weblate's native filtering syntax**
- **searchStringInProject** - Search for translations containing specific text
- **getTranslationForKey** - Get translation value for a specific key
- **writeTranslation** - Write or update a translation value
- **findTranslationsForKey** - Find all translations for a specific key

## Usage Examples

### ⭐ Efficient Translation Search (Recommended)

Use `searchUnitsWithFilters` for the most efficient queries:

> "Find all untranslated strings in Slovak for the 'common' component using `searchUnitsWithFilters` with query `state:=0`"

> "Show me strings that need editing in French for the 'frontend' component using `searchUnitsWithFilters` with query `state:=10`"

> "Find all strings containing 'error' in the source text using `searchUnitsWithFilters` with query `source:\"error\"`"

### General Translation Management

> "List all projects in my Weblate instance"

> "Show me all languages available for the 'mobile-app' project"

> "Find all translations containing 'login' in the 'web-frontend' project"

> "Update the French translation for key 'welcome.message' to 'Bienvenue sur notre plateforme'"

### 🚀 Why searchUnitsWithFilters is Better

Instead of asking for "all translation keys" and then checking each one individually (which can make thousands of API calls), use efficient filtering:

- **❌ Inefficient**: "List all keys, then check each one for translation status"
- **✅ Efficient**: "Search for untranslated strings using `state:=0` filter"

The `searchUnitsWithFilters` tool uses Weblate's native search capabilities for optimal performance.

## Troubleshooting

### Common Issues

1. **"Server failed to start"**
   - Check that your `WEBLATE_API_URL` and `WEBLATE_API_TOKEN` are correct
   - Ensure the Weblate API is accessible from your network
   - Verify the API token has the necessary permissions

2. **"npx command not found"**
   - Make sure Node.js and npm are installed
   - Try using the full path: `/usr/local/bin/npx` (on macOS/Linux)

3. **"Package not found"**
   - Ensure you have internet connectivity for npx to download the package
   - Try running `npx @mmntm/weblate-mcp` manually first

4. **"API authentication failed"**
   - Double-check your API token is valid and not expired
   - Verify the token has access to the projects you're trying to use

### Manual Testing

You can test the server manually:

```bash
# Test if the package can be run
npx @mmntm/weblate-mcp

# Or install globally and test
npm install -g @mmntm/weblate-mcp
weblate-mcp
```

### Logs and Debugging

MCP servers run in STDIO mode with logging disabled by default. If you need to debug:

1. Check Claude Desktop's logs (usually in the app's log directory)
2. Test the Weblate API directly: `curl -H "Authorization: Token YOUR_TOKEN" https://your-weblate-instance.com/api/projects/`

## Security Notes

- Keep your Weblate API tokens secure and don't share them
- Use tokens with minimal necessary permissions
- Consider using project-specific tokens if your Weblate instance supports them
- Regularly rotate your API tokens

## More Information

- [Weblate API Documentation](https://docs.weblate.org/en/latest/api.html)
- [MCP (Model Context Protocol)](https://modelcontextprotocol.io/)
- [Claude Desktop Configuration](https://docs.anthropic.com/claude/docs)

## Support

If you encounter issues:
1. Check this documentation first
2. Verify your Weblate API setup
3. Test the package manually with `npx @mmntm/weblate-mcp`
4. Report issues on the [GitHub repository](https://github.com/mmntm/weblate-mcp) 