/**
 * Feature: Lovable Campaign Manager Service
 * Purpose: Auto-create and manage campaigns for Lovable projects
 * References:
 *  - Migration: supabase/migrations/20251123000000_link_campaigns_to_projects.sql
 *  - DB Function: get_or_create_campaign_for_project
 *  - Plan: campaign.plan.md
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';

export interface CampaignForProject {
  campaign_id: string;
  campaign_name: string;
  was_created: boolean;
}

export interface GetOrCreateCampaignOptions {
  userId: string;
  lovableProjectId: string;
  campaignName?: string;
}

/**
 * Service for managing campaigns linked to Lovable projects
 */
export class LovableCampaignManager {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Get existing campaign for Lovable project or create new one
   * 
   * Business rule: One campaign per Lovable project
   * 
   * @param options - User ID, project ID, and optional campaign name
   * @returns Campaign details and whether it was newly created
   * @throws Error if user hasn't linked the project
   */
  async getOrCreateCampaign(
    options: GetOrCreateCampaignOptions
  ): Promise<CampaignForProject> {
    const { userId, lovableProjectId, campaignName } = options;

    console.log('[LovableCampaignManager] Getting/creating campaign for project:', {
      lovableProjectId,
      userId,
      campaignName: campaignName || '(auto-generated)',
    });

    // Verify user has linked this project
    const { data: projectLink, error: linkError } = await this.supabase
      .from('lovable_project_links')
      .select('id, status')
      .eq('lovable_project_id', lovableProjectId)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (linkError || !projectLink) {
      console.error('[LovableCampaignManager] User has not linked this project:', {
        lovableProjectId,
        userId,
        error: linkError,
      });
      throw new Error('User has not linked this Lovable project. Please link the project first.');
    }

    console.log('[LovableCampaignManager] ✅ Project link verified:', projectLink.id);

    // Use database function to get or create campaign
    // This handles race conditions and enforces the one-campaign-per-project rule
    const { data, error } = await this.supabase.rpc('get_or_create_campaign_for_project', {
      p_user_id: userId,
      p_lovable_project_id: lovableProjectId,
      p_campaign_name: campaignName || null,
    });

    if (error) {
      console.error('[LovableCampaignManager] Error getting/creating campaign:', error);
      throw new Error(`Failed to get or create campaign: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.error('[LovableCampaignManager] No campaign returned from database');
      throw new Error('Failed to get or create campaign: No data returned');
    }

    const result = data[0] as CampaignForProject;

    console.log('[LovableCampaignManager] ✅ Campaign ready:', {
      campaignId: result.campaign_id,
      campaignName: result.campaign_name,
      wasCreated: result.was_created,
    });

    return result;
  }

  /**
   * Get existing campaign for Lovable project (without creating)
   * 
   * @param lovableProjectId - Lovable project ID
   * @param userId - User ID for verification
   * @returns Campaign or null if not found
   */
  async getCampaignForProject(
    lovableProjectId: string,
    userId: string
  ): Promise<Database['public']['Tables']['campaigns']['Row'] | null> {
    console.log('[LovableCampaignManager] Getting campaign for project:', lovableProjectId);

    const { data: campaign, error } = await this.supabase
      .from('campaigns')
      .select('*')
      .eq('lovable_project_id', lovableProjectId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - campaign doesn't exist yet
        console.log('[LovableCampaignManager] No campaign found for project');
        return null;
      }
      console.error('[LovableCampaignManager] Error getting campaign:', error);
      throw new Error(`Failed to get campaign: ${error.message}`);
    }

    console.log('[LovableCampaignManager] ✅ Found campaign:', campaign.id);
    return campaign;
  }

  /**
   * Check if user has linked a Lovable project
   * 
   * @param lovableProjectId - Lovable project ID
   * @param userId - User ID
   * @returns True if project is linked and active
   */
  async isProjectLinked(lovableProjectId: string, userId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('lovable_project_links')
      .select('id')
      .eq('lovable_project_id', lovableProjectId)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[LovableCampaignManager] Error checking project link:', error);
      return false;
    }

    return !!data;
  }

  /**
   * Link a Lovable project to user's account
   * 
   * @param lovableProjectId - Lovable project ID
   * @param userId - User ID
   * @param supabaseUrl - Optional Supabase URL for the project
   * @returns Project link record
   */
  async linkProject(
    lovableProjectId: string,
    userId: string,
    supabaseUrl?: string
  ): Promise<Database['public']['Tables']['lovable_project_links']['Row']> {
    console.log('[LovableCampaignManager] Linking project:', { lovableProjectId, userId });

    const { data, error } = await this.supabase
      .from('lovable_project_links')
      .insert({
        user_id: userId,
        lovable_project_id: lovableProjectId,
        supabase_url: supabaseUrl || null,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      // Check for unique constraint violation (already linked)
      if (error.code === '23505') {
        console.log('[LovableCampaignManager] Project already linked, fetching existing link');
        const { data: existing, error: fetchError } = await this.supabase
          .from('lovable_project_links')
          .select('*')
          .eq('lovable_project_id', lovableProjectId)
          .eq('user_id', userId)
          .single();

        if (fetchError) {
          throw new Error(`Project already linked but failed to fetch: ${fetchError.message}`);
        }

        return existing;
      }

      console.error('[LovableCampaignManager] Error linking project:', error);
      throw new Error(`Failed to link project: ${error.message}`);
    }

    console.log('[LovableCampaignManager] ✅ Project linked:', data.id);
    return data;
  }
}

/**
 * Create a campaign manager instance with Supabase client
 */
export function createCampaignManager(
  supabase: SupabaseClient<Database>
): LovableCampaignManager {
  return new LovableCampaignManager(supabase);
}

