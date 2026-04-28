---
name: Customizable Dashboard
description: Per-user, per-team dashboard layout with show/hide and ordering, role-based defaults
type: feature
---
Dashboard cards on Översikt are user-customizable. Each (user, team) combination stores its own layout in `user_dashboard_preferences` (jsonb `layout` array of `{id, visible}`). Defaults vary by role (head_coach/assistant_coach/stats_coach get coach default; player gets RPE-first; viewer gets games-first). Defaults are returned in-memory until the user explicitly saves via the "Anpassa" sheet — this lets future default changes reach un-customized users. Card ids: stats, next-training, next-game, weekly-focus, team-rpe, last-game, rpe-alerts, player-alerts. Stats card spans full width.
