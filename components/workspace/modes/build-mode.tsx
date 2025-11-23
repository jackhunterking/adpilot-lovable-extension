/**
 * Feature: Build Mode Component
 * Purpose: Ad building interface with 6-step wizard
 * References:
 *  - Microservices: Extracted from campaign-workspace.tsx
 */

"use client";

import React from 'react';
import { AdBuilder } from '@/components/ad-builder/ad-builder';

import type { WorkspaceMode } from '@/lib/services/client/workspace-service-client';

export interface BuildModeProps {
  campaignId: string;
  currentAdId?: string;
  ads: unknown[];
  refreshAds: () => Promise<void>;
  onNavigate: (mode: WorkspaceMode, adId?: string) => void;
}

/**
 * Build Mode
 * Handles ad creation workflow with 6-step wizard:
 * 1. Get Started (prompt input)
 * 2. Creative & Copy
 * 3. Target Location
 * 4. Target Audience
 * 5. Budget & Schedule
 * 6. Review & Launch
 */
export function BuildMode(props: BuildModeProps) {
  // Get lovableProjectId from sessionStorage (set by LovableLayout)
  const [lovableProjectId, setLovableProjectId] = React.useState<string | undefined>(undefined)
  
  React.useEffect(() => {
    try {
      const context = sessionStorage.getItem('adpilot_lovable_context')
      if (context) {
        const parsed = JSON.parse(context)
        setLovableProjectId(parsed.lovableProjectId)
        console.log('[BuildMode] Loaded project ID:', parsed.lovableProjectId)
      }
    } catch (err) {
      console.error('[BuildMode] Error loading context:', err)
    }
  }, [])
  
  return (
    <div className="flex-1 h-full overflow-hidden">
      <AdBuilder 
        lovableProjectId={lovableProjectId}
        refreshAds={props.refreshAds}
      />
    </div>
  );
}

