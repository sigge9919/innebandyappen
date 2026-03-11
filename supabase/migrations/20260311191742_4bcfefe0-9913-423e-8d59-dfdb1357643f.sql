ALTER TABLE public.drills 
  ADD COLUMN direct_video_url text,
  ADD COLUMN thumbnail_url text,
  ADD COLUMN media_fetched boolean NOT NULL DEFAULT false;