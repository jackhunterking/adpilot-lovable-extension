/**
 * Feature: Lovable Dashboard
 * Purpose: Main workspace showing ads overview and management
 */

"use client"

import { LovableLayout } from "@/components/lovable/lovable-layout"
import { CampaignWorkspaceOrchestrator } from "@/components/workspace/workspace-orchestrator"

export default function LovableDashboard() {
  return (
    <LovableLayout>
      <div className="flex flex-col h-full">
        <CampaignWorkspaceOrchestrator />
      </div>
    </LovableLayout>
  )
}

