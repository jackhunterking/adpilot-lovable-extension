# Service Layer Quick Reference Guide
**Last Updated**: November 23, 2025  
**Compliance**: 100% ✅

---

## 🎯 Overview

All components in this project MUST use the service layer. Direct API calls are prohibited.

**Status**: ✅ **100% Compliant** (as of v0.3.0)

---

## 📚 Available Services

### 1. Ad Service (`useAdService`)

**Operations**:
```typescript
import { useAdService } from '@/lib/services/service-provider'

const adService = useAdService()

// Create ad
await adService.createAd.execute({ name, status, campaignId, lovableProjectId })

// Get ad
await adService.getAd.execute(adId)

// Update ad
await adService.updateAd.execute({ id, name, status })

// Delete ad
await adService.deleteAd.execute(adId)

// List ads
await adService.listAds.execute({ campaignId, status })

// Save snapshot
await adService.saveSnapshot.execute({ adId, snapshot })

// Get snapshot
await adService.getSnapshot.execute(adId)

// Publish ad
await adService.publishAd.execute({ adId, campaignId })

// Pause ad
await adService.pauseAd.execute(adId)

// Resume ad
await adService.resumeAd.execute(adId)

// Duplicate ad (NEW in v0.3.0)
await adService.duplicateAd.execute(adId)
```

---

### 2. Campaign Service (`useCampaignService`)

**Operations**:
```typescript
import { useCampaignService } from '@/lib/services/service-provider'

const campaignService = useCampaignService()

// Create campaign
await campaignService.createCampaign.execute({ name, prompt, goalType })

// Get campaign
await campaignService.getCampaign.execute(campaignId)

// Update campaign
await campaignService.updateCampaign.execute({ id, name, status, metadata })

// Delete campaign
await campaignService.deleteCampaign.execute(campaignId)

// List campaigns
await campaignService.listCampaigns.execute({ userId, limit })

// Configure goal
await campaignService.configureGoal.execute({ campaignId, ...goalData })

// Update step
await campaignService.updateCurrentStep.execute({ campaignId, step })
```

---

### 3. Targeting Service (`useTargetingService`)

**Operations**:
```typescript
import { useTargetingService } from '@/lib/services/service-provider'

const targetingService = useTargetingService()

// Add locations
await targetingService.addLocations.execute({
  adId,
  locations: [...],
  mode: 'include' // or 'exclude'
})

// Remove location
await targetingService.removeLocation.execute({
  adId,
  locationId
})

// Clear all locations
await targetingService.clearLocations.execute(adId)

// Get locations
await targetingService.getLocations.execute(adId)
```

---

### 4. Creative Service (`useCreativeService`)

**Operations**:
```typescript
import { useCreativeService } from '@/lib/services/service-provider'

const creativeService = useCreativeService()

// Save creative
await creativeService.saveCreative.execute({
  adId,
  imageUrl,
  format,
  ...
})

// Get creative
await creativeService.getCreative.execute(adId)
```

---

### 5. Copy Service (`useCopyService`)

**Operations**:
```typescript
import { useCopyService } from '@/lib/services/service-provider'

const copyService = useCopyService()

// Save copy
await copyService.saveCopy.execute({
  adId,
  variations,
  selectedIndex
})
```

---

### 6. Destination Service (`useDestinationService`)

**Operations**:
```typescript
import { useDestinationService } from '@/lib/services/service-provider'

const destinationService = useDestinationService()

// Save destination
await destinationService.saveDestination.execute({
  adId,
  type: 'website' | 'form' | 'call',
  data: {...}
})
```

---

### 7. Budget Service (`useBudgetService`)

**Operations**:
```typescript
import { useBudgetService } from '@/lib/services/service-provider'

const budgetService = useBudgetService()

// Save budget
await budgetService.saveBudget.execute({
  adId,
  dailyBudget,
  currency,
  ...
})
```

---

### 8. Analytics Service (`useAnalyticsService`)

**Operations**:
```typescript
import { useAnalyticsService } from '@/lib/services/service-provider'

const analyticsService = useAnalyticsService()

// Get metrics
await analyticsService.getMetrics.execute({
  campaignId,
  dateRange
})
```

---

### 9. Meta Service (`useMetaService`)

**Operations**:
```typescript
import { useMetaService } from '@/lib/services/service-provider'

const metaService = useMetaService()

// Get status
await metaService.getStatus.execute({ campaignId })

// Search interests
await metaService.searchInterests.execute({ query })

// Search locations
await metaService.searchLocations.execute({ query })
```

---

## 🎯 Pattern Examples

### Create Operation

```typescript
const handleCreate = async () => {
  try {
    setLoading(true)
    
    const result = await adService.createAd.execute({
      name: 'New Ad',
      status: 'draft',
      campaignId: campaign.id
    })
    
    if (!result.success) {
      toast.error(result.error.message)
      return
    }
    
    toast.success('Ad created successfully!')
    router.push(`/lovable?adId=${result.data.id}`)
    
  } catch (error) {
    console.error('Failed to create ad:', error)
    toast.error('Unexpected error occurred')
  } finally {
    setLoading(false)
  }
}
```

---

### Update Operation

```typescript
const handleUpdate = async (updates: Partial<Ad>) => {
  if (!currentAd?.id) return
  
  const result = await adService.updateAd.execute({
    id: currentAd.id,
    ...updates
  })
  
  if (result.success) {
    setCurrentAd(result.data)
    toast.success('Updated successfully')
  } else {
    toast.error(result.error.message)
  }
}
```

---

### Delete Operation

```typescript
const handleDelete = async (adId: string) => {
  if (!confirm('Delete this ad?')) return
  
  const result = await adService.deleteAd.execute(adId)
  
  if (result.success) {
    toast.success('Ad deleted')
    refreshList()
  } else {
    toast.error(result.error.message)
  }
}
```

---

### List Operation

```typescript
const loadAds = async () => {
  setLoading(true)
  
  const result = await adService.listAds.execute({
    campaignId: campaign.id,
    status: 'draft' // optional filter
  })
  
  if (result.success) {
    setAds(result.data)
  } else {
    toast.error('Failed to load ads')
  }
  
  setLoading(false)
}
```

---

## ❌ Anti-Patterns (DON'T DO THIS)

### 1. Direct API Calls

```typescript
// ❌ WRONG - Bypasses service layer
const response = await fetch('/api/v1/ads', {
  method: 'POST',
  body: JSON.stringify(data)
})

// ✅ CORRECT - Uses service
const result = await adService.createAd.execute(data)
```

---

### 2. Business Logic in Components

```typescript
// ❌ WRONG - Business logic in component
const createAd = async () => {
  const ad = await fetch(...)
  const campaign = await fetch(...)
  const link = await fetch(...)
  // Complex logic here
}

// ✅ CORRECT - Service handles complexity
const result = await adService.createAd.execute({
  lovableProjectId  // Service handles campaign auto-creation
})
```

---

### 3. Ignoring Error Handling

```typescript
// ❌ WRONG - No error handling
const result = await service.execute(data)
const value = result.data.something  // Could crash if error

// ✅ CORRECT - Handle errors
const result = await service.execute(data)
if (!result.success) {
  toast.error(result.error.message)
  return
}
const value = result.data.something  // Safe now
```

---

### 4. Missing User Feedback

```typescript
// ❌ WRONG - Silent failures
if (!result.success) {
  console.error('Failed:', result.error)
  // User has no idea what happened
}

// ✅ CORRECT - User feedback
if (!result.success) {
  console.error('Failed:', result.error)
  toast.error(result.error.message)  // User knows what happened
}
```

---

## 🔍 How to Find the Right Service

### By Domain

- **Ads** → `useAdService()`
- **Campaigns** → `useCampaignService()`
- **Images/Creative** → `useCreativeService()`
- **Ad Copy** → `useCopyService()`
- **Locations/Audience** → `useTargetingService()`
- **Destination** → `useDestinationService()`
- **Budget** → `useBudgetService()`
- **Metrics** → `useAnalyticsService()`
- **Meta API** → `useMetaService()`

### By Operation

- **Create something** → Check domain service first
- **Update something** → Use update method on domain service
- **Delete something** → Use delete method on domain service
- **Get/List something** → Use get/list method on domain service

---

## 🧪 Testing Services

### Unit Test Example

```typescript
import { adServiceClient } from '@/lib/services/client'

describe('AdService', () => {
  it('creates ad successfully', async () => {
    const result = await adServiceClient.createAd.execute({
      name: 'Test Ad',
      status: 'draft',
      campaignId: 'test-campaign-id'
    })
    
    expect(result.success).toBe(true)
    expect(result.data.name).toBe('Test Ad')
  })
  
  it('handles errors gracefully', async () => {
    const result = await adServiceClient.createAd.execute({
      name: '', // Invalid
      status: 'draft'
    })
    
    expect(result.success).toBe(false)
    expect(result.error.code).toBe('validation_error')
  })
})
```

### Integration Test Example

```typescript
import { ServiceProvider } from '@/lib/services/service-provider'
import { render, screen, waitFor } from '@testing-library/react'

test('Component uses service', async () => {
  const mockService = {
    createAd: {
      execute: vi.fn().mockResolvedValue({
        success: true,
        data: { id: 'new-ad-id' }
      })
    }
  }
  
  render(
    <ServiceProvider services={{ adService: mockService }}>
      <MyComponent />
    </ServiceProvider>
  )
  
  // Trigger action
  const button = screen.getByText('Create Ad')
  button.click()
  
  // Verify service was called
  await waitFor(() => {
    expect(mockService.createAd.execute).toHaveBeenCalledWith({
      name: expect.any(String),
      status: 'draft'
    })
  })
})
```

---

## 📋 Code Review Checklist

When reviewing new code, check:

- [ ] ✅ Uses service from `@/lib/services/service-provider`
- [ ] ❌ No direct `fetch()` calls to `/api/v1/*` routes
- [ ] ✅ Handles `result.success` check
- [ ] ✅ Displays error toast on failure
- [ ] ✅ Shows success toast on success
- [ ] ✅ Loading states managed
- [ ] ✅ TypeScript types used (no `any`)
- [ ] ✅ Try-catch for exceptions
- [ ] ✅ Consistent with existing patterns

---

## 🎓 Training for New Developers

### Day 1: Understanding Services

1. Read this guide
2. Review `/lib/services/contracts/` - See all interfaces
3. Review `/lib/services/client/` - See implementations
4. Review `service-provider.tsx` - See how services are provided

### Day 2: Using Services

1. Pick a simple component
2. Trace how it uses services
3. Try modifying an operation
4. Run tests to verify

### Day 3: Adding New Features

1. Define contract interface
2. Implement client service
3. Create API route
4. Add to contracts registry
5. Use in component
6. Add tests

---

## ✅ Success Stories

### Recent Refactoring (v0.3.0)

**Before**: 5 components bypassing service layer  
**After**: 0 violations, 100% compliance ✅

**Files Fixed**:
1. `ad-builder.tsx` - 1 fetch → adService
2. `current-ad-context.tsx` - 1 fetch → adService
3. `use-campaign-operations.ts` - 5 fetches → services
4. `preview-panel.tsx` - 6 fetches → services
5. `campaign-context.tsx` - 3 fetches → removed (cleanup)

**Result**: Cleaner, more maintainable, fully type-safe

---

## 🚀 Next Steps

### For Feature Development

1. Check if service exists for your domain
2. If yes: Use it (follow patterns above)
3. If no: Create new service (follow existing structure)
4. Always return `ServiceResult<T>`
5. Always handle errors with user feedback

### For Bug Fixes

1. Find the service handling the operation
2. Fix in service (benefits all callers)
3. Add test to prevent regression
4. Verify all usages work

---

## 📞 Questions?

**Where to look**:
- Service contracts: `lib/services/contracts/`
- Service implementations: `lib/services/client/`
- Service provider: `lib/services/service-provider.tsx`
- Example usage: Any component in `components/`

**Pattern not clear?**:
- Check `.cursorrules` for detailed patterns
- Review `COMPREHENSIVE_ARCHITECTURAL_REVIEW.md`
- See examples in this guide

---

**Remember**: 100% service layer compliance is mandatory. No exceptions.

---

*Quick Reference Guide - AdPilot Service Layer*

