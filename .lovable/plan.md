

## Plan: Anpassa UI-färger till logotypens färgpalett

### Bakgrund
Logotypen "Floorball Tactix" använder en mörk marinblå bakgrund med cyan/turkos accenter och vit text. Den nuvarande UI:n har en steel-blue palett (HSL 210 50%) som är nära men inte helt matchande. Målet är att skifta hela temat så att det bättre speglar logotypens färger.

### Färgpalett från logotypen
- **Mörk marinblå**: ~#1a2332 (bakgrund, sidebar)
- **Cyan/turkos**: ~#00d4ff (primär accent)
- **Mellanblå/slate**: ~#2a4060 (sekundära ytor)
- **Vit**: text och kontrast

### Ändringar

#### 1. Uppdatera CSS-variabler i `src/index.css`

**Light mode:**
- `--primary`: Ändra från `210 50% 36%` till `190 100% 42%` (cyan/turkos)
- `--ring`: Matcha primary

**Dark mode (huvudtemat):**
- `--background`: Ändra till `215 35% 10%` (djupare marinblå)
- `--card`: Ändra till `215 30% 14%`
- `--primary`: Ändra till `190 100% 50%` (ljus cyan)
- `--accent`: Ändra till `215 25% 18%`
- `--border`/`--input`: Justera till marinblå toner
- `--muted`: Anpassa till mörkare marinblå

**Sidebar (båda lägen):**
- `--sidebar-background`: Ändra till `215 40% 8%` (djup marin)
- `--sidebar-primary`: Ändra till `190 100% 50%` (cyan)
- `--sidebar-accent`: Mörkare marinblå
- `--sidebar-border`: Subtil marinblå

#### 2. Uppdatera `nav-item-active` border-färg
Redan kopplad till `--sidebar-primary`, så den följer automatiskt.

### Tekniska detaljer
- Alla ändringar sker i en enda fil: `src/index.css`
- CSS-variablerna propageras automatiskt till alla komponenter via Tailwind
- Inga komponentändringar behövs — allt styrs av variablerna
- Light mode får också en cyan-primärfärg för konsekvens

