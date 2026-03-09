
-- Drop the broken trigger on personal_trainings
DROP TRIGGER IF EXISTS validate_personal_training_rpe_trigger ON public.personal_trainings;

-- Create a proper validation function for personal_trainings
CREATE OR REPLACE FUNCTION public.validate_personal_training_rpe()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.rpe_rating < 1 OR NEW.rpe_rating > 10 THEN
    RAISE EXCEPTION 'RPE rating must be between 1 and 10';
  END IF;
  RETURN NEW;
END;
$$;

-- Re-create the trigger with the correct function
CREATE TRIGGER validate_personal_training_rpe_trigger
  BEFORE INSERT OR UPDATE ON public.personal_trainings
  FOR EACH ROW EXECUTE FUNCTION public.validate_personal_training_rpe();
