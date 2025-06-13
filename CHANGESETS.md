# Changesets Usage Guide

This project uses [Changesets](https://github.com/changesets/changesets) to manage versioning and changelogs.

## What are Changesets?

Changesets is a tool that helps manage versioning and publishing for packages. It allows you to:
- Track what changes need to be released
- Generate semantic version bumps
- Create automated changelogs
- Coordinate releases

## Basic Workflow

### 1. Making Changes
When you make changes to the codebase that should be released, create a changeset:

```bash
pnpm changeset add
```

This will prompt you to:
- Select the type of change (major, minor, patch)
- Write a summary of the changes

### 2. Versioning
When you're ready to create a new version:

```bash
pnpm changeset:version
```

This will:
- Consume all changesets
- Update the version in `package.json`
- Generate/update `CHANGELOG.md`

### 3. Publishing
To publish the new version:

```bash
pnpm changeset:publish
```

This will:
- Build the project
- Publish to npm (if configured)
- Create git tags

## Change Types

- **patch** (1.0.0 → 1.0.1): Bug fixes, small improvements
- **minor** (1.0.0 → 1.1.0): New features, non-breaking changes
- **major** (1.0.0 → 2.0.0): Breaking changes

## Example Changeset

```markdown
---
'weblate-mcp-server': minor
---

Add new translation search functionality

- Implement fuzzy search for translation keys
- Add support for regex patterns in search
- Improve error handling for API responses
```

## Available Scripts

- `pnpm changeset` - Create a new changeset
- `pnpm changeset:version` - Version and update changelog
- `pnpm changeset:publish` - Build and publish

## Configuration

The changeset configuration is in `.changeset/config.json`. Key settings:
- `access: "public"` - Package will be published as public
- `baseBranch: "main"` - Default branch for comparisons
- `changelog: "@changesets/cli/changelog"` - Changelog generator

## Tips

1. **Write good summaries**: The changeset summary becomes part of your changelog
2. **Be specific**: Include what was changed and why
3. **Use conventional language**: Follow semantic versioning principles
4. **Review before versioning**: Check all pending changesets with `pnpm changeset status`

For more information, see the [official Changesets documentation](https://github.com/changesets/changesets). 