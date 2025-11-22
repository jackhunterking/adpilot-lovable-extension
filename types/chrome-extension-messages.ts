/**
 * TypeScript types for Chrome Extension message passing
 * between AdPilot iframe and content script
 */

/**
 * Base message structure for all AdPilot messages
 */
export interface AdPilotMessage<T = any> {
  type: string
  payload?: T
  timestamp?: number
}

/**
 * Payload for AI trigger requests
 */
export interface AITriggerPayload {
  /** The AI prompt to inject into Lovable chat */
  prompt: string
  
  /** Optional image URLs to attach as context */
  images?: string[]
  
  /** Optional context data for debugging/tracking */
  context?: Record<string, any>
  
  /** Timestamp when the message was sent */
  timestamp?: number
}

/**
 * Message to trigger Lovable AI chat with a prompt
 */
export interface AITriggerMessage extends AdPilotMessage<AITriggerPayload> {
  type: 'ADPILOT_TRIGGER_AI'
  payload: AITriggerPayload
}

/**
 * Payload for project context (Lovable project information)
 */
export interface ProjectContextPayload {
  /** Lovable project ID extracted from URL */
  lovableProjectId: string
  
  /** Full Lovable project URL */
  lovableProjectUrl: string
  
  /** Timestamp when context was captured */
  timestamp: number
}

/**
 * Message containing Lovable project context
 */
export interface ProjectContextMessage extends AdPilotMessage<ProjectContextPayload> {
  type: 'ADPILOT_PROJECT_CONTEXT'
  payload: ProjectContextPayload
}

/**
 * Message to request project context from extension
 */
export interface RequestContextMessage extends AdPilotMessage {
  type: 'ADPILOT_REQUEST_CONTEXT'
  timestamp: number
}

/**
 * Payload for image generated notification
 */
export interface ImageGeneratedPayload {
  /** URL of the generated image from Lovable */
  imageUrl: string
  
  /** Format of the generated image */
  format?: 'square' | 'vertical'
  
  /** Timestamp when image was detected */
  timestamp: number
}

/**
 * Message sent when Lovable AI generates an image
 */
export interface ImageGeneratedMessage extends AdPilotMessage<ImageGeneratedPayload> {
  type: 'ADPILOT_IMAGE_GENERATED'
  payload: ImageGeneratedPayload
}

/**
 * Union type of all AdPilot message types
 */
export type AdPilotMessageType = 
  | AITriggerMessage
  | ProjectContextMessage
  | RequestContextMessage
  | ImageGeneratedMessage

/**
 * Type guard to check if message is an AdPilot message
 */
export function isAdPilotMessage(message: any): message is AdPilotMessageType {
  return (
    message &&
    typeof message === 'object' &&
    typeof message.type === 'string' &&
    message.type.startsWith('ADPILOT_')
  )
}

/**
 * Type guard to check if message is an AI trigger
 */
export function isAITriggerMessage(message: any): message is AITriggerMessage {
  return (
    isAdPilotMessage(message) &&
    message.type === 'ADPILOT_TRIGGER_AI' &&
    message.payload &&
    typeof message.payload.prompt === 'string'
  )
}

/**
 * Type guard to check if message is a project context message
 */
export function isProjectContextMessage(message: any): message is ProjectContextMessage {
  return (
    isAdPilotMessage(message) &&
    message.type === 'ADPILOT_PROJECT_CONTEXT' &&
    message.payload &&
    typeof message.payload.lovableProjectId === 'string'
  )
}

/**
 * Type guard to check if message is a context request
 */
export function isRequestContextMessage(message: any): message is RequestContextMessage {
  return (
    isAdPilotMessage(message) &&
    message.type === 'ADPILOT_REQUEST_CONTEXT'
  )
}

/**
 * Type guard to check if message is an image generated notification
 */
export function isImageGeneratedMessage(message: any): message is ImageGeneratedMessage {
  return (
    isAdPilotMessage(message) &&
    message.type === 'ADPILOT_IMAGE_GENERATED' &&
    message.payload &&
    typeof message.payload.imageUrl === 'string'
  )
}

