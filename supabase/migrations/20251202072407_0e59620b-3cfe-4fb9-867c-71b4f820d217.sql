-- Create storage bucket for support images
INSERT INTO storage.buckets (id, name, public)
VALUES ('support-images', 'support-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for support images bucket
CREATE POLICY "Users can view support images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'support-images');

CREATE POLICY "Users can upload their own support images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'support-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own support images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'support-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own support images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'support-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);