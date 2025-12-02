-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  establishment_id UUID NOT NULL REFERENCES public.establishments(id),
  status TEXT NOT NULL DEFAULT 'pendente',
  valor_total NUMERIC(10,2),
  endereco_entrega TEXT NOT NULL,
  metodo_pagamento TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policies for users to view their own orders
CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
USING (auth.uid() = user_id);

-- Policies for users to create their own orders
CREATE POLICY "Users can create their own orders"
ON public.orders
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policies for users to update their own orders (limited)
CREATE POLICY "Users can update their own orders"
ON public.orders
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policies for admins to view all orders
CREATE POLICY "Admins can view all orders"
ON public.orders
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Policies for admins to update all orders
CREATE POLICY "Admins can update all orders"
ON public.orders
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Policies for partners to view orders for their establishments
CREATE POLICY "Partners can view their establishment orders"
ON public.orders
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.establishment_partners
    WHERE establishment_partners.establishment_id = orders.establishment_id
      AND establishment_partners.user_id = auth.uid()
  )
);

-- Policies for partners to update orders for their establishments
CREATE POLICY "Partners can update their establishment orders"
ON public.orders
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.establishment_partners
    WHERE establishment_partners.establishment_id = orders.establishment_id
      AND establishment_partners.user_id = auth.uid()
  )
);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_establishment_id ON public.orders(establishment_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);