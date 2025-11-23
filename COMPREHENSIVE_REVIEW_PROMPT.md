# Comprehensive Review Prompt for AI

Use this prompt to conduct a complete architectural review of the AdPilot Lovable Extension project. Copy and paste this into your AI assistant for systematic analysis.

---

## MASTER REVIEW PROMPT

```
I need you to conduct a COMPREHENSIVE, SYSTEMATIC review of this entire codebase to identify all issues and ensure architectural consistency. Follow this exact methodology:

## Phase 1: Frontend-Backend Integration Audit

### For EVERY API route in app/api/v1/:

1. Read the route handler implementation
2. Document:
   - Required parameters (query params, body fields)
   - Expected request format
   - Response format
   - Error cases handled

3. Find ALL places in frontend that call this API:
   - Search: grep for the API path
   - Read each calling location
   - Verify request matches API expectations
   - Check error handling exists

4. Verify:
   - ✅ All required params are passed
   - ✅ Request format matches API
   - ✅ Response is handled correctly
   - ✅ Errors are caught and displayed
   - ✅ Loading states managed
   - ✅ credentials: 'include' for authenticated routes

5. Find issues like:
   - Missing required parameters
   - Wrong API paths
   - Missing error handling
   - Type mismatches
   - Validation gaps

## Phase 2: Data Flow Verification

### For EACH user journey:

1. **Ad Creation Journey**
   - Trace from: User clicks "Create Ad" button
   - Follow through: ALL component renders
   - Track: ALL state changes
   - Document: ALL API calls
   - Verify: Database operations complete
   - Check: Error paths handled

2. **Campaign Creation Journey**
   - Entry points: WHERE can campaigns be created?
   - For each entry: Trace complete flow
   - Verify: No duplicate creation attempts
   - Check: lovableProjectId handled correctly

3. **Save Draft Journey**
   - When: User clicks "Save as Draft"
   - What data: Gets sent to API
   - Validation: API expectations vs what's sent
   - Error cases: Empty data, partial data, invalid data

4. **Navigation Journey**
   - After save: Where does user go?
   - Routes: Do they exist?
   - State: Is it preserved?

## Phase 3: Service Layer Enforcement

### Check EVERY component that does business logic:

```bash
# Find all components with fetch() calls
grep -r "fetch(" components/ | while read line; do
  # For each match:
  # 1. Is it calling an API route?
  # 2. Should it use a service instead?
  # 3. Does the service exist?
  # 4. If yes: VIOLATION (document it)
  # 5. If no: OK (API call from component acceptable if no service)
done
```

Document violations:
- Component: File name and line number
- API called: Which endpoint
- Should use: Which service should handle this
- Fix: How to refactor

## Phase 4: State Management Audit

### sessionStorage Usage:

1. Find ALL sessionStorage.setItem calls
2. Find ALL sessionStorage.getItem calls
3. Create matrix:
   - Key name
   - Where it's set
   - Where it's read
   - Data format
   - Expiration logic

4. Find issues:
   - Inconsistent key names
   - Data format mismatches
   - Missing null checks
   - Race conditions

### Context Providers:

1. List ALL context providers
2. For each context:
   - What state it manages
   - Where it's provided (which routes)
   - Who consumes it
   - Business logic inside (VIOLATION if yes)

## Phase 5: Type Safety Verification

### API Request/Response Types:

1. For each API route:
   - Does it have typed request interface?
   - Does it have typed response interface?
   - Are types shared with frontend?
   - Are types enforced at runtime?

2. Find type violations:
   - `any` usage
   - Type assertions without validation
   - Missing null checks
   - Unsafe JSON parsing

## Phase 6: Error Handling Audit

### For EVERY async operation:

```typescript
// Check pattern:
try {
  const response = await fetch(...)
  
  // MUST HAVE: Response status check
  if (!response.ok) {
    // MUST HAVE: Error handling
  }
  
  const data = await response.json()
  // MUST HAVE: Data validation
  
} catch (error) {
  // MUST HAVE: Catch block
  // MUST HAVE: User notification (toast/alert)
  // MUST HAVE: Console logging
}
```

Document violations:
- Location
- What's missing
- Impact (data loss, silent failure, etc.)

## Phase 7: Database Integration Verification

### For EVERY database table used:

1. Check if table exists in migrations
2. Verify RLS policies allow operations
3. Find all places that:
   - INSERT to table
   - SELECT from table
   - UPDATE table
   - DELETE from table

4. Verify each operation:
   - Has proper auth check
   - Follows RLS policies
   - Handles errors
   - Uses correct types

## Phase 8: Duplication Detection

### Systematic Search:

```bash
# Find duplicate business logic
1. Campaign creation: grep -r "insert.*campaigns" 
2. Ad creation: grep -r "insert.*ads"
3. Project linking: grep -r "lovable_project_links"
4. Save operations: grep -r "save.*ad"
5. Publish operations: grep -r "publish.*ad"
```

For each match:
- Document location
- Extract the logic
- Compare with other instances
- Find canonical implementation
- Mark others for removal

## Phase 9: Route Coverage Analysis

### For ALL routes defined:

1. Find routes in app/ directory
2. For each route:
   - Is it referenced anywhere?
   - Is it reachable from UI?
   - Does it work?
   - Is it duplicate of another route?

3. Find:
   - Unused routes (delete them)
   - Duplicate routes (consolidate)
   - Broken routes (fix or remove)

## Phase 10: Naming Convention Check

### Verify consistency:

**Services:**
- Pattern: {Domain}{Action}Service
- Check: All service files follow this
- Fix: Rename non-compliant files

**Hooks:**
- Pattern: use{Domain}{Action}
- Check: All hook files follow this
- Fix: Rename non-compliant files

**Components:**
- Pattern: {Domain}{Type}
- Check: PascalCase, descriptive
- Fix: Rename generic names

**API Routes:**
- Pattern: /api/v1/{domain}/{resource}
- Check: RESTful conventions
- Fix: Non-RESTful routes

## OUTPUT FORMAT

For each phase, provide:

### 1. Summary Table
| Issue | Location | Severity | Fix |
|-------|----------|----------|-----|
| ... | ... | ... | ... |

### 2. Detailed Findings
- Issue description
- Code snippet showing problem
- Impact analysis
- Proposed solution

### 3. Priority Classification
- P0 (Critical - breaks functionality)
- P1 (High - degraded UX)
- P2 (Medium - tech debt)
- P3 (Low - nice to have)

### 4. Fix Specification
- Exact files to change
- Exact changes to make
- Test cases to verify
- Rollback plan

## SUCCESS CRITERIA

✅ All API routes documented with contracts
✅ All frontend-backend integrations verified
✅ All service layer violations found
✅ All duplicate logic identified
✅ All type safety issues found
✅ All error handling gaps found
✅ All database operations verified
✅ All unused code identified
✅ All naming violations found
✅ Complete refactoring specification generated

## DELIVERABLE

A comprehensive report with:
1. Executive summary (what's broken, what works)
2. Detailed findings by phase
3. Prioritized fix list
4. Implementation plan with time estimates
5. Risk analysis for each change

Begin the review and work through ALL phases systematically. Do not skip any phase.
```

---

## How to Use This Prompt

1. **Copy the entire prompt above** (between the ``` markers)
2. **Paste into a new AI conversation** (or continue this one)
3. **Let the AI work through all 10 phases** systematically
4. **Review the comprehensive report** it generates
5. **Implement fixes** in priority order (P0 first)

## Expected Time

- **AI Review:** 2-3 hours (automated)
- **Your Review:** 30-60 min (read findings)
- **Implementation:** 4-8 hours (based on findings)

## What This Catches

✅ API contract mismatches (like the save payload issue)  
✅ Missing error handling  
✅ Type safety violations  
✅ Duplicate logic  
✅ Unused code  
✅ Service layer bypass  
✅ Navigation errors  
✅ State management issues  
✅ Database integration problems  
✅ Naming inconsistencies  

## Recommended Frequency

- **Before major releases:** Full review
- **After adding features:** Targeted review (affected areas)
- **Monthly:** Quick check of critical paths
- **After architecture changes:** Full review

---

**This prompt will catch issues like the ones we just fixed, preventing them from happening again.**

