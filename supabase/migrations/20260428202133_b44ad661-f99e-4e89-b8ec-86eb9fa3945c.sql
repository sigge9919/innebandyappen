CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.user_dashboard_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  team_id uuid NOT NULL,
  layout jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, team_id)
);

ALTER TABLE public.user_dashboard_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own dashboard preferences"
ON public.user_dashboard_preferences
FOR SELECT TO authenticated
USING (user_id = auth.uid() AND public.is_team_member(team_id));

CREATE POLICY "Users can insert own dashboard preferences"
ON public.user_dashboard_preferences
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() AND public.is_team_member(team_id));

CREATE POLICY "Users can update own dashboard preferences"
ON public.user_dashboard_preferences
FOR UPDATE TO authenticated
USING (user_id = auth.uid() AND public.is_team_member(team_id));

CREATE POLICY "Users can delete own dashboard preferences"
ON public.user_dashboard_preferences
FOR DELETE TO authenticated
USING (user_id = auth.uid());

CREATE TRIGGER update_user_dashboard_preferences_updated_at
BEFORE UPDATE ON public.user_dashboard_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();