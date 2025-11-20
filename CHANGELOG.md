# Changelog

All notable changes to AdPilot for Lovable extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Image monitoring service
- Advanced iframe communication
- Error handling improvements
- Chrome Web Store listing

## [0.2.0] - 2025-11-20

### Fixed
- Tab injection using evidence-based DOM selectors
- Changed iframe to use local panel.html (no DNS errors)
- Proper navigation matching Lovable's ?view= pattern
- Content area hiding using [data-panel-group] selector
- Robust waiting strategy (30s timeout, 500ms checks)
- postMessage communication between extension and iframe

### Changed
- Complete rewrite of content/inject.js with actual Lovable structure
- Updated panel.html with better UI and status display
- Navigation now integrates with Lovable's URL routing

### Technical
- Found navigation structure: ul.flex.items-center.gap-1
- Cloud button classes copied exactly
- Panel replaces [data-panel-group] element
- Uses chrome.runtime.getURL for local resources

## [0.1.0] - 2025-11-20

### Added
- Initial release
- Tab injection into Lovable editor
- Project context detection
- Basic iframe integration
- Service worker for extension lifecycle
- Type-safe postMessage contracts
- Documentation (Development, Testing, Deployment)

### Security
- Origin validation for postMessage
- Minimal permission model
- No sensitive data storage

## Release Notes Template (for future releases)

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- New features

### Changed
- Changes to existing functionality

### Deprecated
- Soon-to-be removed features

### Removed
- Removed features

### Fixed
- Bug fixes

### Security
- Security improvements
```

