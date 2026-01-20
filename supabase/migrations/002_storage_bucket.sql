-- Create storage bucket for visual images
-- Run this in Supabase SQL Editor or Dashboard

-- Note: Storage buckets are typically created via the Dashboard or API
-- This SQL shows the policy setup once the bucket exists

-- If using Supabase Dashboard:
-- 1. Go to Storage
-- 2. Create a new bucket called "visuals"
-- 3. Set it to "Public bucket" for read access

-- Storage policies for the 'visuals' bucket
-- These allow public read access and authenticated/anon insert

-- Allow public read access to all files in the visuals bucket
CREATE POLICY "Public read access for visuals"
ON storage.objects FOR SELECT
USING (bucket_id = 'visuals');

-- Allow insert access (for the API to upload)
CREATE POLICY "Allow uploads to visuals"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'visuals');

-- Allow update access (for upsert functionality)
CREATE POLICY "Allow updates to visuals"
ON storage.objects FOR UPDATE
USING (bucket_id = 'visuals');
