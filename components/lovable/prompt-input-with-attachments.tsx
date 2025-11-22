"use client"

/**
 * Prompt Input with Attachments Component
 * Purpose: Combined prompt input + attachment button + send button
 * Features:
 * - Auto-grow textarea (max 3 rows)
 * - Character counter (500 chars max)
 * - Integration with ImageAttachmentInput
 * - Loading states
 * - Send button with icon
 */

import { useState, useCallback, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ImageAttachmentInput, type AttachedImage } from "./image-attachment-input"

interface PromptInputWithAttachmentsProps {
  onSend: (prompt: string, attachedImages: AttachedImage[]) => void | Promise<void>
  isGenerating?: boolean
  placeholder?: string
  maxLength?: number
  className?: string
}

export function PromptInputWithAttachments({
  onSend,
  isGenerating = false,
  placeholder = "Describe the image you want to create (e.g., 'Modern tech startup hero image with blue gradient')",
  maxLength = 500,
  className
}: PromptInputWithAttachmentsProps) {
  const [promptText, setPromptText] = useState("")
  const [attachedImages, setAttachedImages] = useState<AttachedImage[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-grow textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    // Reset height to auto to get correct scrollHeight
    textarea.style.height = 'auto'
    
    // Calculate new height (max 3 rows ~= 72px)
    const newHeight = Math.min(textarea.scrollHeight, 72)
    textarea.style.height = `${newHeight}px`
  }, [promptText])

  const handleSend = async () => {
    if (!promptText.trim() || isGenerating) return

    try {
      await onSend(promptText.trim(), attachedImages)
      // Clear on success
      setPromptText("")
      setAttachedImages([])
    } catch (error) {
      console.error('[PromptInput] Send failed:', error)
      // Don't clear on error - let user retry
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const canSend = promptText.trim().length > 0 && !isGenerating
  const charCount = promptText.length
  const isNearLimit = charCount > maxLength * 0.8
  const isOverLimit = charCount > maxLength

  return (
    <div className={cn("space-y-3", className)}>
      {/* Input Row */}
      <div className="flex gap-2 items-end">
        {/* Attachment Button */}
        <div className="flex-shrink-0">
          <ImageAttachmentInput
            attachedImages={attachedImages}
            onImagesChange={setAttachedImages}
            disabled={isGenerating}
          />
        </div>

        {/* Prompt Input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={promptText}
            onChange={(e) => {
              const newValue = e.target.value
              // Enforce max length
              if (newValue.length <= maxLength) {
                setPromptText(newValue)
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isGenerating}
            className={cn(
              "resize-none min-h-[40px] pr-12",
              isOverLimit && "border-destructive focus-visible:ring-destructive"
            )}
            rows={1}
          />
          
          {/* Character Counter (inside textarea) */}
          <div
            className={cn(
              "absolute bottom-2 right-2 text-xs",
              isOverLimit ? "text-destructive" : 
              isNearLimit ? "text-amber-500" : 
              "text-muted-foreground"
            )}
          >
            {charCount}/{maxLength}
          </div>
        </div>

        {/* Send Button */}
        <div className="flex-shrink-0">
          <Button
            type="button"
            size="icon"
            onClick={handleSend}
            disabled={!canSend}
            className="h-9 w-9"
            title={canSend ? "Send prompt" : "Enter a prompt to send"}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Help Text */}
      {!isGenerating && attachedImages.length === 0 && (
        <p className="text-xs text-muted-foreground">
          💡 Tip: Attach reference images to help AI understand your vision better
        </p>
      )}

      {isGenerating && (
        <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>AI is creating your images...</span>
        </div>
      )}
    </div>
  )
}

