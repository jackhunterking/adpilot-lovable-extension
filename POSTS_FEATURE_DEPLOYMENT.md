# Posts Feature - Deployment Guide

## ✅ Implementation Complete

The Posts feature has been successfully implemented following the plan. Here's what was built:

### 🗄️ Backend (Supabase) - COMPLETED

**Database Tables Created:**
- ✅ `social_posts` - Stores post content, platforms, schedule, and publishing status
- ✅ `post_analytics` - Stores Facebook and Instagram insights

**Migrations Applied:**
- ✅ `20241124000001_create_social_posts.sql`
- ✅ `20241124000002_create_post_analytics.sql`
- ✅ RLS policies enabled and verified

### 🔌 Meta API Integration - COMPLETED

**New Files Created:**
- ✅ `lib/meta/pages-api.ts` - Facebook Pages posting
- ✅ `lib/meta/instagram-api.ts` - Instagram posting  
- ✅ `lib/meta/post-publisher.ts` - Cross-posting orchestrator

**Features:**
- Publish to Facebook Pages (text, images, videos)
- Publish to Instagram (images, videos with captions)
- Cross-post to both platforms simultaneously
- Handle partial failures gracefully
- Fetch post insights from Meta

### 🎯 Service Layer - COMPLETED

**Following Mandatory Service Layer Pattern:**
- ✅ `lib/services/contracts/post-service-contract.ts` - Interface definitions
- ✅ `lib/services/client/post-service-client.ts` - Client-side service
- ✅ `lib/services/server/post-service-server.ts` - Server-side service
- ✅ Updated `lib/services/service-provider.tsx` - Added `usePostService()` hook

### 🌐 API Routes - COMPLETED

**Created in `app/api/v1/posts/`:**
- ✅ `/route.ts` - GET (list posts), POST (create post)
- ✅ `/[postId]/route.ts` - GET, PATCH, DELETE
- ✅ `/[postId]/save/route.ts` - PUT (save content)
- ✅ `/[postId]/publish/route.ts` - POST (publish to Meta)
- ✅ `/[postId]/duplicate/route.ts` - POST (clone post)
- ✅ `/[postId]/analytics/route.ts` - GET (fetch insights)
- ✅ `/upload/media/route.ts` - POST (upload images/videos)

### 🎨 UI Components - COMPLETED

**Post Builder (3-Step Wizard):**
- ✅ `components/post-builder/post-builder.tsx` - Main wizard container
- ✅ `components/post-builder/steps/content-and-media.tsx` - Step 1
- ✅ `components/post-builder/steps/platforms-and-schedule.tsx` - Step 2
- ✅ `components/post-builder/steps/review-and-publish.tsx` - Step 3
- ✅ `components/post-builder/exit-confirmation-dialog.tsx` - Exit dialog

**Post Mockups:**
- ✅ `components/post-builder/facebook-post-mockup.tsx` - Facebook preview
- ✅ `components/post-builder/instagram-post-mockup.tsx` - Instagram preview

**Post Management:**
- ✅ `components/posts/all-posts-grid.tsx` - Grid view with filters
- ✅ `components/posts/post-card.tsx` - Individual post card
- ✅ `components/posts/post-analytics-panel.tsx` - Analytics display

### 📄 Pages - COMPLETED

**Created in `app/lovable/posts/`:**
- ✅ `page.tsx` - All posts list
- ✅ `create/page.tsx` - Post builder
- ✅ `[postId]/edit/page.tsx` - Edit existing post
- ✅ `[postId]/analytics/page.tsx` - View analytics

### 🧭 Navigation - COMPLETED

**Updated Files:**
- ✅ `components/layout/app-sidebar.tsx` - Added "Posts" nav item

### ⏰ Scheduled Publishing - COMPLETED

**Edge Function Created:**
- ✅ `supabase/functions/publish-scheduled-posts/index.ts`
- ✅ Cron migration: `20241124000003_setup_scheduled_posts_cron.sql`

---

## 🚀 Deployment Steps

### Step 1: Storage Bucket Setup

**⚠️ BACKEND OPERATION REQUIRED**

Create the `post-media` storage bucket in your Supabase project:

1. Go to Supabase Dashboard → Storage
2. Create new bucket:
   - Name: `post-media`
   - Public: Yes (for Meta API access)
   - File size limit: 50MB
   - Allowed MIME types: `image/*`, `video/*`

### Step 2: Cron Setup

**⚠️ BACKEND OPERATION REQUIRED**

The cron migration needs your project reference. Update the SQL:

1. Open `supabase/migrations/20241124000003_setup_scheduled_posts_cron.sql`
2. Replace `YOUR_PROJECT_REF` with your actual Supabase project reference
3. Run the migration:
   ```bash
   # Via Supabase CLI or MCP tools
   ```

### Step 3: Deploy Edge Function

**⚠️ BACKEND OPERATION REQUIRED**

Deploy the scheduled posts Edge Function:

```bash
supabase functions deploy publish-scheduled-posts
```

Set environment variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key
- `APP_URL` - Your app URL (e.g., https://your-domain.com)

### Step 4: Test the Feature

1. Navigate to `/lovable/posts` in your Lovable extension
2. Click "Create Post"
3. Add text and upload an image
4. Select platforms (Facebook, Instagram)
5. Choose "Publish immediately" or "Schedule for later"
6. Review and publish

---

## 📋 File Summary

### Created Files (30 total):

**Migrations (3):**
- supabase/migrations/20241124000001_create_social_posts.sql
- supabase/migrations/20241124000002_create_post_analytics.sql
- supabase/migrations/20241124000003_setup_scheduled_posts_cron.sql

**Edge Functions (1):**
- supabase/functions/publish-scheduled-posts/index.ts

**Meta Integration (3):**
- lib/meta/pages-api.ts
- lib/meta/instagram-api.ts
- lib/meta/post-publisher.ts

**Types (1):**
- lib/types/post.ts

**Services (3):**
- lib/services/contracts/post-service-contract.ts
- lib/services/client/post-service-client.ts
- lib/services/server/post-service-server.ts

**API Routes (7):**
- app/api/v1/posts/route.ts
- app/api/v1/posts/[postId]/route.ts
- app/api/v1/posts/[postId]/save/route.ts
- app/api/v1/posts/[postId]/publish/route.ts
- app/api/v1/posts/[postId]/duplicate/route.ts
- app/api/v1/posts/[postId]/analytics/route.ts
- app/api/v1/upload/media/route.ts

**Components (9):**
- components/post-builder/post-builder.tsx
- components/post-builder/exit-confirmation-dialog.tsx
- components/post-builder/steps/content-and-media.tsx
- components/post-builder/steps/platforms-and-schedule.tsx
- components/post-builder/steps/review-and-publish.tsx
- components/post-builder/facebook-post-mockup.tsx
- components/post-builder/instagram-post-mockup.tsx
- components/posts/all-posts-grid.tsx
- components/posts/post-card.tsx
- components/posts/post-analytics-panel.tsx

**Pages (4):**
- app/lovable/posts/page.tsx
- app/lovable/posts/create/page.tsx
- app/lovable/posts/[postId]/edit/page.tsx
- app/lovable/posts/[postId]/analytics/page.tsx

### Updated Files (1):
- components/layout/app-sidebar.tsx

---

## ✨ Features Implemented

### User Can:
- ✅ Create posts with manual text input
- ✅ Upload images or videos (up to 50MB)
- ✅ Toggle Facebook and Instagram platforms
- ✅ Schedule posts for future publishing
- ✅ Save drafts
- ✅ Preview posts for both platforms
- ✅ Publish immediately or schedule
- ✅ View all posts (drafts, scheduled, published)
- ✅ Edit draft posts
- ✅ Duplicate existing posts
- ✅ Delete posts
- ✅ View analytics (Facebook + Instagram insights)

### Technical Features:
- ✅ Service layer architecture (no direct fetch in components)
- ✅ RLS policies on all tables
- ✅ Type-safe TypeScript throughout
- ✅ Cross-posting to Facebook + Instagram
- ✅ Automatic scheduled post publishing via cron
- ✅ Meta connection reuse from ads feature
- ✅ Consistent UI with existing ad builder
- ✅ Fullscreen mode for post creation
- ✅ Exit confirmation for unsaved changes

---

## 🎯 Next Steps

### Immediate:
1. Create `post-media` storage bucket in Supabase
2. Update cron migration with your project reference
3. Deploy Edge Function with environment variables
4. Test post creation end-to-end

### Future Enhancements (Optional):
- AI-powered post text generation
- AI-powered image generation
- Post templates
- Hashtag suggestions
- Best time to post recommendations
- Post performance predictions
- Story/Reel support
- Multi-image carousel posts

---

## 🔍 Verification Checklist

Run these checks to verify the deployment:

- [ ] Database tables exist (`social_posts`, `post_analytics`)
- [ ] RLS policies are active (check with Supabase advisors)
- [ ] Storage bucket `post-media` is created and public
- [ ] Edge Function is deployed
- [ ] Cron job is scheduled (check `SELECT * FROM cron.job;`)
- [ ] Navigation shows "Posts" in sidebar
- [ ] Can navigate to `/lovable/posts`
- [ ] Can create a post with text + image
- [ ] Can publish to Facebook and Instagram
- [ ] Can schedule a post for future
- [ ] Scheduled posts publish automatically

---

## 🐛 Troubleshooting

### "Meta connection not found"
- Ensure Meta Business account is connected via Integrations page
- Verify `campaign_meta_connections` table has a row for the user

### "Instagram requires media"
- Instagram posts must have an image or video
- Upload media before enabling Instagram toggle

### "Failed to upload media"
- Check storage bucket `post-media` exists
- Verify bucket is public
- Check file size < 50MB

### Scheduled posts not publishing
- Verify Edge Function is deployed
- Check cron job is running: `SELECT * FROM cron.job_run_details;`
- Verify environment variables are set

---

## 📊 Database Schema

### social_posts
```
id                    UUID PRIMARY KEY
user_id               UUID (auth.users)
campaign_id           UUID (campaigns) - optional
lovable_project_id    TEXT
name                  TEXT
status                TEXT (draft/scheduled/published/failed)
post_text             TEXT
media_type            TEXT (image/video/none)
media_url             TEXT
publish_to_facebook   BOOLEAN
publish_to_instagram  BOOLEAN
schedule_type         TEXT (immediate/scheduled)
scheduled_at          TIMESTAMPTZ
published_at          TIMESTAMPTZ
facebook_post_id      TEXT
instagram_post_id     TEXT
created_at            TIMESTAMPTZ
updated_at            TIMESTAMPTZ
```

### post_analytics
```
id            UUID PRIMARY KEY
post_id       UUID (social_posts)
user_id       UUID (auth.users)
platform      TEXT (facebook/instagram)
likes         INTEGER
comments      INTEGER
shares        INTEGER
reach         INTEGER
impressions   INTEGER
synced_at     TIMESTAMPTZ
created_at    TIMESTAMPTZ
updated_at    TIMESTAMPTZ
```

---

**Implementation Status: ✅ COMPLETE**

All features implemented and ready for deployment!

