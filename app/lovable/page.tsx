/**
 * Feature: Lovable Dashboard
 * Purpose: Main workspace showing ads overview and management
 */

"use client"

import { Suspense } from "react"
import { LovableLayout } from "@/components/lovable/lovable-layout"
import { CampaignWorkspaceOrchestrator } from "@/components/workspace/workspace-orchestrator"
import { Loader2 } from "lucide-react"

export default function LovableDashboard() {
  return (
    <LovableLayout>
      <div className="flex flex-col h-full">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }>
          <CampaignWorkspaceOrchestrator />
        </Suspense>
      </div>
    </LovableLayout>
  )
}

