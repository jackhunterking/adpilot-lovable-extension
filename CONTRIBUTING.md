# Contributing to AdPilot for Lovable Extension

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. **Fork the repository**
2. **Clone your fork:**
   ```bash
   git clone https://github.com/yourusername/adpilot-lovable-extension.git
   cd adpilot-lovable-extension
   ```
3. **Load extension** in Chrome (see [DEVELOPMENT.md](docs/DEVELOPMENT.md))
4. **Create a branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Guidelines

### Code Style

- Use ES6+ JavaScript
- Add JSDoc comments for all functions
- Use descriptive variable names
- Keep functions small and focused
- Log important events with `[AdPilot]` prefix

### Example

```javascript
/**
 * Inject Ads tab into Lovable navigation
 * @returns {void}
 */
function injectAdsTab() {
  console.log('[AdPilot] Injecting tab...');
  // Implementation
}
```

### File Organization

- **`background/`** - Service worker code
- **`content/`** - Content scripts and styles
- **`services/`** - Reusable business logic
- **`ui/`** - UI components
- **`types/`** - TypeScript types

### Naming Conventions

- Files: `kebab-case.js`
- Functions: `camelCase()`
- Classes: `PascalCase`
- Constants: `SCREAMING_SNAKE_CASE`

## Making Changes

### 1. Small Changes

For typos, docs, small fixes:
- Make change
- Test locally
- Submit PR

### 2. New Features

For new features:
1. Open an issue first (discuss approach)
2. Get approval
3. Implement feature
4. Add tests (if applicable)
5. Update documentation
6. Submit PR

### 3. Bug Fixes

For bugs:
1. Create issue with reproduction steps
2. Fix bug
3. Verify fix
4. Submit PR referencing issue

## Testing Your Changes

Before submitting PR:

1. **Validate manifest:**
   ```bash
   npm run validate
   ```

2. **Load extension in Chrome:**
   - Reload extension
   - Test on Lovable project
   - Check console for errors

3. **Test scenarios:**
   - Fresh install
   - Extension update
   - Multiple Lovable projects
   - Page navigation

## Pull Request Process

### 1. Commit Messages

Use conventional commits format:

```
feat: add image monitoring service
fix: resolve tab injection timing issue
docs: update README with new features
chore: update dependencies
```

### 2. PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement

## Testing
- [ ] Tested in Chrome
- [ ] No console errors
- [ ] Works on Lovable

## Screenshots (if applicable)
Add screenshots showing changes
```

### 3. Review Process

1. Submit PR
2. Maintainer reviews
3. Address feedback
4. PR merged

## Code of Conduct

- Be respectful and constructive
- Welcome newcomers
- Focus on the code, not the person
- Assume good intentions

## Questions?

- **Issues:** [GitHub Issues](https://github.com/yourusername/adpilot-lovable-extension/issues)
- **Email:** dev@adpilot.com
- **Docs:** [docs.adpilot.com](https://docs.adpilot.com)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

