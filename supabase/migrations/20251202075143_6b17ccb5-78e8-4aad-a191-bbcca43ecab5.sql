-- Create priority_routes table
CREATE TABLE public.priority_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id UUID REFERENCES public.establishments(id) ON DELETE CASCADE,
  produto TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ativo BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.priority_routes ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view active priority routes
CREATE POLICY "Authenticated users can view active priority routes"
ON public.priority_routes
FOR SELECT
USING (auth.role() = 'authenticated' AND ativo = true);

-- Partners can manage their establishment's priority routes
CREATE POLICY "Partners can create priority routes for their establishment"
ON public.priority_routes
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.establishment_partners
    WHERE establishment_id = priority_routes.establishment_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Partners can update their establishment's priority routes"
ON public.priority_routes
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.establishment_partners
    WHERE establishment_id = priority_routes.establishment_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Partners can delete their establishment's priority routes"
ON public.priority_routes
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.establishment_partners
    WHERE establishment_id = priority_routes.establishment_id
    AND user_id = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX idx_priority_routes_establishment_id ON public.priority_routes(establishment_id);
CREATE INDEX idx_priority_routes_ativo ON public.priority_routes(ativo);
CREATE INDEX idx_priority_routes_created_at ON public.priority_routes(created_at DESC);