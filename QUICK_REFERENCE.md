# Quick Reference - Chrome Store URL Configuration

## 📍 Single Location to Update After Publishing

When your Chrome extension is approved, update **ONLY THIS FILE**:

### `lib/constants.ts`

```typescript
// Line 12-16: Update this constant with your extension's store URL
export const CHROME_STORE_URL = 'https://chrome.google.com/webstore/detail/adpilot-for-lovable/YOUR_EXTENSION_ID'
```

**That's it!** This constant is automatically used in:
- ✅ Landing page (`app/page.tsx`) - Download button
- ✅ Documentation files
- ✅ Any other references across the app

## 🎯 Your Extension ID

After Chrome Web Store approval, you'll receive an extension ID. It looks like:
```
abcdefghijklmnopqrstuvwxyz123456
```

Your final store URL will be:
```
https://chrome.google.com/webstore/detail/adpilot-for-lovable/abcdefghijklmnopqrstuvwxyz123456
```

## 🚀 Publishing Workflow

1. **Before Publishing:**
   - Test locally: `npm run dev`
   - Package extension: `npm run package`
   - Submit to Chrome Web Store (see `CHROME_STORE_PUBLISHING.md`)

2. **After Approval:**
   - Update `CHROME_STORE_URL` in `lib/constants.ts`
   - Redeploy production app
   - Done! ✨

3. **Optional Updates:**
   - Update production iframe URL in `content/inject.js` (line 325)
   - Update `EXTENSION_ID` in `lib/constants.ts` (line 19)

## 📚 Documentation Files

- **`LOVABLE_EXTENSION_COMPLETE.md`** - Full transformation summary
- **`CHROME_STORE_PUBLISHING.md`** - Complete publishing guide
- **`LOVABLE_EXTENSION_USER_JOURNEY_TEST.md`** - Testing checklist
- **`README.md`** - Project overview
- **`DEVELOPMENT.md`** - Developer guide

## ✅ Pre-Flight Checklist

Before deploying to production:

- [ ] Test extension locally works perfectly
- [ ] All features tested in Lovable
- [ ] Auth flow works smoothly
- [ ] Meta connection works
- [ ] Can create and publish ads
- [ ] Analytics display correctly
- [ ] No console errors
- [ ] Environment variables set in production
- [ ] Database migrations applied
- [ ] Privacy policy accessible at `/privacy`
- [ ] Terms of service accessible at `/terms`

## 🎯 Current Status

✅ **Development Complete**
✅ **All Documentation Updated**
✅ **Configuration Centralized**
✅ **Ready for Testing**
✅ **Ready for Chrome Web Store Submission**

---

**Everything is ready. Just test, publish, and update the one constant!**

