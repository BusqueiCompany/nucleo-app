-- Create product-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for product images
CREATE POLICY "Partners can upload product images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'parceiro'
  )
);

CREATE POLICY "Partners can update their product images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'product-images'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'parceiro'
  )
);

CREATE POLICY "Partners can delete their product images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'product-images'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'parceiro'
  )
);

CREATE POLICY "Anyone can view product images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');

-- Add policies for partners to manage establishment_products
CREATE POLICY "Partners can view their establishment products"
ON public.establishment_products
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.establishment_partners
    WHERE establishment_id = establishment_products.establishment_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Partners can insert products for their establishment"
ON public.establishment_products
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.establishment_partners
    WHERE establishment_id = establishment_products.establishment_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Partners can update their establishment products"
ON public.establishment_products
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.establishment_partners
    WHERE establishment_id = establishment_products.establishment_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Partners can delete their establishment products"
ON public.establishment_products
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.establishment_partners
    WHERE establishment_id = establishment_products.establishment_id
    AND user_id = auth.uid()
  )
);

-- Allow partners to insert new products in catalog
CREATE POLICY "Partners can create products in catalog"
ON public.products
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'parceiro'
  )
);