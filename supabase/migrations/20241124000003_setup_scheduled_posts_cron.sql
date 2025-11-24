-- Setup cron job for publishing scheduled posts
-- This cron job runs every minute to check for and publish scheduled posts

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the cron job to run every minute
-- This will call the publish-scheduled-posts Edge Function
SELECT cron.schedule(
  'publish-scheduled-posts',        -- Job name
  '* * * * *',                       -- Cron expression: every minute
  $$
  SELECT
    net.http_post(
      url := 'https://skgndmwetbcboglmhvbw.supabase.co/functions/v1/publish-scheduled-posts',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      )
    ) AS request_id;
  $$
);

COMMENT ON EXTENSION pg_cron IS 'Cron-based job scheduler for PostgreSQL';

