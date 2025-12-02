-- Create global_notifications table
CREATE TABLE public.global_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  tipo TEXT DEFAULT 'info',
  imagem_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  enviado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.global_notifications ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view notifications
CREATE POLICY "Authenticated users can view notifications"
ON public.global_notifications
FOR SELECT
USING (auth.role() = 'authenticated');

-- Only admins can insert notifications
CREATE POLICY "Admins can create notifications"
ON public.global_notifications
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Only admins can update notifications
CREATE POLICY "Admins can update notifications"
ON public.global_notifications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Only admins can delete notifications
CREATE POLICY "Admins can delete notifications"
ON public.global_notifications
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create indexes for performance
CREATE INDEX idx_global_notifications_tipo ON public.global_notifications(tipo);
CREATE INDEX idx_global_notifications_created_at ON public.global_notifications(created_at DESC);