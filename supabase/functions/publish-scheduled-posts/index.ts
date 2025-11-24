/**
 * Supabase Edge Function: Publish Scheduled Posts
 * Runs every minute via cron to publish posts scheduled for the current time
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    console.log('[Scheduled Posts] Starting scheduled post processing...');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Find posts ready to publish
    const now = new Date().toISOString();
    const { data: posts, error: queryError } = await supabase
      .from('social_posts')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_at', now);

    if (queryError) {
      console.error('[Scheduled Posts] Query error:', queryError);
      return new Response(
        JSON.stringify({ error: queryError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!posts || posts.length === 0) {
      console.log('[Scheduled Posts] No posts to publish');
      return new Response(
        JSON.stringify({ processed: 0, message: 'No posts to publish' }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Scheduled Posts] Found ${posts.length} posts to publish`);

    const results = [];

    // Process each post
    for (const post of posts) {
      console.log(`[Scheduled Posts] Processing post: ${post.id}`);

      try {
        // Call our publish endpoint
        const publishResponse = await fetch(
          `${Deno.env.get('APP_URL')}/api/v1/posts/${post.id}/publish`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            },
          }
        );

        if (!publishResponse.ok) {
          const errorText = await publishResponse.text();
          throw new Error(`Publish API error: ${publishResponse.status} ${errorText}`);
        }

        const publishResult = await publishResponse.json();

        console.log(`[Scheduled Posts] ✅ Published post: ${post.id}`, publishResult);
        results.push({
          postId: post.id,
          success: true,
          result: publishResult,
        });

      } catch (error) {
        console.error(`[Scheduled Posts] ❌ Failed to publish post ${post.id}:`, error);

        // Mark as failed in database
        await supabase
          .from('social_posts')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', post.id);

        results.push({
          postId: post.id,
          success: false,
          error: error.message,
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log(`[Scheduled Posts] Completed: ${successCount} successful, ${failureCount} failed`);

    return new Response(
      JSON.stringify({
        processed: posts.length,
        successful: successCount,
        failed: failureCount,
        results,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Scheduled Posts] Critical error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

