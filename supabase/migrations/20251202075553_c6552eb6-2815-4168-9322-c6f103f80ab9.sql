-- Create order_items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantidade INTEGER NOT NULL,
  preco_unit NUMERIC(10,2) NOT NULL
);

-- Enable RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Policies for users to view their own order items
CREATE POLICY "Users can view their own order items"
ON public.order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.orders
    WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
  )
);

-- Policies for users to insert their own order items
CREATE POLICY "Users can insert their own order items"
ON public.order_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.orders
    WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
  )
);

-- Policies for admins to view all order items
CREATE POLICY "Admins can view all order items"
ON public.order_items
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Policies for admins to manage all order items
CREATE POLICY "Admins can manage all order items"
ON public.order_items
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Policies for partners to view order items for their establishments
CREATE POLICY "Partners can view their establishment order items"
ON public.order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.orders
    JOIN public.establishment_partners ON establishment_partners.establishment_id = orders.establishment_id
    WHERE orders.id = order_items.order_id
      AND establishment_partners.user_id = auth.uid()
  )
);

-- Indexes for performance
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);