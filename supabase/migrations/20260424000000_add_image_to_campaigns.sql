-- Migration: Add image_url to notification_campaigns
ALTER TABLE public.notification_campaigns 
ADD COLUMN IF NOT EXISTS image_url TEXT;

COMMENT ON COLUMN public.notification_campaigns.image_url IS 'URL de l''image riche affichée dans la notification push et les détails.';
