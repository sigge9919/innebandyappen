

## Plan: Notifikationer för RPE-bedömning till spelare

### Bakgrund
PlayerPortal har redan logik som upptäcker obehandlade pass (matcher/träningar) och öppnar en RPE-dialog automatiskt. Men det finns inget visuellt som signalerar till spelaren att det finns väntande bedömningar förutom att dialogen dyker upp vid sidladdning. Dessutom är RPE-prompt-texterna fortfarande på engelska.

### Ändringar

**1. Notifikationsbanner i PlayerPortal**
- Lägg till en synlig notifikationsbanner högst upp på spelarportalen som visar antal väntande RPE-bedömningar ("Du har X pass att bedöma").
- Bannern har en knapp "Bedöm nu" som öppnar RPE-dialogen.
- Bannern visas bara om det finns väntande pass, och försvinner automatiskt.

**2. Notifikationsikon i AppLayout för spelare**
- I headern/layouten, visa en klock-/bell-ikon med en badge-siffra som indikerar väntande bedömningar.
- Detta ger spelaren en visuell signal oavsett var på sidan de befinner sig.

**3. Översätt RPE-prompt till svenska**
- Ändra `"Game vs ..."` → `"Match mot ..."` och `"Training: ..."` → `"Träning: ..."` i pending-labels (rad 56, 66).

### Teknisk implementation

- **`src/pages/PlayerPortal.tsx`**: Lägg till en alert/banner-komponent ovanför spelarheadern som visar väntande pass. Fixa engelska strängar i useEffect.
- **`src/components/layout/AppLayout.tsx`**: Lägg till en notifikationsindikator (Bell-ikon med badge) som visar antalet väntande RPE-bedömningar för spelare. Kräver att vi skapar en liten hook eller kontext som beräknar pending count.
- **Ny hook `src/hooks/usePendingRPE.ts`**: Extrahera logiken som beräknar väntande RPE-pass (från PlayerPortal) till en återanvändbar hook. Returnerar `pendingCount` och `pendingSessions`.

### Filändringar
1. **`src/hooks/usePendingRPE.ts`** (ny) — Hook som beräknar väntande RPE-bedömningar
2. **`src/pages/PlayerPortal.tsx`** — Använd nya hooken, lägg till notifikationsbanner, fixa svenska strängar
3. **`src/components/layout/AppLayout.tsx`** — Visa bell-ikon med badge för spelare med väntande bedömningar

