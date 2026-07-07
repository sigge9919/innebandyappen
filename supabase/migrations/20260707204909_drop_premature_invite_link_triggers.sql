-- handle_new_user_invite / handle_player_invite fire AFTER INSERT ON auth.users — the instant a
-- sign-up form is submitted, before the person has confirmed they own that email address. If a
-- coach invites someone@example.com and email confirmation is ever off for this project, anyone
-- could sign up with that address and be instantly linked to the team/player row, no inbox
-- access required.
--
-- public.claim_pending_invites() does the same invite-claiming, but scoped to auth.uid() of the
-- calling session — it can only ever link the currently authenticated user's own identity, and
-- the client already calls it on every load (TeamContext.refreshTeams). Dropping the insert-time
-- triggers removes the unconfirmed-account window entirely; invite claiming still works exactly
-- as before, just gated on having a real session instead of a raw signup.

DROP TRIGGER IF EXISTS on_auth_user_created_invite ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_player ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_link_invite ON auth.users;
