-- Create markets table
CREATE TABLE public.markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  distancia_metros INTEGER,
  tempo_entrega_min INTEGER,
  foto_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  categoria TEXT,
  unidade TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create market_products table (prices per market)
CREATE TABLE public.market_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id UUID REFERENCES public.markets(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  preco NUMERIC(10,2) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(market_id, product_id)
);

-- Enable RLS on all tables
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_products ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (anyone can view markets and products)
CREATE POLICY "Anyone can view markets" 
ON public.markets 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view products" 
ON public.products 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view market products" 
ON public.market_products 
FOR SELECT 
USING (true);

-- Create indexes for better query performance
CREATE INDEX idx_market_products_market_id ON public.market_products(market_id);
CREATE INDEX idx_market_products_product_id ON public.market_products(product_id);
CREATE INDEX idx_products_categoria ON public.products(categoria);