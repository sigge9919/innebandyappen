
CREATE OR REPLACE FUNCTION public.validate_rpe_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.rating < 1 OR NEW.rating > 10 THEN
    RAISE EXCEPTION 'RPE rating must be between 1 and 10';
  END IF;
  RETURN NEW;
END;
$$;
