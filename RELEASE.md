# Release Process

This project uses an automated release process powered by Changesets and GitHub Actions.

## How It Works

### 1. Development Workflow
1. Make changes to the codebase
2. Create a changeset: `pnpm changeset add`
3. Commit your changes and the changeset
4. Create a Pull Request

### 2. Release Workflow
1. When PR is merged to `main`, GitHub Actions automatically:
   - Runs CI checks (build, test, lint)
   - Detects if there are pending changesets
   - If changesets exist:
     - Bumps version in `package.json`
     - Updates `CHANGELOG.md`
     - Publishes to npm
     - Creates a GitHub release with release notes

## GitHub Actions Workflows

### 🧪 CI Workflow (`.github/workflows/ci.yml`)
**Triggers:** Push to main/develop, Pull Requests  
**Purpose:** Quality checks before merging

- 🥡 Setup pnpm with latest version
- 🟢 Setup Node.js LTS with caching
- 🧩 Install dependencies with frozen lockfile
- 🔍 Run linting and format checks
- 🏗️ Build the project in production mode
- 🧪 Run tests (if available)
- ✅ Validate build output exists

### 📦 Release Workflow (`.github/workflows/release.yml`)
**Triggers:** Push to main branch
**Purpose:** Automated releases and npm publishing

- 🥡 Setup pnpm with matrix strategy
- 🟢 Setup Node.js LTS with npm registry
- 🧩 Install dependencies with frozen lockfile
- 🏗️ Build the project in production mode
- 📣 Use Changesets to handle versioning and publishing
- 🏷️ Create GitHub releases with auto-generated notes

## Required Secrets

To enable npm publishing, add the following secrets to your GitHub repository:

### `NPM_TOKEN`
1. Go to [npmjs.com](https://www.npmjs.com) and log in
2. Go to Access Tokens in your account settings
3. Create a new **Automation** token with "Publish and access public packages" permission
4. Copy the token
5. In your GitHub repo: Settings → Secrets and variables → Actions
6. Add new secret named `NPM_TOKEN` with your token value

### `GITHUB_TOKEN` (Optional)
The `GITHUB_TOKEN` is automatically provided by GitHub Actions, but if you need additional permissions or are using a private repository, you may need to create a Personal Access Token:

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate a new token with `repo`, `write:packages`, and `read:packages` permissions
3. Add it as a secret named `GITHUB_TOKEN` (this will override the default one)

## Repository Setup

### 1. Enable GitHub Actions
- Go to repository Settings → Actions → General
- Ensure "Allow all actions and reusable workflows" is selected

### 2. Configure Branch Protection (Recommended)
- Go to Settings → Branches
- Add protection rule for `main` branch:
  - Require status checks to pass before merging
  - Require branches to be up to date before merging
  - Include administrators

### 3. npm Publishing Configuration
Make sure your `package.json` has:
```json
{
  "name": "weblate-mcp-server",
  "version": "1.0.0",
  "main": "dist/main.js",
  "files": [
    "dist/**/*",
    "README.md",
    "LICENSE"
  ],
  "publishConfig": {
    "access": "public"
  }
}
```

## Release Types

The workflow supports all semantic versioning types:

- **Patch** (1.0.0 → 1.0.1): Bug fixes, documentation updates
- **Minor** (1.0.0 → 1.1.0): New features, non-breaking changes  
- **Major** (1.0.0 → 2.0.0): Breaking changes

## Manual Release Process

If you need to release manually:

```bash
# 1. Version and update changelog
pnpm changeset:version

# 2. Commit the version changes
git add .
git commit -m "chore: release v1.0.1"

# 3. Build and publish
pnpm changeset:publish

# 4. Push changes and tags
git push origin main --follow-tags
```

## Troubleshooting

### Release Workflow Not Triggering
- Check that you have changesets in `.changeset/` directory
- Ensure the push is to the `main` branch
- Verify GitHub Actions are enabled

### npm Publish Failing
- Check that `NPM_TOKEN` secret is correctly configured
- Verify package name is unique on npm
- Ensure package.json `version` field is correct

### Build Failing
- Check that all dependencies are properly installed
- Verify build command works locally: `pnpm run build`
- Check for any missing environment variables

## Monitoring Releases

- **GitHub Actions Tab**: View workflow runs and logs
- **GitHub Releases**: See published releases with notes
- **npm Package Page**: View published versions
- **CHANGELOG.md**: Track all changes over time

For more information about Changesets, see [CHANGESETS.md](./CHANGESETS.md). 