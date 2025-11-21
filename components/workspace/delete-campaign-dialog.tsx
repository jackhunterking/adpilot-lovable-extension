/**
 * Feature: Delete Campaign Dialog
 * Purpose: Confirmation dialog for deleting campaigns
 * Microservices: Thin wrapper around generic ConfirmationDialog
 * References:
 *  - ConfirmationDialog: components/ui/confirmation-dialog.tsx
 */

"use client"

import { Tables } from '@/lib/supabase/database.types'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'

type Campaign = Tables<'campaigns'>

interface DeleteCampaignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaign: Campaign | null
  onConfirm: () => void
  isDeleting?: boolean
}

export function DeleteCampaignDialog({
  open,
  onOpenChange,
  campaign,
  onConfirm,
  isDeleting = false,
}: DeleteCampaignDialogProps) {
  if (!campaign) return null

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Campaign?"
      description={
        <>
          Are you sure you want to delete <strong>{campaign.name}</strong>? This action cannot be undone.
        </>
      }
      actionLabel="Delete"
      onConfirm={onConfirm}
      isLoading={isDeleting}
    />
  )
}

