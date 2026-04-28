## Line-byggare i Lag — visuella formationer som kan laddas i match

Skapa en ny modul i Lag-vyn för att laborera med kedjor (5v5, PP, PK) på en visuell, formationsbaserad plan. Sparade kedjor ska kunna laddas in vid matchförberedelser och behålla sin formation.

### 1. Ny vy: "Lines" i Lag

I `src/pages/Team.tsx` läggs en flikväxlare i sidhuvudet:

- **Spelare** (nuvarande lista)
- **Lines** (ny vy)

Default-vyn fortsätter vara Spelare så inget förändras för befintliga flöden.

### 2. Formationskomponent — `LineFormationBoard`

Ny fil: `src/components/lines/LineFormationBoard.tsx`

En SVG-baserad rink (återanvänd ritlogiken från `TacticsBoardRenderer` men **roterad 90°** så att mål är upp/ned istället för vänster/höger). Komponenten renderar **förinställda positioner** för en kedjetyp:

- **5v5** (3 parallella kedjor staplade vertikalt på planen):
  - Per kedja: 2 backar (nedre raden), 1 center (mitten), 2 forwards (övre raden)
  - Totalt 15 positioner uppdelade i tre färgkodade band
- **PP (5v4)**: 1 kedja med 5 spelare i PP-formation (1 back upptill, 2 halvbackar, 2 forwards nere vid mål)
- **PK (4v5)**: 1 kedja med 4 spelare i box-formation (2 backar, 2 forwards i ruta)

Varje "slot" är en cirkel på planen med rolletikett (B/C/F). Klick på en slot öppnar en spelarväljare (popover) som listar truppens spelare filtrerade efter passande positioner men tillåter alla. Vald spelare visas som smeknamn under cirkeln.

Slots är **fasta positioner** — användaren flyttar inte cirklarna, bara tilldelar spelare. Detta håller UI:t enkelt och formationen återanvändbar i match.

### 3. Sida: `/team/lines`

Ny fil: `src/pages/TeamLines.tsx` (route registreras i `src/App.tsx` under skyddade routes).

Layout:

- Topprad: knappar för formationstyp `5v5 | PP | PK` + namn-input + Spara/Ladda/Ny
- Centralt: `LineFormationBoard` med vald formation
- Sidopanel höger: lista över sparade line-uppställningar (kan filtreras efter typ), med knappar Ladda / Byt namn / Duplicera / Radera

### 4. Datamodell & lagring

Ny tabell `line_layouts`:

```text
line_layouts
- id uuid pk
- team_id uuid (RLS: is_team_member)
- name text
- type text  -- '5v5' | 'PP' | 'PK'
- slots jsonb  -- [{ slotId, role: 'D'|'C'|'F', x, y, lineIndex, playerId? }]
- created_at timestamptz
- updated_at timestamptz
```

RLS-policys identiska med `drills`/`plays` (team members CRUD). Migration via supabase-tool.

Hook `src/hooks/useLineLayouts.ts` för CRUD mot tabellen, scopad till aktuellt team via `TeamContext`.

### 5. Integration i matchförberedelser

I `src/components/games/LineSetup.tsx`:

- Lägg till en knapp **"Ladda från sparade kedjor"** överst i varje sektion (5v5, PP, PK)
- Klick öppnar dialog med listan av sparade layouts av matchande typ
- Vid val: mappa slots → existerande `GameLine.playerIds` arrayer (5v5-layouten fyller `line-1`, `line-2`, `line-3`; PP fyller `pp-1`; PK fyller `pk-1`)

Dessutom: i `LineCard` kompletteras nuvarande badge-listan med en kompakt formationsvy (mini-`LineFormationBoard` i read-only-läge med tröjnummer i sloten) så att samma formation syns i matchvyn.

### 6. Visuella detaljer

- Återanvänd färgtokens (`--primary` cyan för hemmaspelare, `--muted` rink-bakgrund, 0.25rem radius)
- Tre 5v5-kedjor särskiljs med subtila banderoller bakom varje kedja (svag tonad bakgrund) och etikett "Kedja 1/2/3"
- Tom slot = streckad cirkel med rolletikett; tilldelad slot = fylld cirkel med tröjnummer
- Touch-vänliga slot-storlekar (≥ 36px) för bänkanvändning

### Tekniska anteckningar

- Roterad rink: byt höjd/bredd-förhållande och rita långsidor vertikalt; mål placeras vid `y=padding` och `y=height-padding`
- Slot-koordinater definieras som procent av rink-storleken så att layouten är responsiv
- Spelarväljare via `Popover` + sökbar lista (Command-komponenten finns redan)
- `usePlayers`-hooken används för att hämta truppen i builder-vyn; i matchvyn kommer spelarna från `squadPlayers`-prop som tidigare
- Inga ändringar i `EnhancedGame`-typen behövs — line-layouts mappas in i befintliga `GameLine.playerIds`

### Vad som **inte** ingår

- Ingen drag-and-drop av positioner (slots är fasta)
- Inga animationer (det är taktiktavlans uppgift)
- 6v5 / 5v6 lägger vi inte till i builder nu, men kan addas senare med samma mönster