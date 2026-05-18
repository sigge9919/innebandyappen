## Mål
Dela upp kombinationsstatistiken på `/stats` → "Kombinationer" efter spelsätt (`5v5`, `5v4`, `4v5`, `6v5`, `5v6`).

## Ändringar

**`src/components/stats/LineCombinationStats.tsx`**
- Lägg till knapprad överst för spelsätt-filter: `Alla`, `5v5`, `5v4` (PP), `4v5` (PK), `6v5`, `5v6`. Penalty shots (`PS`) ingår aldrig (redan exkluderat).
- Ny state: `situationFilter: GameSituation | 'all'`, default `'all'`.
- I `useMemo`-beräkningen: när filter ≠ `'all'`, räkna endast events vars `event.situation` matchar filtret. För opponent-mål utan `lineId` (snapshot-fallback) används samma situation-check.
- "Matcher"-räkningen ändras till antal matcher där kombinationen var på isen i något event med vald situation (för `'all'` = nuvarande beteende: matcher där kedjan satts upp).
  - Konkret: när filter ≠ `'all'`, samla per kombination de `gameId` där minst ett event med rätt situation matchar kombinationens spelare (via `lineId`→line eller `onIcePlayerIds`-superset).
- Tomt-tillstånd-text uppdateras dynamiskt: "Inga kombinationer i {situation}".
- Resten av tabellen (MF, ME, +/−, +/− per match) är oförändrad logik, bara filtrerad indata.

## Inga andra filer
Rent inom `LineCombinationStats.tsx`. Inga DB- eller typändringar — `GameSituation` finns redan i `src/types/game.ts`.
