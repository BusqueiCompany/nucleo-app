-- Create function to update updated_at timestamp if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create support tickets table
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  categoria TEXT NOT NULL CHECK (categoria IN ('pedido', 'pagamento', 'entrega', 'produto', 'conta', 'outro')),
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto', 'em_andamento', 'resolvido', 'fechado')),
  prioridade TEXT DEFAULT 'normal' CHECK (prioridade IN ('baixa', 'normal', 'alta', 'urgente')),
  imagem_url TEXT,
  resposta TEXT,
  respondido_por UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own tickets
CREATE POLICY "Users can view their own tickets"
ON public.support_tickets
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can create their own tickets
CREATE POLICY "Users can create their own tickets"
ON public.support_tickets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own tickets (but not response fields)
CREATE POLICY "Users can update their own tickets"
ON public.support_tickets
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id 
  AND resposta IS NULL 
  AND respondido_por IS NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_tickets_created_at ON public.support_tickets(created_at DESC);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_support_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get ticket stats for user
CREATE OR REPLACE FUNCTION public.get_user_ticket_stats(user_uuid UUID)
RETURNS TABLE (
  total_tickets BIGINT,
  abertos BIGINT,
  em_andamento BIGINT,
  resolvidos BIGINT
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COUNT(*) as total_tickets,
    COUNT(*) FILTER (WHERE status = 'aberto') as abertos,
    COUNT(*) FILTER (WHERE status = 'em_andamento') as em_andamento,
    COUNT(*) FILTER (WHERE status = 'resolvido' OR status = 'fechado') as resolvidos
  FROM public.support_tickets
  WHERE user_id = user_uuid;
$$;