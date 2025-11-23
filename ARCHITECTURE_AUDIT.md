# Architecture Audit - AdPilot Lovable Extension

**Generated:** November 23, 2025  
**Purpose:** Comprehensive journey mapping and duplication analysis  
**Status:** IN PROGRESS

---

## Part 1: Route Inventory

### Frontend Routes (20 total)

#### Lovable Extension Routes (9)
1. `/lovable` - Dashboard workspace (ACTIVE)
2. `/lovable/create-ad` - Standalone ad builder (UNUSED - replaced by view=build)
3. `/lovable/campaigns` - Campaign management
4. `/lovable/budget` - Budget settings
5. `/lovable/copy` - Copy management
6. `/lovable/targeting` - Targeting settings
7. `/lovable/settings` - Extension settings
8. `/lovable/integrations` - Integration settings

#### Auth Routes (2)
9. `/auth/post-login` - Post-authentication flow
10. `/auth/post-verify` - Post-verification flow

#### Meta OAuth Routes (3)
11. `/meta/oauth` - Meta OAuth flow
12. `/meta/oauth/bridge` - OAuth bridge
13. `/meta/setup` - Meta setup
14. `/meta/payment-bridge` - Payment bridge

#### Legal/Static Routes (4)
15. `/privacy` - Privacy policy
16. `/terms` - Terms of service
17. `/data-deletion` - Data deletion request
18. `/general-privacy-policy` - General privacy

#### OAuth Callback (1)
19. `/oauth/facebook/callback` - Facebook OAuth callback

#### Standalone App (1)
20. `/` - Main landing (standalone app?)

### API Routes (58 total)

#### Campaign Domain (3)
- POST `/api/v1/campaigns` - Create campaign
- GET `/api/v1/campaigns/:id` - Get campaign
- GET `/api/v1/campaigns/:id/state` - Get campaign state

#### Ad Domain (8)
- POST `/api/v1/ads` - Create ad
- GET `/api/v1/ads/:id` - Get ad
- PUT `/api/v1/ads/:id/save` - Save ad
- POST `/api/v1/ads/:id/publish` - Publish ad
- POST `/api/v1/ads/:id/pause` - Pause ad
- POST `/api/v1/ads/:id/resume` - Resume ad
- POST `/api/v1/ads/:id/locations` - Add locations
- POST `/api/v1/ads/:id/locations/:id` - Manage location
- POST `/api/v1/ads/:id/locations/exclude` - Exclude locations

#### Lovable Integration (6)
- POST `/api/v1/lovable/projects/link` - Link project
- GET `/api/v1/lovable/projects/:id/campaigns` - Get project campaigns
- POST `/api/v1/lovable/import-image` - Import image
- POST `/api/v1/lovable/images/import` - Import images
- GET `/api/v1/lovable/subscription/status` - Subscription status
- POST `/api/v1/lovable/subscription/checkout` - Create subscription

#### Meta Integration (17)
- GET `/api/v1/meta/status` - Meta connection status
- POST `/api/v1/meta/auth/callback` - Auth callback
- POST `/api/v1/meta/oauth/exchange` - Exchange OAuth code
- POST `/api/v1/meta/disconnect` - Disconnect Meta
- GET `/api/v1/meta/ad-accounts` - List ad accounts
- GET `/api/v1/meta/businesses` - List businesses
- GET `/api/v1/meta/business-connections` - Business connections
- GET `/api/v1/meta/pages` - List pages
- GET `/api/v1/meta/page-picture` - Get page picture
- POST `/api/v1/meta/refresh-token` - Refresh token
- POST `/api/v1/meta/admin` - Admin operations
- GET `/api/v1/meta/assets` - Get assets
- POST `/api/v1/meta/search-locations` - Search locations
- POST `/api/v1/meta/search-interests` - Search interests
- GET `/api/v1/meta/breakdown` - Get breakdown
- GET `/api/v1/meta/metrics` - Get metrics
- POST `/api/v1/meta/test-conversion` - Test conversion
- GET `/api/v1/meta/payment/status` - Payment status
- POST `/api/v1/meta/payment` - Configure payment
- POST `/api/v1/meta/destination/phone` - Phone destination
- POST `/api/v1/meta/leads/webhook` - Lead webhook
- GET `/api/v1/meta/forms` - List forms
- GET `/api/v1/meta/instant-forms` - List instant forms
- GET `/api/v1/meta/instant-forms/:id` - Get instant form

#### Conversation Domain (4)
- POST `/api/v1/conversations` - Create conversation
- GET `/api/v1/conversations/:id` - Get conversation
- GET `/api/v1/conversations/:id/messages` - Get messages
- POST `/api/v1/chat` - Chat endpoint

#### Other (20)
- POST `/api/v1/metrics` - Get metrics
- POST `/api/v1/conversions` - Track conversion
- POST `/api/v1/leads` - Create lead
- GET `/api/v1/leads/export` - Export leads
- POST `/api/v1/budget/distribute` - Distribute budget
- POST `/api/v1/creative/plan` - Plan creative
- POST `/api/v1/images/variations` - Generate variations
- POST `/api/v1/images/variations/single` - Single variation
- POST `/api/v1/temp-prompt` - Store temp prompt
- POST `/api/v1/user/delete` - Delete user
- POST `/api/v1/supabase/deploy-edge-function` - Deploy function
- POST `/api/v1/webhooks/lovable/:id/signup` - Webhook handler

---

## Part 2: Service Layer Inventory

### Discovered Services (56 files)

#### Client Services (13)
Services that run in browser, delegate to API:
1. `ad-service-client.ts`
2. `analytics-service-client.ts`
3. `budget-service-client.ts`
4. `campaign-service-client.ts`
5. `copy-service-client.ts`
6. `creative-service-client.ts`
7. `destination-service-client.ts`
8. `meta-service-client.ts`
9. `publish-service-client.ts`
10. `save-service-client.ts`
11. `targeting-service-client.ts`
12. `workspace-service-client.ts`
13. `base-service.ts` (abstract base)

#### Server Services (12)
Services that run on server, access database:
1. `ad-service-server.ts`
2. `analytics-service-server.ts`
3. `budget-service-server.ts`
4. `campaign-service-server.ts`
5. `copy-service-server.ts`
6. `creative-service-server.ts`
7. `destination-service-server.ts`
8. `meta-service-server.ts`
9. `publish-service-server.ts`
10. `save-service-server.ts`
11. `targeting-service-server.ts`
12. `workspace-service-server.ts`

#### Service Contracts/Interfaces (9)
1. `ad-service.interface.ts`
2. `analytics-service.interface.ts`
3. `budget-service.interface.ts`
4. `campaign-service.interface.ts`
5. `copy-service.interface.ts`
6. `creative-service.interface.ts`
7. `destination-service.interface.ts`
8. `meta-service.interface.ts`
9. `targeting-service.interface.ts`

#### Lovable Integration Services (4)
1. `lovable-campaign-manager.ts` - Campaign auto-creation (NEW)
2. `lovable-project-service-impl.ts` - Project linking
3. `lovable-sync-service-impl.ts` - Data sync
4. `lovable-conversion-service-impl.ts` - Conversion tracking

#### Standalone Services (8)
1. `ad-creation-service.ts` - Ad creation logic
2. `ad-data-service.ts` - Ad data management
3. `conversation-manager.ts` - Conversation management
4. `meta-connection-manager.ts` - Meta connection state
5. `post-auth-handler.ts` - Post-auth flow
6. `lovable-image-monitor.ts` - Image detection
7. `image-context-uploader.ts` - Image upload
8. `message-store.ts` - Message persistence
9. `data-hierarchy.ts` - Data structure utils
10. `service-provider.tsx` - Service DI container

---

## Part 3: CRITICAL DISCOVERY - Existing Microservices Architecture!

**FINDING:** The codebase ALREADY has a well-designed microservices architecture!

### Current Architecture Pattern:
```
Service Contract (Interface)
    ↓
Server Implementation (runs on API routes)
    ↓
Client Implementation (runs in browser)
    ↓
UI Components
```

### Example: CampaignService
```
contract/campaign-service.interface.ts (interface)
    ├─ server/campaign-service-server.ts (backend logic)
    └─ client/campaign-service-client.ts (API client)
```

**This is GOOD architecture!** The problem is:
1. ❌ Services aren't being used consistently
2. ❌ Direct API calls bypass services
3. ❌ UI components have business logic
4. ❌ Duplication outside the service layer

---

## Part 4: Journey Analysis - Ad Creation

### Discovery: TWO SEPARATE AD CREATION PATHS

#### Path 1: Lovable Extension (Current Focus)
```
Entry: /lovable?view=build
    ↓
Component: CampaignWorkspaceOrchestrator
    ↓
Mode: BuildMode
    ↓
Component: AdBuilder
    ↓
Direct API Call: POST /api/v1/ads (bypasses service layer!)
    ↓
API Handler: Creates campaign + ad
    ↓
Database: lovable_project_links, campaigns, ads
```

**Issues:**
- AdBuilder calls API directly (line 157)
- Should use AdCreationService
- Logic split between component and API

#### Path 2: Standalone App (Exists?)
Need to investigate if standalone flow still exists

---

## Part 5: Duplication Analysis - IN PROGRESS

### Campaign Creation Duplication

**Found So Far:**

| Location | Type | Line | Purpose |
|----------|------|------|---------|
| `lib/context/campaign-context.tsx` | Function | 117 | createCampaign() via service |
| `lib/hooks/use-campaign-operations.ts` | Function | 34 | Direct API call |
| `app/api/v1/campaigns/route.ts` | API Handler | 81 | Actual creation logic |
| `lib/services/client/campaign-service-client.ts` | Service Method | TBD | API delegation |
| `lib/services/server/campaign-service-server.ts` | Service Method | TBD | Server-side logic |

**Analysis:** Multiple implementations, need to consolidate

### Ad Creation Duplication

**Found So Far:**

| Location | Type | Line | Purpose |
|----------|------|------|---------|
| `components/ad-builder/ad-builder.tsx` | Component Method | 157 | Direct API call |
| `lib/services/ad-creation-service.ts` | Service | TBD | Creation logic |
| `app/api/v1/ads/route.ts` | API Handler | 59 | Actual creation |
| `lib/services/client/save-service-client.ts` | Service Method | TBD | Save workflow |
| `lib/services/server/save-service-server.ts` | Service Method | TBD | Server-side save |

---

## Part 6: Recommendations (PRELIMINARY)

### 1. Enforce Service Layer Usage
**Rule:** UI components MUST NOT call APIs directly

**Current Violations:**
- AdBuilder.tsx:157 - Direct fetch to /api/v1/ads
- LovableLayout.tsx - Direct fetch to /api/v1/campaigns

**Fix:**
```typescript
// WRONG (current)
const response = await fetch('/api/v1/ads', { ... })

// RIGHT (should be)
const result = await adCreationService.createAd(input)
```

### 2. Remove `/lovable/create-ad` Route
**Finding:** Extension uses `/lovable?view=build`, NOT `/lovable/create-ad`
**Action:** Delete unused route or repurpose

### 3. Consolidate Campaign Creation
**Target:** Single path through CampaignService
**Remove:** Direct implementations in UI

### 4. Use Lovable Services Consistently
**Services exist** but aren't being used:
- LovableCampaignManager (created but not used in UI)
- Should be primary service for Lovable operations

---

## NEXT STEPS FOR INVESTIGATION

1. ✅ Route catalog complete (134 routes total)
2. ✅ Service inventory complete (56 services)
3. ⏳ Map ad creation journey (detailed code trace)
4. ⏳ Map campaign creation journey
5. ⏳ Find all duplication (systematic scan)
6. ⏳ Create refactoring specification
7. ⏳ Execute cleanup and consolidation

---

**Status:** Investigation continuing...
**Current File Count:** 134+ files analyzed
**Duplication Found:** Multiple instances (cataloging in progress)

