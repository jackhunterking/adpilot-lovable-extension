/**
 * Feature: Edit Mode Component
 * Purpose: Ad editing interface with AdBuilder wizard
 * References:
 *  - Microservices: Extracted from campaign-workspace.tsx
 *  - Uses same AdBuilder as create flow for unified UX
 */

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { AdBuilder } from '@/components/ad-builder/ad-builder';
import type { AdDraft } from '@/lib/types/ad-builder';
import type { WorkspaceMode } from '@/lib/services/client/workspace-service-client';
import type { CampaignAd } from '@/lib/hooks/use-campaign-ads';
import { Loader2 } from 'lucide-react';

export interface EditModeProps {
  campaignId: string;
  currentAdId?: string;
  ads: unknown[];
  refreshAds: () => Promise<void>;
  onNavigate: (mode: WorkspaceMode, adId?: string) => void;
}

/**
 * Edit Mode
 * Handles ad editing workflow using AdBuilder wizard
 */
export function EditMode(props: EditModeProps) {
  const [lovableProjectId, setLovableProjectId] = useState<string | undefined>(undefined);
  
  // Load lovable project context
  useEffect(() => {
    try {
      const context = sessionStorage.getItem('adpilot_lovable_context');
      if (context) {
        const parsed = JSON.parse(context);
        setLovableProjectId(parsed.lovableProjectId);
        console.log('[EditMode] Loaded project ID:', parsed.lovableProjectId);
      }
    } catch (err) {
      console.error('[EditMode] Error loading context:', err);
    }
  }, []);

  // Find the ad being edited
  const currentAd = useMemo(() => {
    if (!props.currentAdId) return null;
    return (props.ads as CampaignAd[]).find(ad => ad.id === props.currentAdId);
  }, [props.ads, props.currentAdId]);

  // Map ad data to AdDraft format
  const initialDraft = useMemo<Partial<AdDraft>>(() => {
    if (!currentAd || !currentAd.setup_snapshot) {
      console.log('[EditMode] No ad data available for editing');
      return {};
    }

    const snapshot = currentAd.setup_snapshot;
    console.log('[EditMode] Mapping ad data to draft:', snapshot);

    const draft: Partial<AdDraft> = {};

    // Map product context (if available from metadata)
    // For now, we'll leave it empty as it's used for initial generation
    draft.productContext = undefined;

    // Map creative data
    if (snapshot.creative) {
      draft.creative = {
        images: snapshot.creative.imageVariations || (snapshot.creative.imageUrl ? [snapshot.creative.imageUrl] : []),
        imageUrlSquare: snapshot.creative.imageUrl,
        imageUrlVertical: snapshot.creative.imageUrl,
        selectedFormat: (snapshot.creative.format || 'square') as 'square' | 'vertical',
        headline: snapshot.copy?.headline || '',
        primaryText: snapshot.copy?.primaryText || '',
        description: snapshot.copy?.description || '',
        callToAction: snapshot.copy?.cta || 'Learn More',
      };
    } else if (snapshot.copy) {
      // If we have copy but no creative, still populate copy fields
      draft.creative = {
        images: [],
        headline: snapshot.copy.headline || '',
        primaryText: snapshot.copy.primaryText || '',
        description: snapshot.copy.description || '',
        callToAction: snapshot.copy.cta || 'Learn More',
      };
    }

    // Map targeting data
    if (snapshot.location && snapshot.location.locations) {
      draft.targeting = {
        locations: snapshot.location.locations.map(loc => loc.name),
        // TODO: Add age/gender/interests mapping when available
        ageMin: 18,
        ageMax: 65,
        gender: 'all',
        interests: [],
      };
    }

    // Map budget data
    if (snapshot.budget) {
      draft.budget = {
        amount: snapshot.budget.dailyBudget || 0,
        schedule: snapshot.budget.schedule?.startTime || snapshot.budget.schedule?.endTime 
          ? 'date_range' 
          : 'continuous',
        startDate: snapshot.budget.schedule?.startTime || undefined,
        endDate: snapshot.budget.schedule?.endTime || undefined,
      };
    }

    console.log('[EditMode] Mapped draft:', draft);
    return draft;
  }, [currentAd]);

  // Show loading state if no ad found yet
  if (!currentAd && props.currentAdId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading ad data...</p>
        </div>
      </div>
    );
  }

  // Show error if ad not found
  if (!currentAd) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Ad not found</p>
          <p className="text-sm text-muted-foreground">
            The ad you're trying to edit doesn't exist or has been deleted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full overflow-hidden">
      <AdBuilder
        lovableProjectId={lovableProjectId}
        initialDraft={initialDraft}
        editAdId={props.currentAdId}
        refreshAds={props.refreshAds}
      />
    </div>
  );
}

