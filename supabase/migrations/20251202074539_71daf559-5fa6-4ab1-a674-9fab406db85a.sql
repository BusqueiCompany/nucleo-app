-- Create delivery_drivers table
CREATE TABLE public.delivery_drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  veiculo TEXT NOT NULL,
  placa TEXT,
  foto_url TEXT,
  status_online BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.delivery_drivers ENABLE ROW LEVEL SECURITY;

-- Drivers can view their own profile
CREATE POLICY "Drivers can view their own profile"
ON public.delivery_drivers
FOR SELECT
USING (auth.uid() = user_id);

-- Drivers can update their own profile
CREATE POLICY "Drivers can update their own profile"
ON public.delivery_drivers
FOR UPDATE
USING (auth.uid() = user_id);

-- Drivers can insert their own profile
CREATE POLICY "Drivers can insert their own profile"
ON public.delivery_drivers
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_delivery_drivers_user_id ON public.delivery_drivers(user_id);
CREATE INDEX idx_delivery_drivers_status_online ON public.delivery_drivers(status_online);