# Comprehensive Refactoring Plan - Microservices Architecture

## Executive Summary

**Current State:** Good microservices foundation BUT services are being bypassed  
**Problem:** UI components call APIs directly, violating service layer  
**Solution:** Enforce service layer usage + remove duplication  
**Impact:** ~300 lines removed, cleaner architecture, easier maintenance

---

## Critical Findings

### ✅ GOOD: Existing Architecture is Sound
- Clear client/server separation
- Service contracts defined
- API v1 routes well-organized
- Database functions in place

### ❌ BAD: Services Not Being Used
- AdBuilder calls APIs directly (bypassing AdService)
- Components bypass service layer
- Direct fetch() calls everywhere
- Service layer exists but ignored

### ❌ BAD: Logic Duplication
- Campaign creation: 5+ locations
- Ad creation: 4+ locations
- Project linking: 3+ locations

---

## Phase 1: Immediate Critical Fixes (MUST DO NOW)

### Fix 1: Remove Direct API Calls from AdBuilder
**File:** `components/ad-builder/ad-builder.tsx` (line 157)

**Current (WRONG):**
```typescript
const response = await fetch('/api/v1/ads', {
  method: 'POST',
  body: JSON.stringify({ campaignId, lovableProjectId, ... })
})
```

**Should Be:**
```typescript
import { useAdService } from '@/lib/services/service-provider'

const adService = useAdService()
const result = await adService.createAd.execute({
  campaignId,
  lovableProjectId,
  name,
  status: 'draft'
})
```

**Impact:** Enforces service layer, enables testing, better error handling

### Fix 2: Update AdService to Support lovableProjectId
**File:** `lib/services/contracts/ad-service.interface.ts`

**Add to CreateAdInput:**
```typescript
export interface CreateAdInput {
  campaignId?: string  // Optional now
  lovableProjectId?: string  // NEW: For Lovable extension
  name: string
  status?: 'draft' | 'active' | 'paused'
}
```

### Fix 3: Delete Unused `/lovable/create-ad` Route
**File:** `app/lovable/create-ad/page.tsx`

**Finding:** Extension uses `/lovable?view=build`, NOT this route  
**Action:** DELETE entire file (not being used)

### Fix 4: Remove Campaign Creation from CampaignContext
**File:** `lib/context/campaign-context.tsx` (line 117)

**Current:** Has `createCampaign()` method with business logic  
**Should Be:** Read-only context, delegates to service

```typescript
// REMOVE business logic from context
// KEEP only state management

const createCampaign = async (name, prompt, goal) => {
  // Delegate to service (no logic here)
  return await campaignService.createCampaign.execute({ name, prompt, goalType: goal })
}
```

---

## Phase 2: Service Layer Consolidation

### Consolidate Ad Creation

**Current Paths:**
1. `components/ad-builder/ad-builder.tsx` → Direct API
2. `lib/services/ad-creation-service.ts` → Direct Supabase (bypassed)
3. `lib/services/client/ad-service-client.ts` → API (correct but not used)
4. `app/api/v1/ads/route.ts` → Actual implementation

**Target Path (SINGLE):**
```
AdBuilder → useAdCreation hook → AdService.createAd() → POST /api/v1/ads → Handler
```

**Changes:**
- Update AdBuilder to use service
- Remove ad-creation-service.ts (or integrate into API route)
- Ensure AdService is exported and used

### Consolidate Campaign Creation

**Current Paths:**
1. `lib/context/campaign-context.tsx` → Calls service
2. `lib/hooks/use-campaign-operations.ts` → Direct API
3. `lib/services/client/campaign-service-client.ts` → API (correct)
4. `app/api/v1/campaigns/route.ts` → Actual implementation

**Target Path (SINGLE):**
```
UI → useCampaignCreation hook → CampaignService.create() → POST /api/v1/campaigns → Handler
```

**Changes:**
- Remove direct API calls from hooks
- Use CampaignService consistently
- Context delegates to service only

---

## Phase 3: Lovable Integration Cleanup

### Current State:
- `LovableCampaignManager` service EXISTS but partially used
- Project linking scattered across UI
- No consistent pattern

### Target State:

**Single Integration Service:**
```typescript
// lib/services/lovable/lovable-integration.service.ts

export class LovableIntegrationService {
  // Handles ALL Lovable-specific operations
  
  linkProject(projectId, userId): Promise<ProjectLink>
  getOrCreateCampaign(projectId, userId): Promise<Campaign>
  createAdForProject(projectId, userId, adData): Promise<Ad>
  // ... all Lovable operations
}
```

**Usage:**
```typescript
// AdBuilder just calls service
const lovableService = useLovableIntegration()
const result = await lovableService.createAdForProject(projectId, userId, adData)
```

---

## Phase 4: File-by-File Refactoring Spec

### Files to DELETE (5)
1. `/app/lovable/create-ad/page.tsx` - Unused route
2. `components/ad-builder-simple.tsx` - Duplicate (if confirmed unused)
3. Any server services not called by APIs (need verification)

### Files to REFACTOR (Critical - 8)

#### 1. `components/ad-builder/ad-builder.tsx`
**Changes:**
- Remove: Direct fetch() calls (lines ~157-175)
- Add: Import useAdService from service-provider
- Add: Use adService.createAd.execute()
- Impact: ~30 lines changed

#### 2. `components/lovable/lovable-layout.tsx`
**Changes:**
- Already simplified (done)
- Verify no remaining business logic

#### 3. `lib/hooks/use-campaign-operations.ts`
**Changes:**
- Remove: All direct fetch() calls
- Add: Use CampaignService from service-provider
- Keep: Hook interface (for UI)
- Impact: ~50 lines changed

#### 4. `lib/context/campaign-context.tsx`
**Changes:**
- Remove: Business logic from createCampaign
- Keep: State management only
- Delegate: To CampaignService
- Impact: ~20 lines changed

#### 5. `lib/services/lovable/campaign-manager.ts`
**Changes:**
- Make it the PRIMARY service for Lovable operations
- Export via service-provider
- Use in AdBuilder

#### 6. `lib/services/contracts/ad-service.interface.ts`
**Changes:**
- Add lovableProjectId to CreateAdInput
- Update types to match new flow

#### 7. `lib/services/service-provider.tsx`
**Changes:**
- Export useLovableIntegration hook
- Export all Lovable services
- Make them easily accessible

#### 8. `app/api/v1/ads/route.ts`
**Changes:**
- Already updated with project linking
- Verify complete

### Files to UPDATE (Documentation - 3)
1. Update all MD files with final architecture
2. Remove outdated documentation
3. Create single source-of-truth architecture doc

---

## Phase 5: Naming Convention Enforcement

### Service Naming Standard

**Pattern:** `{Domain}{Action}Service`

**Current → Target:**
- `ad-service-client.ts` → `ad.service.client.ts` ✅ (minor)
- `campaign-manager.ts` → `lovable-campaign.service.ts` ✅
- `meta-connection-manager.ts` → `meta-connection.service.ts` ✅

### Hook Naming Standard

**Pattern:** `use{Domain}{Action}`

**Current → Target:**
- `use-campaign-operations.ts` → `useCampaignOperations.ts` (camelCase)
- OR rename to `useCampaignService.ts` (clearer)

### Component Naming Standard

**Pattern:** `{Domain}{Type}.tsx`

**Current → Target:**
- `ad-builder.tsx` → `AdBuilder.tsx` ✅ (already correct)
- `lovable-layout.tsx` → `LovableLayout.tsx` ✅

---

## Phase 6: Implementation Priority

### PRIORITY 1: Critical Path (Do First) ⚡
**Goal:** Make ad creation work end-to-end

1. ✅ **Fix AdBuilder to use AdService** (not direct API)
2. ✅ **Ensure lovableProjectId flows through service layer**
3. ✅ **Test complete flow: UI → Service → API → DB**

**Files:** 2 files, ~50 lines changed

### PRIORITY 2: Remove Duplication (Next) 🧹
**Goal:** Single path per journey

4. ✅ **Consolidate campaign creation** (use service only)
5. ✅ **Remove direct API calls from hooks**
6. ✅ **Delete unused routes**

**Files:** 5 files, ~150 lines removed

### PRIORITY 3: Architecture Enforcement (Polish) ✨
**Goal:** Long-term maintainability

7. ✅ **Add lint rules** (no direct API calls from components)
8. ✅ **Update service exports** (make services accessible)
9. ✅ **Documentation** (architecture guide)

**Files:** 3 files, documentation

---

## Refactoring Execution Plan

### Step 1: Update AdBuilder to Use Services
```typescript
// components/ad-builder/ad-builder.tsx

// REMOVE:
const response = await fetch('/api/v1/ads', { ... })

// ADD:
import { useAdService } from '@/lib/services/service-provider'

const adService = useAdService()

// In handleSaveAsDraft:
const result = await adService.createAd.execute({
  campaignId: finalCampaignId,
  lovableProjectId,
  name: adName,
  status: 'draft'
})

if (!result.success) {
  throw new Error(result.error?.message)
}

const adId = result.data.id
```

### Step 2: Export Lovable Services
```typescript
// lib/services/service-provider.tsx

// ADD:
import { LovableCampaignManager } from './lovable/campaign-manager'

export function useLovableCampaignManager() {
  const supabase = createBrowserClient()
  return new LovableCampaignManager(supabase)
}
```

### Step 3: Update Service Contracts
```typescript
// lib/services/contracts/ad-service.interface.ts

export interface CreateAdInput {
  campaignId?: string  // Optional
  lovableProjectId?: string  // NEW
  name: string
  status?: 'draft' | 'active' | 'paused'
}
```

### Step 4: Delete Unused Routes
```bash
rm app/lovable/create-ad/page.tsx
# Verify no imports reference it
# Update any navigation links
```

### Step 5: Enforce Service Usage in Hooks
```typescript
// lib/hooks/use-campaign-operations.ts

// REMOVE all fetch() calls
// ADD service injection
import { useCampaignService } from '@/lib/services/service-provider'

export function useCampaignOperations() {
  const campaignService = useCampaignService()
  
  const createCampaign = async (name, goal) => {
    const result = await campaignService.createCampaign.execute({ name, goalType: goal })
    return result.data
  }
  
  // ... delegate everything to service
}
```

---

## Expected Outcomes

### Code Quality
- ✅ No direct API calls from UI
- ✅ Service layer enforced
- ✅ Single path per journey
- ✅ -300 lines of duplicate code removed

### Architecture
- ✅ Clean separation of concerns
- ✅ Testable services
- ✅ Maintainable codebase
- ✅ Scalable design

### Functionality
- ✅ Ad creation works
- ✅ Campaign auto-creation works
- ✅ Project linking works
- ✅ All tables populated correctly

---

## Current Status

**Investigation:** ✅ COMPLETE  
**Plan:** ✅ COMPLETE  
**Execution:** ⏳ READY TO START

**Key Insight:** Architecture is good, enforcement is lacking. Need to:
1. Update 8 files to use services
2. Delete 5 unused files
3. Test end-to-end

**Estimated Time:** 2-3 hours for clean implementation

---

**Ready for execution approval.**

