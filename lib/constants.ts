/**
 * Application Constants
 * Centralized configuration for the AdPilot extension
 */

// Company/Product Branding
export const COMPANY_NAME = 'AdPilot'
export const PRODUCT_NAME = 'AdPilot for Lovable'

// Chrome Web Store Configuration
// TODO: Update this URL when extension is published to Chrome Web Store
// Steps to publish:
// 1. Run: npm run package
// 2. Create store listing at: https://chrome.google.com/webstore/devconsole
// 3. Upload the generated extension.zip
// 4. Once approved, replace the URL below with your extension's store page
export const CHROME_STORE_URL = 'https://chrome.google.com/webstore'
// Example format after publishing:
// export const CHROME_STORE_URL = 'https://chrome.google.com/webstore/detail/adpilot-for-lovable/YOUR_EXTENSION_ID'

// Extension Configuration
export const EXTENSION_ID = process.env.NEXT_PUBLIC_EXTENSION_ID || 'development'

// URLs
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
export const LOVABLE_IFRAME_URL = `${APP_URL}/lovable`

// Lovable Integration
export const LOVABLE_DOMAIN = 'lovable.dev'
export const LOVABLE_PROJECT_PATH_PATTERN = /\/projects\/([^\/\?]+)/

// Feature Flags
export const FEATURES = {
  AI_IMAGE_GENERATION: true,
  AI_COPY_GENERATION: true,
  META_CONVERSIONS_API: true,
  DUAL_FORMAT_IMAGES: true,
  ANALYTICS_DASHBOARD: true,
} as const

// AI Model Configuration
export const DEFAULT_AI_MODEL = 'gpt-4o-mini' // Balanced performance/cost
export const IMAGE_MODEL = 'dall-e-3' // For image generation

// Meta/Facebook Configuration
export const META_GRAPH_VERSION = process.env.NEXT_PUBLIC_FB_GRAPH_VERSION || 'v21.0'
export const FB_APP_ID = process.env.NEXT_PUBLIC_FB_APP_ID || ''

// Storage Configuration
export const IMAGE_BUCKET_NAME = 'generated-images'
export const MAX_IMAGE_SIZE_MB = 10

// Budget Limits (in cents)
export const MIN_DAILY_BUDGET = 500 // $5.00
export const MAX_DAILY_BUDGET = 100000 // $1,000.00
export const DEFAULT_DAILY_BUDGET = 2000 // $20.00

// API Rate Limits
export const RATE_LIMITS = {
  AI_REQUESTS_PER_MINUTE: 10,
  META_API_REQUESTS_PER_HOUR: 200,
} as const

// Error Messages
export const ERROR_MESSAGES = {
  AUTH_REQUIRED: 'Authentication required. Please sign in to continue.',
  META_CONNECTION_REQUIRED: 'Please connect your Facebook account to continue.',
  INVALID_PROJECT: 'Invalid Lovable project. Please open a valid project.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  AD_CREATED: 'Ad created successfully!',
  AD_PUBLISHED: 'Ad published to Meta!',
  CAMPAIGN_CREATED: 'Campaign created successfully!',
  SETTINGS_SAVED: 'Settings saved successfully!',
} as const
