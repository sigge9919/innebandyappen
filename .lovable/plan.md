## Mål
Lägg till fritt definierade kategorier (taggar) per match — flera taggar per match — och integrera kategori-filter i "Välj matcher"-dialogen på `/stats`.

## Databasändringar (migration)

**`games`** — ny kolumn:
- `categories text[] not null default '{}'`

**`team_settings`** — ny kolumn:
- `game_categories text[] not null default '{}'` — lagets fördefinierade kategorier (visas som förslag/snabbval)

Inga RLS-ändringar (befintliga policies täcker).

## Typer & storage

**`src/types/game.ts`** — `EnhancedGame`: lägg till `categories: string[]`. `createEnhancedGame` initialiserar `[]`.

**`src/lib/gameStorage.ts`** — mappa `categories` i `dbToEnhancedGame`, `enhancedGameToDb`, `enhancedGameUpdatesToDb`.

**`src/contexts/TeamContext.tsx` / `team_settings`-hook** — exponera `gameCategories: string[]` + uppdaterare (där andra team_settings-fält redan finns).

## UI — Redigera match
**`src/components/games/GameFormDialog.tsx` (samt `NewGameDialog.tsx` om relevant)**
- Lägg till "Kategorier" multi-select: kombobox med befintliga lag-kategorier som checkboxar + "Lägg till ny" inline (sparas direkt till `team_settings.game_categories`).
- Sparas på matchen som `categories: string[]`.

## UI — Laginställningar
**`src/pages/TeamSettings.tsx`** — ny sektion "Matchkategorier" (head coach): lista, lägg till, ta bort. Borttagning påverkar inte befintliga matchers tagging (de behåller strängvärdet).

## UI — Filter i statistik
**`src/components/stats/GameFilterDialog.tsx`** — utökas:
- Ovanför listan: rad med "kategori-chips" (alla unika kategorier som förekommer på matcherna + lagets fördefinierade). Multi-select toggle.
- Logik: om någon kategori är vald visas endast matcher som har **minst en** av de valda kategorierna (OR). Inga valda = visa alla (nuvarande beteende).
- "Markera alla" markerar alla för tillfället synliga (filtrerade) matcher.
- Varje match-rad visar små `Badge` med dess kategorier.
- `draft`-state för kategori-chips återställs när dialogen öppnas.

Inget annat i `Stats.tsx` behöver ändras — `selectedGameIds` flödar redan vidare.

## Avgränsningar
- Inga kategorier på kommande matcher krävs men fältet är tillgängligt för alla matcher.
- Borttagen kategori från `team_settings` rensas inte från historiska matcher — den dyker fortfarande upp som chip om någon match har den.
- Inget separat filter på `Games`-sidan i denna iteration (kan läggas till senare).
