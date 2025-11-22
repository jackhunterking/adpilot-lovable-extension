/**
 * Feature: Trigger Lovable AI Chat
 * Purpose: Send prompts from AdPilot to Lovable AI chat via Chrome extension
 * References:
 *  - Chrome Extension Messaging: https://developer.chrome.com/docs/extensions/mv3/messaging/
 *  - Lovable AI: https://lovable.dev
 */

import { toast } from "sonner"

/**
 * Payload structure for AI trigger messages sent to Chrome extension
 */
export interface AITriggerPayload {
  prompt: string
  images?: string[] // URLs to attached images for context
  context?: Record<string, any>
  timestamp?: number
}

/**
 * PostMessage structure for ADPILOT_TRIGGER_AI events
 */
export interface AITriggerMessage {
  type: 'ADPILOT_TRIGGER_AI'
  payload: AITriggerPayload
}

export interface TriggerLovableAIOptions {
  /**
   * The AI prompt template to send to Lovable
   */
  prompt: string
  
  /**
   * Optional array of image URLs to attach as context
   * Images will be passed to Lovable AI chat
   */
  images?: string[]
  
  /**
   * Optional context data to pass along with the prompt
   * Useful for debugging or passing additional parameters
   */
  context?: Record<string, any>
  
  /**
   * Show a toast notification after sending
   * @default true
   */
  showToast?: boolean
  
  /**
   * Custom toast message
   * @default "Check Lovable AI chat for your results!"
   */
  toastMessage?: string
}

/**
 * Trigger Lovable AI chat with a prompt from AdPilot
 * 
 * This function sends a postMessage to the parent window (Chrome extension),
 * which then forwards it to Lovable to open the AI chat with the prompt.
 * 
 * @example
 * ```typescript
 * // Simple usage
 * triggerLovableAI('Generate a Facebook ad image with blue background')
 * 
 * // With context
 * triggerLovableAI(
 *   'Generate ad image for ${productName}',
 *   { productName: 'Coffee Mug', dimensions: '1200x628' }
 * )
 * 
 * // Custom options
 * triggerLovableAI('Create edge function', {
 *   showToast: true,
 *   toastMessage: 'AI is generating your code...'
 * })
 * ```
 */
export function triggerLovableAI(
  promptOrOptions: string | TriggerLovableAIOptions,
  context?: Record<string, any>
): void {
  // Handle both function signatures
  let options: TriggerLovableAIOptions
  
  if (typeof promptOrOptions === 'string') {
    options = {
      prompt: promptOrOptions,
      context,
      showToast: true,
    }
  } else {
    options = {
      showToast: true,
      ...promptOrOptions,
    }
  }

  const { prompt, images, context: ctx, showToast, toastMessage } = options

  if (!prompt || prompt.trim() === '') {
    console.error('[triggerLovableAI] Prompt is required')
    toast.error('Cannot trigger AI: prompt is empty')
    return
  }

  try {
    // Check if we're in iframe context (extension)
    const isInIframe = window.self !== window.top

    if (!isInIframe) {
      console.warn('[triggerLovableAI] Not running in iframe, cannot communicate with Lovable')
      toast.warning('AI prompts only work when running in Lovable extension')
      return
    }

    // Send postMessage to parent window (Chrome extension content script)
    window.parent.postMessage(
      {
        type: 'ADPILOT_TRIGGER_AI',
        payload: {
          prompt: prompt.trim(),
          images: images || [],
          context: ctx || {},
          timestamp: Date.now(),
        },
      },
      '*' // Allow any origin since we're in iframe
    )

    console.log('[triggerLovableAI] Prompt sent:', {
      promptLength: prompt.length,
      hasImages: !!images && images.length > 0,
      imageCount: images?.length || 0,
      hasContext: !!ctx,
    })

    // Show success notification
    if (showToast) {
      toast.success(toastMessage || 'Check Lovable AI chat for your results!', {
        duration: 4000,
        description: 'The AI is processing your request',
      })
    }
  } catch (error) {
    console.error('[triggerLovableAI] Failed to send message:', error)
    toast.error('Failed to trigger AI chat')
  }
}

/**
 * Helper function to create a prompt template with variables
 * 
 * @example
 * ```typescript
 * const template = createPromptTemplate(
 *   'Generate a ${style} ad image for ${product}. Dimensions: ${width}x${height}px.',
 *   { style: 'modern', product: 'Coffee', width: 1200, height: 628 }
 * )
 * // Returns: "Generate a modern ad image for Coffee. Dimensions: 1200x628px."
 * ```
 */
export function createPromptTemplate(
  template: string,
  variables: Record<string, string | number>
): string {
  let result = template

  Object.entries(variables).forEach(([key, value]) => {
    // Replace ${key} with value
    const regex = new RegExp(`\\$\\{${key}\\}`, 'g')
    result = result.replace(regex, String(value))
  })

  return result
}

/**
 * Common prompt templates for AdPilot features
 */
export const PromptTemplates = {
  /**
   * Generate ad image with specific requirements
   */
  generateImage: (params: {
    productName: string
    style?: string
    headline?: string
    width?: number
    height?: number
  }) => {
    const { productName, style = 'modern', headline, width = 1200, height = 628 } = params
    
    let prompt = `Generate a Facebook ad image for ${productName}. Style: ${style}. Dimensions: ${width}x${height}px.`
    
    if (headline) {
      prompt += ` Include text overlay: "${headline}"`
    }
    
    return prompt
  },

  /**
   * Generate ad copy variations
   */
  generateCopy: (params: {
    productName: string
    targetAudience: string
    tone?: string
    variations?: number
  }) => {
    const { productName, targetAudience, tone = 'friendly', variations = 3 } = params
    
    return `Generate ${variations} Facebook ad copy variations for ${productName}. Target audience: ${targetAudience}. Tone: ${tone}. Include headline and body text for each variation.`
  },

  /**
   * Generate edge function for conversion tracking
   */
  generateConversionTracking: (params: {
    eventType?: string
    pixelId?: string
  }) => {
    const { eventType = 'Lead', pixelId } = params
    
    let prompt = `Create a Supabase edge function named 'meta-conversion-tracking' that sends ${eventType} events to Meta Conversion API v18.0. Hash email with SHA-256. Use Meta Pixel ID and Access Token from Supabase secrets.

Requirements:
- Function should accept POST requests with { email, event_source_url, event_time }
- Hash email using SHA-256 before sending to Meta
- Send to Meta Conversions API endpoint
- Return success/error response

Include proper error handling and TypeScript types.`

    if (pixelId) {
      prompt += `\n\nUse Pixel ID: ${pixelId}`
    }

    return prompt
  },

  /**
   * Generate ad targeting suggestions
   */
  generateTargeting: (params: {
    productName: string
    productCategory: string
    targetCountry?: string
  }) => {
    const { productName, productCategory, targetCountry = 'United States' } = params
    
    return `Suggest Facebook ad targeting criteria for ${productName} (${productCategory}). Location: ${targetCountry}. Include: age range, gender, interests, behaviors, and detailed targeting suggestions.`
  },

  /**
   * Analyze ad performance and suggest improvements
   */
  analyzePerformance: (params: {
    impressions: number
    clicks: number
    conversions: number
    spend: number
  }) => {
    const { impressions, clicks, conversions, spend } = params
    
    const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0'
    const conversionRate = clicks > 0 ? ((conversions / clicks) * 100).toFixed(2) : '0'
    const cpc = clicks > 0 ? (spend / clicks).toFixed(2) : '0'
    
    return `Analyze this Facebook ad performance and suggest improvements:

Impressions: ${impressions.toLocaleString()}
Clicks: ${clicks.toLocaleString()}
Conversions: ${conversions}
Spend: $${spend.toFixed(2)}
CTR: ${ctr}%
Conversion Rate: ${conversionRate}%
CPC: $${cpc}

What should I optimize to improve results?`
  },
}

/**
 * Type guard to check if we're in iframe context
 */
export function isInLovableExtension(): boolean {
  try {
    return window.self !== window.top && window.parent !== window.self
  } catch {
    // Security error means we're in cross-origin iframe
    return true
  }
}

