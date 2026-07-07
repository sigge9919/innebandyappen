-- Players can't currently log their own personal training. usePersonalTrainings()
-- (src/hooks/useLocalStorage.ts) stores these as training_sessions rows with
-- is_personal = true and created_by_player_id set to the player's own row, but the only
-- write policy on training_sessions is "Coaches hanterar träningspass" (is_coach(team_id)
-- gated) — a player has no path to insert or delete their own personal-training rows, so
-- the "Lägg till pass" feature in PlayerPortal.tsx fails silently for them today.
--
-- Mirrors the existing "Spelare lägger till RPE" pattern on player_rpe_ratings: scoped to
-- rows the caller owns via their own players row, and only for is_personal = true rows —
-- a player still can't touch a real (non-personal) team training session.

CREATE POLICY "Spelare loggar personlig träning" ON public.training_sessions
  FOR INSERT TO authenticated
  WITH CHECK (
    is_personal = true
    AND created_by_player_id IN (
      SELECT id FROM public.players
      WHERE user_id = auth.uid() AND team_id = training_sessions.team_id
    )
  );

CREATE POLICY "Spelare tar bort egen personlig träning" ON public.training_sessions
  FOR DELETE TO authenticated
  USING (
    is_personal = true
    AND created_by_player_id IN (
      SELECT id FROM public.players WHERE user_id = auth.uid()
    )
  );
