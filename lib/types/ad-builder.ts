/**
 * TypeScript types for Ad Builder
 */

/**
 * Ad draft interface - stores all ad data across the 5-step wizard
 */
export interface AdDraft {
  /**
   * Step 1: Get Started - Campaign goal selection
   */
  goal?: 'signups' | 'traffic' | 'calls'
  
  /**
   * Product context for AI (optional, for future use)
   */
  productContext?: string

  /**
   * Step 2: Creative & Copy
   */
  creative?: {
    /** Array of image URLs for the ad (main app - 3 variations) */
    images: string[]
    
    /** Square format image URL (1080x1080) - Lovable extension */
    imageUrlSquare?: string
    
    /** Vertical format image URL (1080x1920) - Lovable extension */
    imageUrlVertical?: string
    
    /** Selected format for Lovable extension */
    selectedFormat?: 'square' | 'vertical'
    
    /** Main headline (max 40 chars recommended) */
    headline: string
    
    /** Primary text/body (max 125 chars recommended) */
    primaryText: string
    
    /** Additional description (max 30 chars recommended) */
    description: string
    
    /** Call-to-action button text */
    callToAction: string
  }

  /**
   * Step 3: Target Location
   * Step 4: Target Audience
   */
  targeting?: {
    /** Geographic locations (countries, states, cities) - simplified for backward compatibility */
    locations?: string[]
    
    /** Minimum age (18-65) */
    ageMin?: number
    
    /** Maximum age (18-65+) */
    ageMax?: number
    
    /** Gender targeting */
    gender?: "all" | "male" | "female"
    
    /** Interest-based targeting keywords */
    interests?: string[]
  }

  /**
   * Step 4: Budget & Schedule
   */
  budget?: {
    /** Daily budget amount in USD */
    amount: number
    
    /** Campaign schedule type */
    schedule: "continuous" | "date_range"
    
    /** Start date (ISO string, only for date_range) */
    startDate?: string
    
    /** End date (ISO string, only for date_range) */
    endDate?: string
  }
}

/**
 * Step component props interface
 */
export interface AdBuilderStepProps {
  /** Current draft state */
  draft: AdDraft
  
  /** Update draft with partial changes */
  onUpdate: (updates: Partial<AdDraft>) => void
  
  /** Advance to next step */
  onNext: () => void
  
  /** Go back to previous step */
  onBack: () => void
}

/**
 * Step definition interface
 */
export interface AdBuilderStep {
  /** Step number (1-5) */
  id: number
  
  /** Step display name */
  name: string
  
  /** Step component */
  component: React.ComponentType<AdBuilderStepProps>
}

/**
 * Ad creation result from API
 */
export interface CreateAdResult {
  success: boolean
  adId?: string
  error?: {
    message: string
    code?: string
  }
}

/**
 * Validation result for a step
 */
export interface StepValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Dual format image result from AI generation (Lovable extension)
 */
export interface DualFormatImageResult {
  square: string  // URL to 1080x1080 image
  vertical: string  // URL to 1080x1920 image
}

/**
 * Image format type for Lovable extension
 */
export type ImageFormat = 'square' | 'vertical'

