-- Create establishment_partners table
CREATE TABLE public.establishment_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  establishment_id UUID NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
  admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(establishment_id)
);

-- Enable RLS
ALTER TABLE public.establishment_partners ENABLE ROW LEVEL SECURITY;

-- Partners can view their own partnership
CREATE POLICY "Partners can view their own partnership"
ON public.establishment_partners
FOR SELECT
USING (auth.uid() = user_id);

-- Partners can update their own partnership
CREATE POLICY "Partners can update their own partnership"
ON public.establishment_partners
FOR UPDATE
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_establishment_partners_user_id ON public.establishment_partners(user_id);
CREATE INDEX idx_establishment_partners_establishment_id ON public.establishment_partners(establishment_id);