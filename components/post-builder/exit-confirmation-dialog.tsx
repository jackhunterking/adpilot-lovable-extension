/**
 * Feature: Exit Confirmation Dialog for Post Builder
 * Purpose: Prompts user to save draft before leaving
 * Microservices: Thin wrapper around generic ConfirmationDialog
 * References:
 *  - ConfirmationDialog: components/ui/confirmation-dialog.tsx
 */

"use client"

import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'

interface ExitConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaveAsDraft: () => Promise<void>
  onKeepEditing: () => void
  isSaving: boolean
}

export function ExitConfirmationDialog({
  open,
  onOpenChange,
  onSaveAsDraft,
  onKeepEditing,
  isSaving,
}: ExitConfirmationDialogProps) {
  const handleSave = async () => {
    await onSaveAsDraft()
    onOpenChange(false)
  }

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Save your post?"
      description={
        <>
          You have unsaved changes. Would you like to save this post as a draft before leaving?
        </>
      }
      actionLabel="Save Draft"
      cancelLabel="Keep Editing"
      variant="default"
      onConfirm={handleSave}
      isLoading={isSaving}
    />
  )
}

