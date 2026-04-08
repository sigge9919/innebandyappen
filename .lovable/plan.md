

## Plan: Valbart visningsnamn för matcher

### Bakgrund
I matchvyn visas `player.name.split(' ')[0]` (förnamnet) på ~20 ställen i 10 komponenter. Målet är att tränaren ska kunna välja ett anpassat visningsnamn per spelare i spelarprofilen.

### Ändringar

#### 1. Databas-migration
Lägg till kolumn `display_name text` (nullable, default null) i `players`-tabellen.

#### 2. Uppdatera Player-typen
Lägg till `displayName?: string` i `src/types/index.ts`.

#### 3. Nytt fält i PlayerFormDialog
Lägg till ett textfält "Matchnamn" i `src/components/forms/PlayerFormDialog.tsx` med placeholder som visar förnamnet automatiskt. Om fältet lämnas tomt används förnamnet som fallback.

#### 4. Hjälpfunktion
Skapa `getGameDisplayName(player: Player): string` i `src/lib/utils.ts` som returnerar `player.displayName || player.name.split(' ')[0]`.

#### 5. Ersätt alla `name.split(' ')[0]` i matchkomponenter
Byt ut i dessa filer (ca 20 förekomster):
- `GoalConfirmDialog.tsx` (4 st)
- `ShotPlayerDialog.tsx` (2 st)
- `LineSetup.tsx` (2 st)
- `GoalDetailsEditor.tsx` (1 st)
- `PenaltyEditor.tsx` (1 st)
- `PenaltyConfirmDialog.tsx` (1 st)
- `EnhancedLinePerformance.tsx` (1 st)
- `GoalieSelector.tsx` (2 st)
- `PostGamePlayerStats.tsx` (1 st)

Alla ersätts med `getGameDisplayName(player)`.

#### 6. Synkronisering med databasen
Uppdatera `useLocalStorage.ts` (eller relevant hook) så att `display_name` mappas till/från `displayName` vid läsning/skrivning.

### Tekniska detaljer
- Kolumnen är nullable — inget befintligt data behöver migreras
- Fallback till förnamn gör att inga befintliga spelare påverkas
- Ett enda fält, inga komplexa val — tränaren skriver t.ex. "Kansen", "A.Svensson" eller "Alex"

