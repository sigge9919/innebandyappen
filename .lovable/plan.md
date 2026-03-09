

## Root Cause

Every RLS policy on `personal_trainings` and `player_rpe_ratings` is **RESTRICTIVE** (`Permissive: No`). With restrictive policies, **ALL** policies for a given command must pass. A player trying to INSERT must satisfy both:
1. "Players can insert own..." — passes
2. "Coaches can manage..." (ALL command includes INSERT) — **fails** because the player is not a head coach

This blocks every player write operation. The previous migration attempted to fix this but created the policies as RESTRICTIVE again.

## Plan

**Single database migration** to:

1. Drop all existing policies on `personal_trainings` and `player_rpe_ratings`
2. Recreate them as **PERMISSIVE** (explicitly using `AS PERMISSIVE`) so that only ONE policy needs to pass:
   - `Team members can view` (SELECT) — PERMISSIVE
   - `Players can insert/update/delete own` — PERMISSIVE  
   - `Coaches can manage` (ALL) — PERMISSIVE

The key difference from previous attempts: explicitly adding `AS PERMISSIVE` to each `CREATE POLICY` statement to ensure they are not created as restrictive.

No frontend code changes needed — the hooks and portal code are correct.

