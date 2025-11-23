/**
 * Feature: Results Mode Component
 * Purpose: Campaign results and analytics view
 * References:
 *  - Microservices: Extracted from campaign-workspace.tsx
 */

"use client";

import React from 'react';
import { ResultsPanel } from '@/components/results/results-panel';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

import type { WorkspaceMode } from '@/lib/services/client/workspace-service-client';

export interface ResultsModeProps {
  campaignId: string;
  currentAdId?: string;
  ads: unknown[];
  refreshAds: () => Promise<void>;
  onNavigate: (mode: WorkspaceMode, adId?: string) => void;
}

/**
 * Results Mode
 * Shows campaign performance metrics
 */
export function ResultsMode(props: ResultsModeProps) {
  const hasPublishedAds = (props.ads as Array<{ status: string }>).some(
    ad => ad.status === 'active' || ad.status === 'paused'
  );

  return (
    <div className="flex-1 h-full overflow-hidden bg-background min-h-0 flex flex-col">
      {/* Simple header with back navigation */}
      <div className="border-b px-6 py-3 flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => props.onNavigate('all-ads')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          See All Ads
        </Button>
      </div>
      
      {/* Results panel */}
      <div className="flex-1 overflow-hidden">
        <ResultsPanel isEnabled={hasPublishedAds} />
      </div>
    </div>
  );
}

