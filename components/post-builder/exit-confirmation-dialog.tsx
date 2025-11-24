"use client"

/**
 * Exit Confirmation Dialog for Post Builder
 * Prompts user to save draft before leaving
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

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
  const router = useRouter()

  const handleDiscard = () => {
    onOpenChange(false)
    router.push('/lovable/posts')
  }

  const handleSave = async () => {
    await onSaveAsDraft()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Save your post?</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes. Would you like to save this post as a draft before leaving?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleDiscard} disabled={isSaving}>
            Discard Changes
          </AlertDialogCancel>
          <Button variant="outline" onClick={onKeepEditing} disabled={isSaving}>
            Keep Editing
          </Button>
          <AlertDialogAction onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Draft'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

