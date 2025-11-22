# Lovable Extension Architecture - Simplified

## Overview

AdPilot for Lovable is now a simplified, feature-based Chrome extension with direct UI pages (no chat/journey system). It provides 6 core marketing features accessible through a dashboard.

## Architecture Principles

1. **Feature-Based**: Each marketing capability has its own dedicated page
2. **No Chat Interface**: Direct UI interactions instead of conversational AI
3. **Lovable-Only**: Focused exclusively on Lovable editor integration
4. **Service-Driven**: Direct API calls using custom hooks
5. **Context-Based State**: React Context for state management

## Core Features

### 1. Dashboard (`/lovable/page.tsx`)
- Feature grid with 6 marketing tools
- Quick stats overview
- Quick start guide
- Navigation hub for all features

### 2. Create Ad (`/lovable/create-ad/page.tsx`)
- AI-powered dual-format image generation
- Reference image upload for context
- Preview in mobile ad mockups
- Format toggle (square/vertical)

### 3. Ad Copy (`/lovable/copy/page.tsx`)
- AI copy generation with multiple variations
- Tone selection (professional, casual, urgent, luxury, playful, informative)
- Headline, body, and CTA generation
- Copy preview and selection

### 4. Targeting (`/lovable/targeting/page.tsx`)
- Location search and selection
- Include/exclude mode
- Map visualization
- Age and gender demographics

### 5. Budget & Schedule (`/lovable/budget/page.tsx`)
- Daily vs lifetime budget
- Start/end date scheduling
- Cost estimates
- Performance projections

### 6. Campaigns (`/lovable/campaigns/page.tsx`)
- Campaign list view
- Create/delete campaigns
- Campaign status management
- Automatic Lovable project linking

### 7. Analytics (`/lovable/analytics/page.tsx`)
- Performance metrics dashboard
- Daily breakdown table
- Automated insights
- CSV export

## Technical Stack

### Frontend
- **Next.js 14+**: App Router
- **React 18+**: Server and Client Components
- **TypeScript**: Full type safety
- **Tailwind CSS**: Styling
- **shadcn/ui**: Component library

### Backend
- **Supabase**: PostgreSQL database, Auth, Storage
- **Meta API**: Facebook/Instagram ads integration
- **AI Services**: Image and copy generation

### Extension
- **Manifest V3**: Chrome extension
- **Content Script**: DOM injection
- **Service Worker**: Minimal background processing

## Component Structure

```
components/
├── lovable/
│   ├── lovable-navigation.tsx    # Tab navigation
│   ├── lovable-layout.tsx        # Shared layout with auth
│   ├── feature-card.tsx          # Dashboard feature cards
│   └── progress-stepper.tsx      # Multi-step indicators
├── ui/                           # shadcn/ui components
└── [feature-specific]/           # Components for each feature
```

## Service Hooks

```
lib/hooks/
├── use-location-search.ts        # Location targeting
├── use-image-generation.ts       # AI image generation
├── use-copy-generation.ts        # AI copy generation
├── use-campaign-operations.ts    # Campaign CRUD
└── use-meta-metrics.ts          # Analytics data
```

## Context Providers

```
lib/context/
├── campaign-context.tsx          # Campaign state
├── ad-preview-context.tsx        # Ad preview state
├── location-context.tsx          # Location targeting state
├── budget-context.tsx            # Budget configuration
├── ad-copy-context.tsx           # Copy state
└── auth-provider.tsx             # Authentication
```

## API Routes

All API routes remain under `/app/api/v1/`:
- `/campaigns` - Campaign CRUD
- `/ads` - Ad CRUD
- `/meta/*` - Meta API integration
- `/images/variations` - Image generation
- `/creative/plan` - Copy generation
- `/lovable/*` - Lovable-specific endpoints

## State Management Pattern

### Before (Journey-based)
```typescript
const journey = LocationJourney()
journey.renderTool(toolPart)
```

### After (Direct service)
```typescript
const { searchLocations, loading, results } = useLocationSearch()
const handleSearch = async (query: string) => {
  await searchLocations(query)
}
```

## Navigation Flow

1. User opens Lovable project
2. Extension injects "Grow" tab
3. Click opens iframe at `/lovable` (dashboard)
4. Dashboard shows 6 feature cards
5. Click card navigates to feature page
6. Navigation tabs persist across pages

## Authentication Flow

1. Check Google Auth (via Supabase)
2. Create/load campaign for Lovable project
3. Check Meta connection (if required by page)
4. Show feature page when ready

## Key Differences from Previous Architecture

### Removed
- ❌ Journey system (10 journey modules)
- ❌ Journey registry and orchestration
- ❌ Chat/conversation interface
- ❌ AI SDK conversation management
- ❌ Message rendering system
- ❌ Standalone product routes

### Added
- ✅ Feature-based page structure
- ✅ Direct service hooks
- ✅ Simplified navigation component
- ✅ Dashboard with feature grid
- ✅ Lovable-specific layout wrapper

## Development Workflow

1. **Add New Feature Page**
   - Create page in `/app/lovable/[feature]/page.tsx`
   - Use `LovableLayout` wrapper
   - Create service hook if needed
   - Add to navigation in `lovable-navigation.tsx`

2. **Add New Service Hook**
   - Create hook in `/lib/hooks/use-[feature].ts`
   - Follow useState + callback pattern
   - Return loading, error, and data states

3. **Update Feature**
   - Edit page component directly
   - Update service hook if needed
   - Test in Lovable extension

## File Locations

### Pages
- `/app/lovable/page.tsx` - Dashboard
- `/app/lovable/create-ad/page.tsx` - Create Ad
- `/app/lovable/copy/page.tsx` - Ad Copy
- `/app/lovable/targeting/page.tsx` - Targeting
- `/app/lovable/budget/page.tsx` - Budget
- `/app/lovable/campaigns/page.tsx` - Campaigns
- `/app/lovable/analytics/page.tsx` - Analytics

### Components
- `/components/lovable/lovable-navigation.tsx`
- `/components/lovable/lovable-layout.tsx`
- `/components/lovable/feature-card.tsx`
- `/components/lovable/progress-stepper.tsx`

### Hooks
- `/lib/hooks/use-location-search.ts`
- `/lib/hooks/use-image-generation.ts`
- `/lib/hooks/use-copy-generation.ts`
- `/lib/hooks/use-campaign-operations.ts`
- `/lib/hooks/use-meta-metrics.ts`

### Extension
- `/content/inject.js` - Content script (points to `/lovable`)
- `/manifest.json` - Extension manifest
- `/background/service-worker.js` - Service worker

## Testing

### Manual Testing Checklist
- [ ] Dashboard loads and shows 6 features
- [ ] Create Ad: Image generation works
- [ ] Ad Copy: Copy generation works
- [ ] Targeting: Location search works
- [ ] Budget: Budget calculation works
- [ ] Campaigns: CRUD operations work
- [ ] Analytics: Metrics display correctly
- [ ] Navigation between pages works
- [ ] Auth flow works (Google + Meta)
- [ ] Extension integration works

## Deployment

1. Build Next.js app: `npm run build`
2. Deploy to production (Vercel recommended)
3. Update `content/inject.js` with production URL
4. Package extension: `npm run package`
5. Submit to Chrome Web Store

## Support

For questions or issues:
- See `README.md` for setup instructions
- See `DEVELOPMENT.md` for detailed development guide
- See `CURSOR_RULES.md` for AI assistant guidelines

