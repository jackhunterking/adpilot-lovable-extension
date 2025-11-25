/**
 * Feature: Delete Post Dialog
 * Purpose: Confirmation dialog for deleting posts
 * Microservices: Thin wrapper around generic ConfirmationDialog
 * References:
 *  - ConfirmationDialog: components/ui/confirmation-dialog.tsx
 */

"use client"

import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'

interface DeletePostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  postName: string
  postStatus: 'draft' | 'scheduled' | 'published' | 'failed'
  onConfirm: () => void
  isDeleting?: boolean
}

export function DeletePostDialog({
  open,
  onOpenChange,
  postName,
  postStatus,
  onConfirm,
  isDeleting = false,
}: DeletePostDialogProps) {
  const isPublished = postStatus === 'published'
  
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Post?"
      description={
        <>
          Are you sure you want to delete <strong>{postName}</strong>? This action cannot be undone.
          {isPublished && (
            <>
              {' '}
              <span className="text-muted-foreground">
                (note: the post will remain on Facebook/Instagram)
              </span>
            </>
          )}
        </>
      }
      actionLabel="Delete"
      onConfirm={onConfirm}
      isLoading={isDeleting}
    />
  )
}

