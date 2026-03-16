
-- Update validation triggers for new 1-5 scale
CREATE OR REPLACE FUNCTION public.validate_rpe_rating()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.rating < 1 OR NEW.rating > 5 THEN
    RAISE EXCEPTION 'RPE rating must be between 1 and 5';
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_personal_training_rpe()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.rpe_rating < 1 OR NEW.rpe_rating > 5 THEN
    RAISE EXCEPTION 'RPE rating must be between 1 and 5';
  END IF;
  RETURN NEW;
END;
$function$;

-- Update default values
ALTER TABLE public.player_rpe_ratings ALTER COLUMN rating SET DEFAULT 3;
ALTER TABLE public.personal_trainings ALTER COLUMN rpe_rating SET DEFAULT 3;
