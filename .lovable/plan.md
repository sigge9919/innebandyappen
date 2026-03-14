

## Plan: Säsongsbaserad statistik

### Översikt
Introducera ett säsongskoncept så att all statistik (matcher, träningar, RPE etc.) kopplas till en aktiv säsong. Tränare kan starta en ny säsong, varvid all ny data kopplas dit. Tidigare säsongers data finns kvar och kan visas via en säsongsväljare.

### Databasändringar

**Ny tabell: `seasons`**
- `id` (uuid, PK)
- `team_id` (uuid, NOT NULL)
- `name` (text, NOT NULL) — t.ex. "2025/2026"
- `is_active` (boolean, default false)
- `start_date` (text)
- `end_date` (text, nullable)
- `created_at` (timestamptz, default now())
- RLS: team members can CRUD

**Ny kolumn på `games`**: `season_id` (uuid, nullable) — kopplar matcher till en säsong.

**Ny kolumn på `training_sessions`**: `season_id` (uuid, nullable).

**Ny kolumn på `player_rpe_ratings`**: `season_id` (uuid, nullable).

En migration skapar tabellen, lägger till kolumnerna, och skapar en initial aktiv säsong per team som alla befintliga rader kopplas till.

### Kodändringar

**1. Ny hook: `src/hooks/useSeasons.ts`**
- CRUD för säsonger, hämta aktiv säsong, byta aktiv säsong, starta ny säsong.
- `startNewSeason(name)`: sätter alla befintliga säsonger till `is_active = false`, skapar en ny med `is_active = true`.

**2. Säsongskontext/väljare i `TeamContext` eller separat**
- Exponera `activeSeason` och `selectedSeasonId` (kan vara en annan än aktiv, för att titta på historik).
- En global säsongsväljare-komponent (dropdown) som visas i headern eller på Stats/Games-sidorna.

**3. Filtrera data per säsong**
- `useEnhancedGames`: lägg till `season_id`-filter i Supabase-queryn baserat på vald säsong.
- `useTrainingSessions`: samma filter.
- `useRPERatings`: samma filter.
- Vid skapande av ny match/träning/RPE: sätt `season_id` till den aktiva säsongen automatiskt.

**4. UI-ändringar**
- **TeamSettings**: Sektion "Säsongshantering" — visa alla säsonger, knapp "Starta ny säsong" med namnfält. Markera aktiv säsong.
- **Stats-sidan**: Säsongsväljare (dropdown) ovanför statistiken, så man kan bläddra mellan säsonger.
- **Games-sidan**: Visa enbart matcher från vald säsong.
- **PlayerDetail**: Statistiksektionen filtreras per vald säsong. Eventuellt en säsongsväljare lokalt.
- **Dashboard**: Visar enbart data från aktiv säsong.

**5. "Starta ny säsong"-flödet**
1. Tränaren klickar "Starta ny säsong" i inställningar.
2. Anger namn (t.ex. "2026/2027").
3. Föregående säsong stängs (is_active = false, end_date sätts).
4. Ny säsong skapas med is_active = true.
5. Alla nya matcher/träningar kopplas till den nya säsongen.
6. Befintlig data förblir orörd — filtrera bara bort den i UI.

### Filändringar
1. **Migration SQL** — ny tabell `seasons`, nya kolumner på `games`, `training_sessions`, `player_rpe_ratings`, initial data-migrering
2. **`src/hooks/useSeasons.ts`** (ny) — CRUD + aktiv säsong
3. **`src/contexts/TeamContext.tsx`** — exponera `activeSeason` + `selectedSeasonId`
4. **`src/hooks/useEnhancedGames.ts`** — filtrera per säsong
5. **`src/hooks/useLocalStorage.ts`** — filtrera träningar och RPE per säsong
6. **`src/pages/TeamSettings.tsx`** — sektion för säsongshantering
7. **`src/pages/Stats.tsx`** — säsongsväljare
8. **`src/pages/Games.tsx`** — filtrera per säsong
9. **`src/pages/PlayerDetail.tsx`** — filtrera statistik per säsong
10. **`src/pages/Dashboard.tsx`** — filtrera per aktiv säsong
11. **`src/components/stats/SeasonPlayerStats.tsx`** — inga strukturella ändringar, tar emot filtrerad data
12. **Ny komponent: `src/components/SeasonSelector.tsx`** — dropdown för att välja säsong

