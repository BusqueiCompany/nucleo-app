-- Create global_promotions table
CREATE TABLE public.global_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  desconto_percent NUMERIC(5,2),
  inicio TIMESTAMP WITH TIME ZONE,
  fim TIMESTAMP WITH TIME ZONE,
  imagem_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  criado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.global_promotions ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view active promotions
CREATE POLICY "Authenticated users can view promotions"
ON public.global_promotions
FOR SELECT
USING (auth.role() = 'authenticated');

-- Only admins can create promotions
CREATE POLICY "Admins can create promotions"
ON public.global_promotions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Only admins can update promotions
CREATE POLICY "Admins can update promotions"
ON public.global_promotions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Only admins can delete promotions
CREATE POLICY "Admins can delete promotions"
ON public.global_promotions
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create indexes for performance
CREATE INDEX idx_global_promotions_inicio ON public.global_promotions(inicio);
CREATE INDEX idx_global_promotions_fim ON public.global_promotions(fim);
CREATE INDEX idx_global_promotions_created_at ON public.global_promotions(created_at DESC);