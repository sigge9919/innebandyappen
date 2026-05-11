## Problem

Taktiklayouterna (spelarpositioner, ritningar, keyframes, skuggzoner) sparas idag i webbläsarens `localStorage` under nyckeln `tactics-layouts`. Det betyder:

- Layouter syns bara på den enhet/webbläsare där de skapades.
- Andra tränare och spelare i laget kan inte se eller använda dem.
- De försvinner om man rensar cachen, byter dator eller använder ett annat konto.
- Kopplingen från träningsövningar (`drills.linked_layout_ids`) och spelmoment (`plays.linked_layout_ids`) pekar på lokala id:n som inte finns hos någon annan användare.

Det här ska bytas så att taktiklayouter, precis som allt annat lagdata, sparas i Lovable Cloud kopplat till `team_id`.

## Lösning

### 1. Ny tabell `tactics_layouts` i Lovable Cloud

Kolumner (utöver standard `id`, `created_at`, `updated_at`):
- `team_id` — vilket lag layouten tillhör
- `name` — namnet tränaren ger
- `players` (jsonb) — spelarmarkörer
- `drawing_data` (text) — sparad ritning (data URL)
- `keyframes` (jsonb) — animationsnycklar
- `zones` (jsonb) — skuggzoner
- `home_player_count`, `opponent_player_count` (int)
- `is_animation` (bool)
- `canvas_width`, `canvas_height` (int) — för proportionell skalning vid laddning på annan skärm
- `created_by` — vilken användare som skapade

RLS-policys i linje med övriga lagtabeller:
- Alla lagmedlemmar kan läsa.
- Lagmedlemmar kan skapa/ändra/ta bort layouter för sitt lag (samma mönster som `drills` och `plays`).

### 2. Ny hook `useTacticsLayouts(teamId)`

Centraliserar all hämtning, sparning, uppdatering och borttagning mot Cloud, så att `TacticsBoardCanvas`, `TacticsBoardPreview`, `TacticsBoardFullscreen` och `TacticsLayoutSelector` alla läser från samma källa.

### 3. Komponenter som ska skrivas om från localStorage → hook

- `src/components/tactics/TacticsBoardCanvas.tsx` — `getSavedLayouts`, `saveLayoutToStorage`, `handleSaveLayout`, `handleLoadLayout`, ladda lista i `useEffect`.
- `src/components/playbook/TacticsLayoutSelector.tsx` — lista layouter för aktivt lag.
- `src/components/playbook/TacticsBoardPreview.tsx` — slå upp layout via id.
- `src/components/playbook/TacticsBoardFullscreen.tsx` — slå upp layout via id.

Den `STORAGE_KEY`-konstanten och hjälparna i `TacticsBoardCanvas` tas bort.

### 4. Engångsmigrering av befintliga lokala layouter (valfritt men rekommenderat)

För att inte tappa redan ritade layouter: när `TacticsBoardCanvas` mountas och hittar layouter i `localStorage`, men användaren inte har några i Cloud för sitt aktiva lag, visa en toast "Importera lokala taktiklayouter till laget?" och flytta över dem vid bekräftelse. När de är överförda rensas `localStorage`-nyckeln.

Detta är frivilligt — säg till om du hellre vill att gamla lokala layouter bara försvinner.

### 5. Kopplingar (`linked_layout_ids`)

`drills.linked_layout_ids` och `plays.linked_layout_ids` är redan textarrayer och fungerar oförändrat — de kommer bara att innehålla de nya Cloud-id:na framåt. Eventuella gamla id:n från `localStorage` blir döda referenser; migreringssteget ovan löser detta om man vill behålla dem.

## Vad detta INTE ändrar

- Designen och funktionen av själva taktiktavlan är identisk.
- Den proportionella skalningen vid rotation (förra ändringen) påverkas inte — `canvas_width`/`canvas_height` finns nu i Cloud istället för i `localStorage`-objektet.
- Inga andra delar av appen.

## Test efter implementation

1. Skapa en layout som tränare A → logga in som tränare B i samma lag → layouten syns.
2. Koppla en layout till en övning → en spelare i laget öppnar övningen → ser layouten i förhandsvisning.
3. Radera en layout → den försvinner direkt för alla.
4. Byt enhet/webbläsare → layouter finns kvar.
