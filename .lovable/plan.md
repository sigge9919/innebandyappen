

## Plan: Låt tränare välja övningar vid lagskapande

### Bakgrund
Idag anropas `seed_default_drills(_team_id)` automatiskt inuti `create_team` RPC:n, vilket lägger till alla ~98 övningar från Övningsbanken direkt. Målet är att tränaren istället ska kunna välja vilka övningar som ska importeras.

### Ändringar

#### 1. Uppdatera `create_team` DB-funktion (migration)
Ta bort raden `PERFORM public.seed_default_drills(_team_id)` från `create_team`-funktionen så att inga övningar seedas automatiskt.

#### 2. Skapa ny DB-funktion `seed_selected_drills` (migration)
En ny funktion som tar `_team_id uuid` och `_drill_indices int[]` (index i en fast ordning) och bara insertar de valda övningarna. Alternativt — enklare approach: behåll `seed_default_drills` som den är men gör den anropbar manuellt, och lägg till en **ny funktion** `get_default_drill_catalog()` som returnerar listan med namn/beskrivningar/kategorier utan att inserta något, så att UI:t kan visa dem.

**Enklaste lösningen**: Hårdkoda övningslistan i frontend (den är redan känd), låt tränaren bocka i vilka de vill ha, och inserta de valda via vanlig `supabase.from('drills').insert([...])` efter att teamet skapats.

#### 3. Ny komponent: `DrillCatalogPicker`
- Visas som ett steg efter att lagnamnet angivits (antingen som steg 2 i TeamSetup eller som en dialog direkt efter skapande)
- Listar alla ~98 övningar grupperade per kategori (alla har kategorin "Övningsbanken" men kan grupperas efter namn-prefix som "Passa", "Driva boll", "Målvaktsövning" etc.)
- Sök/filter-fält
- "Välj alla" / "Avmarkera alla" knappar
- Varje övning har en checkbox med namn och kort beskrivning
- Knappen "Importera valda (N st)" insertar dem till databasen

#### 4. Uppdatera TeamSetup-flödet
- Steg 1: Ange lagnamn → `createTeam(name)` (skapar lag utan övningar)
- Steg 2: `DrillCatalogPicker` visas → tränaren väljer → bulk-insert till `drills`-tabellen
- "Hoppa över" möjlighet för att skapa laget utan övningar

#### 5. Övningslista i frontend
Extrahera de 98 övningarna till en konstant-fil (t.ex. `src/lib/defaultDrills.ts`) med namn, beskrivning och video_url, så att pickern kan visa dem utan databasanrop.

### Tekniska detaljer
- **Migration**: Uppdatera `create_team` för att ta bort `PERFORM seed_default_drills`
- **Ny fil**: `src/lib/defaultDrills.ts` — exportar `DEFAULT_DRILLS` array
- **Ny komponent**: `src/components/team/DrillCatalogPicker.tsx`
- **Ändrad fil**: `src/pages/TeamSetup.tsx` — lägg till steg 2 med picker
- **Ändrad fil**: `src/contexts/TeamContext.tsx` — `createTeam` returnerar team_id så att drills kan insertas efteråt
- Bulk-insert via `supabase.from('drills').insert(selectedDrills.map(d => ({ ...d, team_id })))`

