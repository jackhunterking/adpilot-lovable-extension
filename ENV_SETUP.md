# Environment Setup

Before running the Next.js app, you need to create a `.env.local` file in the root directory.

## Required Environment Variables

Create `.env.local` with the following variables (copy from your main AdPilot repo if you have them):

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI Services
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# Meta/Facebook Configuration
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
NEXT_PUBLIC_META_APP_ID=your_meta_app_id

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_LOVABLE_EXTENSION_MODE=true
```

## Copy from Main Repo

If you have a working `.env.local` in `/Users/metinhakanokuyucu/adpilot/`:

```bash
cp /Users/metinhakanokuyucu/adpilot/.env.local ./.env.local
# Then add this line to the copied file:
echo "NEXT_PUBLIC_LOVABLE_EXTENSION_MODE=true" >> .env.local
```

## Verify Setup

After creating `.env.local`, verify it's not committed to git:

```bash
git status  # .env.local should not appear (it's gitignored)
```
