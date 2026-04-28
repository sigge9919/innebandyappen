## Mål

Låt varje användare anpassa sin Översikt: vilka kort som visas, i vilken ordning. Inställningen sparas per användare och lag, och nya användare får en smart standard baserat på deras roll.

## Översikt

På Översikt läggs en liten "Anpassa"-knapp i sidhuvudet. När den klickas öppnas ett läge där användaren kan:
- Slå av/på varje kort (checkbox).
- Ändra ordning med upp/ned-pilar (enkelt och fungerar lika bra på mobil som desktop).
- Spara eller återställa till rollens standard.

Korten som kan anpassas:
- Statistikraden (4 stat-kort) — som ett block, kan döljas helt
- Nästa träning
- Nästa match
- Veckans fokus
- Lagets RPE
- Senaste matchen
- RPE-varningar (Hög trötthet)
- Spelarnotiser

## Datalagring

Ny tabell **`user_dashboard_preferences`** i Lovable Cloud:

```text
id              uuid (pk)
user_id         uuid  -> auth.uid()
team_id         uuid  -> teams.id
layout          jsonb  -- [{ id: "next-game", visible: true }, ...]
updated_at      timestamptz
unique (user_id, team_id)
```

**RLS:**
- SELECT/INSERT/UPDATE/DELETE: endast egna rader (`user_id = auth.uid()`) och endast om man är medlem i laget (`is_team_member(team_id)`).

Inga ändringar i andra tabeller.

## Roll-baserade standardinställningar

Vid första besöket på Översikt (ingen rad finns) genereras layouten från användarens roll i aktivt lag (`get_user_team_role`):

- **head_coach / assistant_coach**: stats → nästa match → nästa träning → veckans fokus → lagets RPE → senaste match → RPE-varningar → spelarnotiser
- **player**: lagets RPE → nästa träning → nästa match → veckans fokus → senaste match → stats → (RPE-varningar och spelarnotiser dolda)
- **viewer / övrigt**: nästa match → senaste match → stats → nästa träning → veckans fokus → (RPE-kort dolda)

Standarden sparas inte automatiskt — först när användaren öppnar "Anpassa" och trycker Spara skapas raden. Det gör att framtida ändringar i defaults når befintliga användare som inte aktivt anpassat.

## Tekniska detaljer

### Ny hook `useDashboardLayout(teamId, role)`
- Läser raden för (user, team) från tabellen.
- Om saknas: returnerar rollens default in-memory.
- Exponerar `layout`, `setLayout`, `save`, `resetToRoleDefault`.

### `src/pages/Dashboard.tsx`
- Itererar över layout-arrayen istället för hårdkodad ordning.
- Renderar bara kort där `visible: true` och där underliggande data finns (samma villkor som idag, t.ex. `lastPlayedGame` måste finnas).
- Lägger till knappen "Anpassa" i sidhuvudet bredvid säsongsväljaren.

### Ny komponent `src/components/dashboard/DashboardCustomizer.tsx`
- Sheet/dialog med en lista över alla kort.
- Per rad: kortets namn, switch för visa/dölj, upp/ned-pilar för ordning.
- Knappar: "Återställ standard", "Avbryt", "Spara".
- Sparar via hooken till databasen.

### Inga andra sidor påverkas
Övriga sidor, rutter, RLS, edge-funktioner och befintliga komponenter förblir oförändrade.

## Vad användaren märker

1. Öppnar Översikt → ser sin senaste sparade layout (eller rollens default om inget sparats).
2. Klickar "Anpassa" → kan dra på/av kort och ändra ordning.
3. Sparar → nästa gång hen loggar in på samma lag (även från annan enhet) ser hen samma layout.
4. Byter till annat lag → varje lag har sin egen sparade layout.
