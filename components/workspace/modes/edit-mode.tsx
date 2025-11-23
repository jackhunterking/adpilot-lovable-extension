/**
 * Feature: Edit Mode Component
 * Purpose: Ad editing interface
 * References:
 *  - Microservices: Extracted from campaign-workspace.tsx
 */

"use client";

import React from 'react';
import { PreviewPanel } from '@/components/preview-panel';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

import type { WorkspaceMode } from '@/lib/services/client/workspace-service-client';

export interface EditModeProps {
  campaignId: string;
  currentAdId?: string;
  ads: unknown[];
  refreshAds: () => Promise<void>;
  onNavigate: (mode: WorkspaceMode, adId?: string) => void;
}

/**
 * Edit Mode
 * Handles ad editing workflow
 * Note: PreviewPanel has its own save/publish controls
 */
export function EditMode(props: EditModeProps) {
  return (
    <div className="flex-1 h-full overflow-hidden flex flex-col">
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
      
      {/* Edit interface */}
      <div className="flex-1 overflow-hidden">
        <PreviewPanel />
      </div>
    </div>
  );
}

