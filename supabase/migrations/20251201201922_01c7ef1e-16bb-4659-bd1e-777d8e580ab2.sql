-- Fix search_path for calculate_age function
CREATE OR REPLACE FUNCTION public.calculate_age(birth_date DATE)
RETURNS INTEGER
LANGUAGE SQL
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXTRACT(YEAR FROM AGE(birth_date))::INTEGER;
$$;

-- Fix search_path for update_idade_calculada function
CREATE OR REPLACE FUNCTION public.update_idade_calculada()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.idade_calculada := public.calculate_age(NEW.data_nascimento);
  RETURN NEW;
END;
$$;