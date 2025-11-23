# Changelog

All notable changes to AdPilot for Lovable extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Image monitoring service
- Advanced iframe communication
- Chrome Web Store listing

## [0.3.0] - 2025-11-23

### Added
- **Duplicate Ad Feature**: Clone existing ads with all data (creative, copy, targeting, budget)
- API endpoint: `POST /api/v1/ads/[id]/duplicate`
- Service method: `adService.duplicateAd.execute()`
- Helper files for location mode management

### Removed (Breaking Changes)
- Conversation/messaging infrastructure (uses Lovable AI directly now)
- 4 API routes: `/api/v1/conversations/*`, `/api/v1/chat`
- 4 service files: `conversation-manager.ts`, `message-store.ts`, `finish-handler-service.ts`, `summarization.ts`
- Database tables: `conversations`, `conversation_messages`
- ~1,200 lines of dead code

### Changed
- **Service Layer**: Achieved 100% compliance (all components use services)
- Refactored `ad-builder.tsx` to use `adService`
- Refactored `current-ad-context.tsx` to use `adService.saveSnapshot`
- Refactored `use-campaign-operations.ts` - all 5 methods use services
- Refactored `preview-panel.tsx` - 6 fetch calls replaced with services
- Cleaned `campaign-context.tsx` - removed conversation code
- Updated API contracts - removed conversation routes

### Fixed
- All service layer violations (5 fixes)
- TypeScript strict null checks in multiple files
- Missing service provider exports
- Build cache issues with deleted routes

### Database
- Migration `20251123000001_remove_conversations.sql` applied via Supabase MCP
- Dropped `conversations` and `conversation_messages` tables
- Cascade-removed all related indexes, RLS policies, and foreign keys

### Documentation
- Created `COMPREHENSIVE_ARCHITECTURAL_REVIEW.md` - full 10-phase audit
- Created `REFACTORING_SUCCESS_REPORT.md` - refactoring summary
- Updated `.cursorrules` - added service layer patterns
- Updated `README.md` - documented new features

### Technical Improvements
- Service layer compliance: 95% → 100%
- Code reduction: ~950 net lines removed
- Build size: Smaller (dead code eliminated)
- Type safety: Maintained throughout
- Linter errors: 0 (no new errors introduced)

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

