# AdPilot for Lovable - Chrome Extension

Chrome extension that integrates AdPilot into the Lovable editor, enabling users to create and manage Meta ads without leaving their development workflow.

## 🎯 Overview

This extension adds an "Ads" tab to the Lovable editor, providing seamless access to AdPilot's advertising capabilities:
- Create Meta (Facebook/Instagram) ad campaigns
- Generate ad creatives with AI
- Manage targeting and budgets
- Track conversions and performance

## 🚀 Quick Start

### For Users

1. Install from [Chrome Web Store](#) (coming soon)
2. Navigate to any Lovable project
3. Click the "Ads" tab that appears next to "Speed"
4. Sign in to AdPilot and start creating ads

### For Developers

```bash
# Clone the repository
git clone https://github.com/jackhunterking/adpilot-lovable-extension.git
cd adpilot-lovable-extension

# Load in Chrome
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select this directory
```

## 📁 Project Structure

```
adpilot-lovable-extension/
├── manifest.json           # Extension configuration
├── background/             # Service worker
├── content/               # Content scripts (injected into Lovable)
├── services/              # Business logic services
├── ui/                    # UI components
├── assets/                # Icons and images
├── types/                 # TypeScript type definitions
├── docs/                  # Documentation
└── scripts/               # Build and deployment scripts
```

## 🔧 Development

See [DEVELOPMENT.md](docs/DEVELOPMENT.md) for detailed development instructions.

### Key Commands

```bash
# Package for Chrome Web Store
npm run package

# Validate manifest
npm run validate
```

## 🧪 Testing

See [TESTING.md](docs/TESTING.md) for testing instructions.

### Quick Test

1. Load extension in Chrome (see above)
2. Navigate to `lovable.dev/projects/{any-project-id}`
3. Look for "Ads" tab
4. Click tab to open AdPilot panel

## 📦 Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for Chrome Web Store submission instructions.

## 🔗 Related Projects

- **Main AdPilot:** [github.com/jackhunterking/AdPilot](https://github.com/jackhunterking/AdPilot)
- **AdPilot API:** [api.adpilot.com](https://api.adpilot.com)
- **Documentation:** [docs.adpilot.com](https://docs.adpilot.com)

## 🏗️ Architecture

The extension communicates with AdPilot's backend via REST API:

```
┌─────────────────────────┐
│   Lovable Editor        │
│   (lovable.dev)         │
└─────────────────────────┘
            ↓
┌─────────────────────────┐
│   Chrome Extension      │
│   (This Repo)           │
│   - Injects "Ads" tab   │
│   - Manages UI          │
└─────────────────────────┘
            ↓ REST API
┌─────────────────────────┐
│   AdPilot Backend       │
│   (api.adpilot.com)     │
│   - Campaign management │
│   - Meta API integration│
└─────────────────────────┘
```

## 🛡️ Security

- All sensitive operations go through AdPilot's backend
- No API keys stored in extension
- User authentication via AdPilot
- postMessage communication validates origins

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines first.

## 📧 Support

- **Issues:** [GitHub Issues](https://github.com/jackhunterking/adpilot-lovable-extension/issues)
- **Email:** support@adpilot.com
- **Documentation:** [docs.adpilot.com](https://docs.adpilot.com)

## 🎉 Acknowledgments

Built with:
- [Chrome Extensions API](https://developer.chrome.com/docs/extensions/)
- [AdPilot API](https://api.adpilot.com)
- [Lovable](https://lovable.dev)

