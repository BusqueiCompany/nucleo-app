-- Create user_details table to store additional user information
CREATE TABLE public.user_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  data_nascimento DATE NOT NULL,
  idade_calculada INTEGER,
  cpf TEXT,
  cep TEXT NOT NULL,
  rua TEXT NOT NULL,
  bairro TEXT NOT NULL,
  numero TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT NOT NULL,
  aceita_campanhas BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_details ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own details"
  ON public.user_details
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own details"
  ON public.user_details
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own details"
  ON public.user_details
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to calculate age
CREATE OR REPLACE FUNCTION public.calculate_age(birth_date DATE)
RETURNS INTEGER
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT EXTRACT(YEAR FROM AGE(birth_date))::INTEGER;
$$;

-- Create trigger to automatically calculate age
CREATE OR REPLACE FUNCTION public.update_idade_calculada()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.idade_calculada := public.calculate_age(NEW.data_nascimento);
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_idade_calculada
  BEFORE INSERT OR UPDATE OF data_nascimento
  ON public.user_details
  FOR EACH ROW
  EXECUTE FUNCTION public.update_idade_calculada();