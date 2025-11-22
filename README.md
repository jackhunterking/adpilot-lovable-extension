# AdPilot for Lovable - Chrome Extension

AI-powered Meta (Facebook/Instagram) advertising platform that integrates seamlessly into the Lovable editor.

## 🎯 Overview

This Chrome extension adds a "Grow" tab to the Lovable editor, providing direct access to AdPilot's advertising capabilities without leaving your development workflow.

**Key Features:**
- 🎨 Create Meta (Facebook/Instagram) ad campaigns
- 🤖 Generate ad creatives and copy with AI
- 🎯 Advanced audience targeting with AI suggestions
- 💰 Budget management and performance tracking
- 🔄 Multi-tenant architecture (works for any Lovable user)
- ✨ Seamless integration with Lovable AI

## 🚀 Quick Start

### For Users

**Installation:**
1. Visit the [extension landing page](https://adpilot.studio) (or visit this repo's root URL when running locally)
2. Click "Download Chrome Extension" and install from [Chrome Web Store](#) (coming soon)
3. Navigate to any Lovable project at `lovable.dev/projects/*`
4. Click the "Grow" tab that appears in the navigation
5. Sign in to AdPilot and start creating ads

**Note:** This is a Chrome extension for Lovable only. There is no standalone website - all functionality is accessed through the extension within Lovable projects.

### For Developers

```bash
# Clone the repository
git clone https://github.com/jackhunterking/adpilot-lovable-extension.git
cd adpilot-lovable-extension

# Install dependencies
npm install

# Start development server
npm run dev

# Load extension in Chrome
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select this directory
```

## ✨ Features

### Marketing Features

**1. Create Ad - AI-Powered Image Generation**
- Generate dual-format ad images (square + vertical) with AI
- Upload reference images for context
- Automatic image optimization for Meta ads
- Preview in mobile ad mockup

**2. Ad Copy - AI-Powered Copywriting**
- Generate multiple copy variations with AI
- Choose from 6 different tones (professional, casual, urgent, etc.)
- Edit headlines, body text, and CTAs
- Preview before applying to ads

**3. Targeting - Advanced Audience Selection**
- Location targeting with search and map visualization
- Include/exclude specific regions, cities, or countries
- Age and gender demographic targeting
- Real-time targeting summary

**4. Budget & Schedule - Cost Management**
- Daily or lifetime budget options
- Campaign start and end date scheduling
- Real-time cost estimates
- Performance projections based on budget

**5. Campaigns - Full Campaign Management**
- Create and manage multiple campaigns
- View campaign status and performance
- Edit or delete campaigns
- Automatic Lovable project linking

**6. Analytics - Performance Tracking**
- Real-time metrics dashboard (impressions, clicks, spend, conversions)
- Daily performance breakdown
- Automated insights and recommendations
- Export analytics to CSV

## 🔧 Configuration

### Environment Variables

Create `.env.local` in the project root:

```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Meta/Facebook (Required for OAuth)
NEXT_PUBLIC_FB_APP_ID=your_facebook_app_id
FB_APP_SECRET=your_facebook_app_secret
FB_PIXEL_ID=your_meta_pixel_id  # Optional

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Facebook App Setup

1. Go to [Facebook Developers](https://developers.facebook.com/apps)
2. Create a new app (Type: Business)
3. Add "Facebook Login" product
4. Configure OAuth redirect URI: `http://localhost:3000/meta/oauth`
5. Request permissions: `ads_management`, `ads_read`, `business_management`
6. Copy App ID and App Secret to `.env.local`

## 🧪 Testing

### Quick Test

1. Start the development server: `npm run dev`
2. Load extension in Chrome (see Developer setup above)
3. Navigate to any Lovable project
4. Look for the "Grow" tab in the navigation
5. Click to open the AdPilot panel

### Test Feature Pages

1. Navigate to Dashboard - see all 6 feature cards
2. Click "Create Ad" - generate images with AI
3. Click "Ad Copy" - generate copy variations
4. Click "Targeting" - add locations and demographics
5. Click "Budget & Schedule" - configure budget
6. Click "Campaigns" - manage campaigns
7. Click "Analytics" - view performance metrics

### Test AI Integration

- Click "Generate with AI" for images
- Click "Write Copy with AI" for ad text
- Click "AI Suggest Interests" for targeting
- Check that Lovable AI chat opens with prompts

## 📁 Project Structure

```
adpilot-lovable-extension/
├── manifest.json           # Extension configuration (Manifest V3)
├── background/             # Service worker for extension lifecycle
├── content/               # Content scripts injected into Lovable
│   ├── inject.js          # Main injection script
│   └── styles.css         # Extension styles
├── app/                   # Next.js application
│   ├── page.tsx          # Extension download landing page (root URL)
│   ├── lovable/          # All Lovable extension pages (iframe content)
│   │   ├── page.tsx      # Workspace dashboard
│   │   ├── create-ad/    # Image generation page
│   │   ├── copy/         # Copy generation page
│   │   ├── targeting/    # Audience targeting page
│   │   ├── budget/       # Budget configuration page
│   │   ├── campaigns/    # Campaign management page
│   │   └── analytics/    # Analytics dashboard page
│   ├── api/v1/           # API routes
│   ├── meta/             # Meta OAuth handling
│   └── auth/             # Authentication
├── components/           # React components
│   ├── lovable/          # Lovable-specific components
│   │   ├── lovable-navigation.tsx
│   │   ├── lovable-layout.tsx
│   │   ├── auth-blocker.tsx
│   │   └── feature-card.tsx
│   ├── ad-builder/       # Ad creation components
│   └── ui/               # shadcn/ui components
├── lib/                  # Business logic
│   ├── ai/              # AI service integrations
│   ├── meta/            # Meta API client
│   ├── services/        # Core services
│   ├── supabase/        # Supabase client
│   └── utils/           # Utilities
├── types/               # TypeScript definitions
└── docs/                # Documentation
```

## 🏗️ Architecture

### User Journey Overview

**For New Users:**
1. Visit root URL (`/`) → See extension download landing page
2. Install Chrome extension from Chrome Web Store
3. Open any Lovable project → "Grow" button appears
4. Click "Grow" → Iframe opens with authentication required
5. Sign in with Google → Access workspace

**Note:** Root URL (`/`) = Extension landing page | `/lovable` route = Iframe content (auth required)

### Technical Architecture

The extension follows a microservices architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Lovable Editor (lovable.dev)                 │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Navigation: [Cloud] [Database] [Speed] [Grow] ◄──┐   │     │
│  └──────────────────────────────────────────────┬──────┘  │     │
│                                                 │         │     │
│  ┌──────────────────────────────────────────────┼─────────┼────┐│
│  │  Right Panel: AdPilot iframe                 │         │    ││
│  │  ┌───────────────────────────────────────────┼────────┐│    ││
│  │  │  Next.js App (localhost:3000/lovable)     │        ││    ││
│  │  │  - Auth required (Google OAuth)           │        ││    ││
│  │  │  - Workspace, Campaign builder, Analytics │        ││    ││
│  │  └───────────────────────────────────────────┘        ││    ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
        ▲                           │
        │ postMessage                │ postMessage
        │ (PROJECT_CONTEXT)          │ (REQUEST_CONTEXT)
        │                           ▼
┌───────┴───────────────────────────────────────────────────┐
│  Content Script (content/inject.js)                       │
│  - Inject "Grow" button                                   │
│  - Manage iframe panel                                    │
│  - Extract project context                                │
│  - Handle URL routing (?view=grow)                        │
└───────────────────────────────────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────┐
│  Background Service Worker (background/service-worker.js) │
│  - Handle extension lifecycle                             │
│  - Manage chrome.storage                                  │
│  - Route messages                                         │
└───────────────────────────────────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────┐
│  Supabase Backend                                         │
│  - PostgreSQL database (campaigns, ads, meta_connections) │
│  - Storage (generated-images bucket)                      │
│  - Auth (Google OAuth)                                    │
│  - RLS policies (multi-tenant security)                   │
└───────────────────────────────────────────────────────────┘
```

### Key Components

**Content Script** (`content/inject.js`):
- Uses evidence-based DOM discovery to find Lovable's navigation
- Injects "Grow" tab matching Lovable's UI exactly
- Manages iframe panel visibility based on URL (`?view=grow`)
- Handles SPA navigation with MutationObserver
- Extracts and shares project context via postMessage

**Next.js App** (iframe at `localhost:3000/lovable`):
- Extension landing page at root (`/`) for installation instructions
- Workspace dashboard with authentication required
- Direct UI pages (no chat interface)
- Real-time metrics and analytics
- Meta OAuth integration
- AI-powered features (image generation, copy writing, targeting suggestions)

**Background Service Worker**:
- Minimal, infrastructure-only design
- Handles extension lifecycle events
- Routes messages between components
- Manages persistent storage

**Supabase Backend**:
- Multi-tenant PostgreSQL database
- Row Level Security (RLS) for data isolation
- Two access patterns: campaign-based and project-based
- Storage for AI-generated images
- Real-time subscriptions

### Communication Flow

1. User clicks "Grow" tab → Content script intercepts
2. Content script updates URL: `?view=grow`
3. Content script shows iframe, hides Lovable's panel
4. Iframe loads `/lovable` route → Auth check occurs
5. If not authenticated → Shows auth modal, user signs in with Google
6. After auth → Content script sends project context via postMessage
7. Next.js app receives context, fetches user's campaigns from Supabase
8. User creates ad → Saved to Supabase with RLS protection

For detailed architecture documentation, see `CURSOR_RULES.md`.

## 🛡️ Security

- **Minimal Permissions**: Only requests `storage` and `tabs`
- **No Sensitive Data**: API keys and tokens stored server-side only
- **Origin Validation**: All postMessage events validate origins
- **RLS Policies**: Database-level multi-tenant isolation
- **User Authentication**: Secure OAuth flow via Supabase Auth

## 📦 Deployment

### Deploy Next.js App

```bash
# Deploy to Vercel (recommended)
vercel deploy

# Or your preferred platform
# Set all environment variables in production
```

### Package Extension

```bash
# Create production build
npm run package

# Generates extension.zip ready for Chrome Web Store
```

### Chrome Web Store Submission

1. Package extension with `npm run package`
2. Create assets (screenshots, promotional images)
3. Update `manifest.json` with production iframe URL
4. Submit to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)

For detailed deployment instructions, see [DEVELOPMENT.md](DEVELOPMENT.md).

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 📚 Documentation

- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Complete developer guide: setup, testing, deployment, troubleshooting
- **[CURSOR_RULES.md](CURSOR_RULES.md)** - AI assistant reference: Chrome extensions, Lovable integration, Supabase patterns, best practices
- **[CHANGELOG.md](CHANGELOG.md)** - Version history and release notes

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/jackhunterking/adpilot-lovable-extension/issues)
- **Email**: support@adpilot.com
- **Documentation**: [docs.adpilot.com](https://docs.adpilot.com)

## 🎉 Acknowledgments

Built with:
- [Chrome Extensions API](https://developer.chrome.com/docs/extensions/)
- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Lovable](https://lovable.dev)

---

**Status**: ✅ Production Ready | **Version**: 1.0.0 | **Last Updated**: January 2025
