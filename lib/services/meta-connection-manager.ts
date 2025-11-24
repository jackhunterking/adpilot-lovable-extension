/**
 * Feature: Meta Connection Manager
 * Purpose: Database-first Meta connection management (campaign-level, shared across ads)
 * References:
 *  - Supabase: https://supabase.com/docs/reference/javascript/select
 *  - AI SDK Core: https://ai-sdk.dev/docs/introduction
 */

import { supabase } from '@/lib/supabase/client'
import type { Json } from '@/lib/supabase/database.types'
import { metaLogger } from '@/lib/meta/logger'

const CONTEXT = 'MetaConnectionManager'

// Connection type for multi-platform support
export type ConnectionType = 'business' | 'facebook_page' | 'instagram'

// Meta connection data structure (stored in campaign_states.meta_connection_data)
export interface MetaConnectionData {
  business?: {
    id: string
    name: string
  }
  page?: {
    id: string
    name: string
    access_token: string
  }
  adAccount?: {
    id: string
    name: string
    currency: string
  }
  instagram?: {
    id: string
    username: string
  }
  tokens: {
    long_lived_user_token?: string
    token_expires_at?: string
    user_app_token?: string
    user_app_token_expires_at?: string
  }
  connection_status: 'connected' | 'disconnected'
  payment_connected: boolean
  admin_connected: boolean
  fb_user_id?: string
  connected_at: string
  updated_at: string
}

export interface MetaConnectionSummary {
  isConnected: boolean
  hasPayment: boolean
  business: { id: string; name: string } | null
  page: { id: string; name: string } | null
  adAccount: { id: string; name: string; currency: string } | null
  instagram: { id: string; username: string } | null
}

/**
 * Get Meta connection data for a campaign from database
 * Reads from campaign_meta_connections and meta_tokens tables
 * @param connectionType - Optional connection type filter (business, facebook_page, instagram)
 */
export async function getCampaignMetaConnection(
  campaignId: string,
  connectionType?: ConnectionType
): Promise<MetaConnectionData | null> {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      metaLogger.error(CONTEXT, 'Failed to get user', authError || new Error('No user'))
      return null
    }

    // Get connection from campaign_meta_connections table
    let query = supabase
      .from('campaign_meta_connections')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('user_id', user.id)
    
    // Filter by connection type if specified
    if (connectionType) {
      query = query.eq('connection_type', connectionType)
    }
    
    const { data: connection, error } = await query.maybeSingle()

    if (error) {
      metaLogger.error(CONTEXT, 'Failed to get connection from database', error)
      return null
    }

    if (!connection) {
      return null
    }

    // Get tokens from meta_tokens table
    const { data: tokens } = await supabase
      .from('meta_tokens')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    // Build MetaConnectionData object
    const connectionData: MetaConnectionData = {
      business: connection.selected_business_id && connection.selected_business_name
        ? {
            id: connection.selected_business_id,
            name: connection.selected_business_name,
          }
        : undefined,
      page: connection.selected_page_id && connection.selected_page_name
        ? {
            id: connection.selected_page_id,
            name: connection.selected_page_name,
            access_token: connection.selected_page_access_token || '',
          }
        : undefined,
      adAccount: connection.selected_ad_account_id && connection.selected_ad_account_name
        ? {
            id: connection.selected_ad_account_id,
            name: connection.selected_ad_account_name,
            currency: connection.ad_account_currency_code || 'USD',
          }
        : undefined,
      instagram: connection.selected_ig_user_id && connection.selected_ig_username
        ? {
            id: connection.selected_ig_user_id,
            username: connection.selected_ig_username,
          }
        : undefined,
      tokens: {
        long_lived_user_token: tokens?.long_lived_user_token || undefined,
        token_expires_at: tokens?.token_expires_at || undefined,
        user_app_token: tokens?.user_app_token || undefined,
        user_app_token_expires_at: tokens?.user_app_token_expires_at || undefined,
      },
      connection_status: (connection.connection_status as 'connected' | 'disconnected') || 'disconnected',
      payment_connected: connection.ad_account_payment_connected || false,
      admin_connected: connection.admin_connected || false,
      fb_user_id: connection.fb_user_id || undefined,
      connected_at: connection.created_at || new Date().toISOString(),
      updated_at: connection.updated_at || new Date().toISOString(),
    }

    metaLogger.info(CONTEXT, '✅ Retrieved Meta connection from database', {
      campaignId,
      hasBusinessId: !!connectionData.business?.id,
      hasAdAccountId: !!connectionData.adAccount?.id,
      hasToken: !!connectionData.tokens.long_lived_user_token,
    })

    return connectionData
  } catch (error) {
    metaLogger.error(CONTEXT, 'Exception getting Meta connection', error as Error)
    return null
  }
}

/**
 * Save Meta connection data for a campaign to database
 * Stores connection data in campaign_meta_connections table and tokens in meta_tokens table
 * @param connectionType - Connection type to save (business, facebook_page, instagram)
 */
export async function saveCampaignMetaConnection(
  campaignId: string,
  connectionData: MetaConnectionData,
  connectionType: ConnectionType = 'business'
): Promise<boolean> {
  try {
    metaLogger.info(CONTEXT, 'Saving Meta connection to database', { campaignId })

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      metaLogger.error(CONTEXT, 'Failed to get user for connection save', authError || new Error('No user'))
      return false
    }

    // Save to campaign_meta_connections table
    const { data, error } = await supabase
      .from('campaign_meta_connections')
      .upsert({
        campaign_id: campaignId,
        user_id: user.id,
        connection_type: connectionType,
        fb_user_id: connectionData.fb_user_id || null,
        selected_business_id: connectionData.business?.id || null,
        selected_business_name: connectionData.business?.name || null,
        selected_page_id: connectionData.page?.id || null,
        selected_page_name: connectionData.page?.name || null,
        selected_page_access_token: connectionData.page?.access_token || null,
        selected_ad_account_id: connectionData.adAccount?.id || null,
        selected_ad_account_name: connectionData.adAccount?.name || null,
        ad_account_currency_code: connectionData.adAccount?.currency || null,
        selected_ig_user_id: connectionData.instagram?.id || null,
        selected_ig_username: connectionData.instagram?.username || null,
        ad_account_payment_connected: connectionData.payment_connected || false,
        admin_connected: connectionData.admin_connected || false,
        connection_status: connectionData.connection_status || 'connected',
        created_at: connectionData.connected_at,
        updated_at: connectionData.updated_at || new Date().toISOString(),
      }, {
        onConflict: 'campaign_id,connection_type'
      })
      .select()
      .single()

    if (error) {
      metaLogger.error(CONTEXT, 'Failed to save connection to database', error)
      return false
    }

    metaLogger.info(CONTEXT, '✅ Successfully saved Meta connection to database', {
      campaignId,
      hasBusinessId: !!connectionData.business?.id,
      hasAdAccountId: !!connectionData.adAccount?.id,
    })

    // Save tokens to meta_tokens table if provided
    if (connectionData.tokens.long_lived_user_token) {
      const { error: tokenError } = await supabase
        .from('meta_tokens')
        .upsert({
          user_id: user.id,
          long_lived_user_token: connectionData.tokens.long_lived_user_token,
          token_expires_at: connectionData.tokens.token_expires_at || null,
          user_app_token: connectionData.tokens.user_app_token || null,
          user_app_token_expires_at: connectionData.tokens.user_app_token_expires_at || null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        })

      if (tokenError) {
        metaLogger.warn(CONTEXT, 'Failed to save tokens (non-critical)', tokenError)
        // Don't fail the whole operation if token save fails
      } else {
        metaLogger.info(CONTEXT, '✅ Tokens saved to meta_tokens table')
      }
    }

    return true
  } catch (error) {
    metaLogger.error(CONTEXT, 'Exception saving Meta connection', error as Error)
    return false
  }
}

/**
 * Update specific fields in Meta connection (partial update)
 * @param connectionType - Connection type to update (defaults to 'business' for backward compatibility)
 */
export async function updateCampaignMetaConnection(
  campaignId: string,
  updates: Partial<MetaConnectionData>,
  connectionType?: ConnectionType
): Promise<boolean> {
  try {
    metaLogger.info(CONTEXT, 'Updating Meta connection in database', { campaignId })

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      metaLogger.error(CONTEXT, 'Failed to get user for connection update', authError || new Error('No user'))
      return false
    }

    // Build update object from partial MetaConnectionData
    const updateObj: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (updates.business !== undefined) {
      updateObj.selected_business_id = updates.business?.id || null
      updateObj.selected_business_name = updates.business?.name || null
    }

    if (updates.page !== undefined) {
      updateObj.selected_page_id = updates.page?.id || null
      updateObj.selected_page_name = updates.page?.name || null
      updateObj.selected_page_access_token = updates.page?.access_token || null
    }

    if (updates.adAccount !== undefined) {
      updateObj.selected_ad_account_id = updates.adAccount?.id || null
      updateObj.selected_ad_account_name = updates.adAccount?.name || null
      updateObj.ad_account_currency_code = updates.adAccount?.currency || null
    }

    if (updates.instagram !== undefined) {
      updateObj.selected_ig_user_id = updates.instagram?.id || null
      updateObj.selected_ig_username = updates.instagram?.username || null
    }

    if (updates.payment_connected !== undefined) {
      updateObj.ad_account_payment_connected = updates.payment_connected
    }

    if (updates.admin_connected !== undefined) {
      updateObj.admin_connected = updates.admin_connected
    }

    if (updates.connection_status !== undefined) {
      updateObj.connection_status = updates.connection_status
    }

    if (updates.fb_user_id !== undefined) {
      updateObj.fb_user_id = updates.fb_user_id
    }

    // Update campaign_meta_connections table
    let updateQuery = supabase
      .from('campaign_meta_connections')
      .update(updateObj)
      .eq('campaign_id', campaignId)
      .eq('user_id', user.id)
    
    // Filter by connection type if specified
    if (connectionType) {
      updateQuery = updateQuery.eq('connection_type', connectionType)
    }
    
    const { error } = await updateQuery

    if (error) {
      metaLogger.error(CONTEXT, 'Failed to update connection in database', error)
      return false
    }

    metaLogger.info(CONTEXT, '✅ Successfully updated Meta connection in database', { campaignId })

    // Update tokens if provided
    if (updates.tokens) {
      const tokenUpdateObj: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      }

      if (updates.tokens.long_lived_user_token !== undefined) {
        tokenUpdateObj.long_lived_user_token = updates.tokens.long_lived_user_token
      }
      if (updates.tokens.token_expires_at !== undefined) {
        tokenUpdateObj.token_expires_at = updates.tokens.token_expires_at
      }
      if (updates.tokens.user_app_token !== undefined) {
        tokenUpdateObj.user_app_token = updates.tokens.user_app_token
      }
      if (updates.tokens.user_app_token_expires_at !== undefined) {
        tokenUpdateObj.user_app_token_expires_at = updates.tokens.user_app_token_expires_at
      }

      const { error: tokenError } = await supabase
        .from('meta_tokens')
        .update(tokenUpdateObj)
        .eq('user_id', user.id)

      if (tokenError) {
        metaLogger.warn(CONTEXT, 'Failed to update tokens (non-critical)', tokenError)
      }
    }

    return true
  } catch (error) {
    metaLogger.error(CONTEXT, 'Exception updating Meta connection', error as Error)
    return false
  }
}

/**
 * Mark payment as connected for a campaign
 */
export async function markCampaignPaymentConnected(campaignId: string): Promise<boolean> {
  return await updateCampaignMetaConnection(campaignId, {
    payment_connected: true,
  } as Partial<MetaConnectionData>)
}

/**
 * Get Meta connection summary (simplified view)
 */
export async function getMetaConnectionSummary(
  campaignId: string
): Promise<MetaConnectionSummary> {
  const connection = await getCampaignMetaConnection(campaignId)

  if (!connection) {
    return {
      isConnected: false,
      hasPayment: false,
      business: null,
      page: null,
      adAccount: null,
      instagram: null,
    }
  }

  return {
    isConnected: connection.connection_status === 'connected',
    hasPayment: connection.payment_connected,
    business: connection.business || null,
    page: connection.page
      ? {
          id: connection.page.id,
          name: connection.page.name,
        }
      : null,
    adAccount: connection.adAccount || null,
    instagram: connection.instagram || null,
  }
}

/**
 * Get Meta access token for API calls
 */
export async function getMetaAccessToken(campaignId: string): Promise<string | null> {
  const connection = await getCampaignMetaConnection(campaignId)

  if (!connection) {
    return null
  }

  // Prefer user_app_token, fallback to long_lived_user_token
  return connection.tokens.user_app_token || connection.tokens.long_lived_user_token || null
}

/**
 * Get all three Meta connections for a campaign (business, page, instagram)
 * Returns an object with connection data for each type
 */
export async function getCampaignMetaConnections(
  campaignId: string
): Promise<{
  business: MetaConnectionData | null
  page: MetaConnectionData | null
  instagram: MetaConnectionData | null
}> {
  try {
    const [business, page, instagram] = await Promise.all([
      getCampaignMetaConnection(campaignId, 'business'),
      getCampaignMetaConnection(campaignId, 'facebook_page'),
      getCampaignMetaConnection(campaignId, 'instagram'),
    ])

    return { business, page, instagram }
  } catch (error) {
    metaLogger.error(CONTEXT, 'Exception getting all Meta connections', error as Error)
    return { business: null, page: null, instagram: null }
  }
}

/**
 * Check if Meta connection exists and is valid
 */
export async function isMetaConnected(campaignId: string): Promise<boolean> {
  const connection = await getCampaignMetaConnection(campaignId)
  
  return (
    !!connection &&
    connection.connection_status === 'connected' &&
    !!connection.business?.id &&
    !!connection.adAccount?.id &&
    (!!connection.tokens.long_lived_user_token || !!connection.tokens.user_app_token)
  )
}

/**
 * Disconnect Meta (soft delete - marks as disconnected)
 * @param connectionType - Optional connection type to disconnect (if not specified, disconnects all)
 */
export async function disconnectMeta(
  campaignId: string,
  connectionType?: ConnectionType
): Promise<boolean> {
  return await updateCampaignMetaConnection(
    campaignId,
    { connection_status: 'disconnected' } as Partial<MetaConnectionData>,
    connectionType
  )
}

/**
 * Clear Meta connection data (hard delete)
 * @param connectionType - Optional connection type to delete (if not specified, deletes all)
 */
export async function clearMetaConnection(
  campaignId: string,
  connectionType?: ConnectionType
): Promise<boolean> {
  try {
    metaLogger.info(CONTEXT, 'Clearing Meta connection from database', { 
      campaignId,
      connectionType: connectionType || 'all'
    })

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      metaLogger.error(CONTEXT, 'Failed to get user for connection delete', authError || new Error('No user'))
      return false
    }

    // Delete from campaign_meta_connections table
    let deleteQuery = supabase
      .from('campaign_meta_connections')
      .delete()
      .eq('campaign_id', campaignId)
      .eq('user_id', user.id)
    
    // Filter by connection type if specified
    if (connectionType) {
      deleteQuery = deleteQuery.eq('connection_type', connectionType)
    }
    
    const { error } = await deleteQuery

    if (error) {
      metaLogger.error(CONTEXT, 'Failed to delete connection from database', error)
      return false
    }

    metaLogger.info(CONTEXT, '✅ Successfully cleared Meta connection from database', { 
      campaignId,
      connectionType: connectionType || 'all'
    })
    return true
  } catch (error) {
    metaLogger.error(CONTEXT, 'Exception clearing Meta connection', error as Error)
    return false
  }
}

