/**
 * Feature: All Ads Mode Component
 * Purpose: Grid view of all ads in campaign
 * References:
 *  - Microservices: Extracted from campaign-workspace.tsx
 */

"use client";

import React from 'react';
import { AllAdsGrid } from '@/components/all-ads-grid';
import { toast } from 'sonner';

import type { WorkspaceMode } from '@/lib/services/client/workspace-service-client';

export interface AllAdsModeProps {
  campaignId: string;
  currentAdId?: string;
  ads: unknown[];
  refreshAds: () => Promise<void>;
  onNavigate: (mode: WorkspaceMode, adId?: string) => void;
}

/**
 * All Ads Mode
 * Shows grid of all ads
 */
export function AllAdsMode(props: AllAdsModeProps) {
  const handlePublishAd = async (adId: string) => {
    try {
      const response = await fetch(`/api/v1/ads/${adId}/publish`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error?.message || 'Failed to publish ad');
        return;
      }

      await props.refreshAds();
      toast.success('Ad published successfully');
    } catch (error) {
      console.error('[AllAdsMode] Publish ad error:', error);
      toast.error('Failed to publish ad');
    }
  };
  
  const handlePauseAd = async (adId: string) => {
    try {
      const response = await fetch(`/api/v1/ads/${adId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'paused' }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error?.message || 'Failed to pause ad');
        return false;
      }

      await props.refreshAds();
      toast.success('Ad paused successfully');
      return true;
    } catch (error) {
      console.error('[AllAdsMode] Pause ad error:', error);
      toast.error('Failed to pause ad');
      return false;
    }
  };
  
  const handleResumeAd = async (adId: string) => {
    try {
      const response = await fetch(`/api/v1/ads/${adId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'active' }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error?.message || 'Failed to resume ad');
        return false;
      }

      await props.refreshAds();
      toast.success('Ad resumed successfully');
      return true;
    } catch (error) {
      console.error('[AllAdsMode] Resume ad error:', error);
      toast.error('Failed to resume ad');
      return false;
    }
  };
  
  const handleCreateABTest = (adId: string) => {
    props.onNavigate('ab-test-builder', adId);
  };
  
  const handleDeleteAd = async (adId: string) => {
    try {
      const response = await fetch(`/api/v1/ads/${adId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error?.message || 'Failed to delete ad');
        return;
      }

      await props.refreshAds();
      toast.success('Ad deleted successfully');
    } catch (error) {
      console.error('[AllAdsMode] Delete ad error:', error);
      toast.error('Failed to delete ad');
    }
  };
  
  const handleNewAd = () => {
    props.onNavigate('build');
  };

  return (
    <div className="flex-1 h-full overflow-hidden bg-background min-h-0">
      <AllAdsGrid
        ads={props.ads as import('@/lib/types/workspace').AdVariant[]}
        campaignId={props.campaignId}
        onViewAd={() => props.onNavigate('results')}
        onEditAd={(adId) => props.onNavigate('edit', adId)}
        onPublishAd={handlePublishAd}
        onPauseAd={handlePauseAd}
        onResumeAd={handleResumeAd}
        onCreateABTest={handleCreateABTest}
        onDeleteAd={handleDeleteAd}
        onRefreshAds={props.refreshAds}
        onNewAd={handleNewAd}
      />
    </div>
  );
}

