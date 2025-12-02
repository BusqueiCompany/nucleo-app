-- Create establishments table
CREATE TABLE public.establishments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL,
  descricao TEXT,
  foto_url TEXT,
  distancia_metros INTEGER,
  tempo_entrega_min INTEGER,
  preco_nivel TEXT,
  funcionamento_abre TIME,
  funcionamento_fecha TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.establishments ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Anyone can view establishments"
ON public.establishments
FOR SELECT
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_establishments_tipo ON public.establishments(tipo);
CREATE INDEX idx_establishments_distancia ON public.establishments(distancia_metros);
CREATE INDEX idx_establishments_created_at ON public.establishments(created_at DESC);