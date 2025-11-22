"use client"

/**
 * Feature: Ad Builder Exit Confirmation Dialog
 * Purpose: Confirm exit from Ad Builder with option to save draft
 * References:
 *  - Consistent with existing ConfirmationDialog pattern
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Save, Loader2 } from "lucide-react"

interface ExitConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaveAsDraft: () => Promise<void>
  onKeepEditing: () => void
  isSaving?: boolean
}

export function ExitConfirmationDialog({
  open,
  onOpenChange,
  onSaveAsDraft,
  onKeepEditing,
  isSaving = false,
}: ExitConfirmationDialogProps) {
  const handleSave = async () => {
    await onSaveAsDraft()
  }

  return (
    <Dialog open={open} onOpenChange={isSaving ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader className="mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
              <Save className="h-6 w-6 text-blue-600" />
            </div>
            <DialogTitle className="text-xl">Save Your Progress?</DialogTitle>
          </div>
        </DialogHeader>
        
        <DialogDescription className="text-sm text-muted-foreground mb-6">
          You have unsaved changes. Would you like to save this ad as a draft? You can
          continue editing it later from the ads list.
        </DialogDescription>
        
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="lg"
            onClick={onKeepEditing}
            disabled={isSaving}
          >
            Keep Editing
          </Button>
          <Button
            variant="default"
            size="lg"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save as Draft
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

