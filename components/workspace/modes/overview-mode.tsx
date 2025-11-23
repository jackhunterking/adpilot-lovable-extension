/**
 * Feature: Overview Mode Component
 * Purpose: Display metrics overview with cards showing campaign statistics
 * References:
 *  - Microservices: Extracted mode for workspace orchestrator
 */

"use client";

import React from 'react';
import { MetricsOverview } from '@/components/dashboard/metrics-overview';
import { useCampaignContext } from '@/lib/context/campaign-context';

import type { WorkspaceMode } from '@/lib/services/client/workspace-service-client';

export interface OverviewModeProps {
  campaignId: string;
  currentAdId?: string;
  ads: unknown[];
  refreshAds: () => Promise<void>;
  onNavigate: (mode: WorkspaceMode, adId?: string) => void;
}

/**
 * Overview Mode
 * Shows metrics overview with campaign statistics
 */
export function OverviewMode(props: OverviewModeProps) {
  const { campaign } = useCampaignContext();
  
  // Use campaign's associated Lovable project ID if available
  // For now, we'll use the campaign ID as the project identifier
  const lovableProjectId = campaign?.metadata?.lovable_project_id || props.campaignId;

  return (
    <div className="flex-1 h-full overflow-auto bg-muted border border-border rounded-tl-lg min-h-0 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">Overview</h2>
          <p className="text-sm text-muted-foreground">
            View your campaign performance at a glance.
          </p>
        </div>

        {/* Metrics Overview */}
        <MetricsOverview lovableProjectId={lovableProjectId} />
      </div>
    </div>
  );
}

