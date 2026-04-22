

## Plan: Landningssida för Floorball Tactix

Bygger en publik landningssida på `/` baserat på din PDF-design. Utloggade besökare ser landningssidan; inloggade skickas direkt till dashboarden.

### Designspråk (matchar PDF)
- **Bakgrund**: Mörk navy (`#0b1829` / befintlig `--sidebar-background`) med subtilt grid-mönster (CSS bakgrundsraster)
- **Accent**: Cyan (`--primary` 190 100% 50%) med glow-effekter på CTA-knappar och rubriker
- **Typografi**: Stora bold rubriker (befintlig `tracking-tight`), all-caps eyebrow-labels i cyan
- **Komponenter**: shadcn/ui Button + Card, inte ny stylekonvertering — applicerar dock landningssidans stilar via Tailwind-klasser

### Sidstruktur (en lång scroll-sida)

1. **Topbar** — Logo (`/logo.png`) vänster, navlinks (Funktioner, Så funkar det, Prissättning), "Logga in"-knapp + cyan "Kom igång"-CTA höger. Mobilmeny via Sheet.

2. **Hero** — Eyebrow-pill "DIGITAL TAKTIKPLATTFORM FÖR INNEBANDY", H1 "Träna smartare / VINN MER" (andra raden i cyan med glow), undertext, två CTA-knappar ("Prova gratis" → /login, "Se demo" → scrollar till funktioner). Under: en stor mock-up av innebandyplanen med spelarprickar (ren SVG, ingen interaktion — bara visuellt).

3. **Funktioner** — Eyebrow "PLATTFORMEN", H2 "Allt du behöver som tränare", 6 feature-kort i 2×3 grid (Taktikbräda, Animerade spelrörelser, Dela med laget, Taktikbibliotek, Samarbete, Matchanalys) med lucide-ikoner istället för emoji.

4. **Så funkar det** — 3-stegs lista (numrerade cyan-cirklar) till vänster, mock-up av taktikbrädan till höger.

5. **Prissättning** — 3 kort (Gratis 0kr, Pro 149kr/mån "POPULÄRAST" med cyan border + glow, Klubb 499kr/mån). Alla CTAs leder till /login.

6. **Slutgiltig CTA** — "Redo att ta nästa steg?" + stor cyan "Skapa konto gratis"-knapp.

7. **Footer** — Logo, copyright, länkar (Integritetspolicy, Villkor, Kontakt — placeholder-ankare).

### Routing (krav: landningssida bara för utloggade)

I `App.tsx`:
- Ny publik route `/` → `<Landing />` (utan TeamProvider/AppGuard)
- Om inloggad användare hamnar på `/`, redirect till `/app`
- Flytta hela appen bakom `/app/*` eller behåll nuvarande paths men lägg landningssidan som villkorlig render

**Vald approach** (minst risk för befintliga länkar): Behåll alla appens routes som idag (`/team`, `/games`, etc.). Endast `/` ändras:
- Utloggad på `/` → Landningssida
- Inloggad på `/` → Dashboard (som idag)
- Allt annat (`/team`, `/games`, …) → AppGuard kräver inloggning som idag

`AppGuard` ändras: om `!user && location.pathname === '/'` → render `<Landing />` istället för `<Login />`. `<Login />` flyttas till egen route `/login` som landningssidans CTA-knappar pekar på.

### Filer som skapas/ändras

**Nya:**
- `src/pages/Landing.tsx` — hela landningssidan
- `src/components/landing/LandingNav.tsx` — top-nav med mobilmeny
- `src/components/landing/HeroBoard.tsx` — SVG-mockup av innebandyplanen
- `src/components/landing/FeatureCard.tsx`
- `src/components/landing/PricingCard.tsx`

**Ändras:**
- `src/App.tsx` — lägg till `/login`-route, montera Landing
- `src/components/guards/AppGuard.tsx` — render Landing istället för Login när utloggad på `/`
- `src/index.css` — lägg till grid-bakgrundsklass + cyan glow-utility

### Tekniska detaljer
- Landningssidan använder samma `BrowserRouter` + `AuthProvider` så vi kan kolla `user`-status
- Inga databasändringar
- Inga nya dependencies — använder befintliga shadcn/ui + lucide-react ikoner
- SVG-illustrationer av planen byggs inline (inte bilder från PDF) så de skalar perfekt
- Responsiv: 2-kolumnsgrid blir 1 kolumn under `md`, mobilmeny via `Sheet` under `lg`

