-- Create driver-photos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('driver-photos', 'driver-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for driver photos
CREATE POLICY "Drivers can upload their photos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'driver-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Drivers can update their photos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'driver-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Drivers can delete their photos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'driver-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view driver photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'driver-photos');

-- Policy for drivers to accept deliveries
CREATE POLICY "Drivers can accept pending deliveries"
ON public.deliveries
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'entregador'
  )
);