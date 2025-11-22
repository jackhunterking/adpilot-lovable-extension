"use client"

import { MetricsOverview } from "./metrics-overview"

interface DashboardTabsProps {
  lovableProjectId: string
}

export function DashboardTabs({ lovableProjectId }: DashboardTabsProps) {
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Overview</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor your ad performance and conversions
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pt-4">
        <MetricsOverview lovableProjectId={lovableProjectId} />
      </div>
    </div>
  )
}

