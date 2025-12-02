-- Create deliveries table
CREATE TABLE public.deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES public.delivery_drivers(id) ON DELETE SET NULL,
  order_id UUID,
  status TEXT NOT NULL DEFAULT 'pendente',
  valor NUMERIC(10,2),
  distancia_metros INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

-- Drivers can view their own deliveries
CREATE POLICY "Drivers can view their own deliveries"
ON public.deliveries
FOR SELECT
USING (
  driver_id IN (
    SELECT id FROM public.delivery_drivers WHERE user_id = auth.uid()
  )
);

-- Drivers can update their own deliveries
CREATE POLICY "Drivers can update their own deliveries"
ON public.deliveries
FOR UPDATE
USING (
  driver_id IN (
    SELECT id FROM public.delivery_drivers WHERE user_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_deliveries_updated_at
BEFORE UPDATE ON public.deliveries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_deliveries_driver_id ON public.deliveries(driver_id);
CREATE INDEX idx_deliveries_order_id ON public.deliveries(order_id);
CREATE INDEX idx_deliveries_status ON public.deliveries(status);
CREATE INDEX idx_deliveries_created_at ON public.deliveries(created_at DESC);