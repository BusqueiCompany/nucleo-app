-- Create VIP subscriptions table
CREATE TABLE public.vip_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plano TEXT NOT NULL CHECK (plano IN ('mensal', 'trimestral', 'anual')),
  ativo BOOLEAN DEFAULT true,
  data_inicio TIMESTAMP WITH TIME ZONE DEFAULT now(),
  data_fim TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.vip_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own subscription
CREATE POLICY "Users can view their own subscription"
ON public.vip_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own subscription (for initial signup)
CREATE POLICY "Users can insert their own subscription"
ON public.vip_subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own subscription (for renewals/cancellations)
CREATE POLICY "Users can update their own subscription"
ON public.vip_subscriptions
FOR UPDATE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_vip_subscriptions_user_id ON public.vip_subscriptions(user_id);
CREATE INDEX idx_vip_subscriptions_ativo ON public.vip_subscriptions(ativo);

-- Create function to check if user has active VIP subscription
CREATE OR REPLACE FUNCTION public.is_vip_active(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.vip_subscriptions
    WHERE user_id = user_uuid
      AND ativo = true
      AND (data_fim IS NULL OR data_fim > now())
  );
$$;

-- Create function to get user VIP status
CREATE OR REPLACE FUNCTION public.get_vip_status(user_uuid UUID)
RETURNS TABLE (
  is_active BOOLEAN,
  plano TEXT,
  data_fim TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ativo AND (data_fim IS NULL OR data_fim > now()) as is_active,
    plano,
    data_fim
  FROM public.vip_subscriptions
  WHERE user_id = user_uuid
  LIMIT 1;
$$;