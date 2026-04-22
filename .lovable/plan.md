
## Byt rotrutt till landing och flytta appen till /login

Just nu är `/` = appen (Dashboard via `Index`) och `/landing` = landingsidan. Det vänds:

- `/` → Landing (publik startsida)
- `/login` → appens ingång (Dashboard/AppGuard som hanterar inloggning)
- `/landing` → tas bort (eller redirect till `/`)

### Ändringar i `src/App.tsx`
- Lägg `<Route path="/" element={<Landing />} />` som publik route (utanför `TeamProvider`/`AppGuard`), tillsammans med `/reset-password`.
- Ta bort den nuvarande `<Route path="/landing" …>`.
- Inuti catch-all `<Route path="*">` (som wrappas av `TeamProvider` + `AppGuard`):
  - Ändra `<Route path="/" element={<Index />} />` till `<Route path="/login" element={<Index />} />`.
  - Övriga app-routes (`/team`, `/games`, …) behålls oförändrade.

### Ändringar i `src/pages/Landing.tsx`
- Headerns logotyp `<Link to="/">` → `<Link to="/login">` så att klick på logotypen leder till appens inlogg, enligt tidigare regel ("endast logotypen leder till login").
- Inga andra knappar ändras — popup "Lansering 15 juni" är kvar.

### Att tänka på
- `AppGuard` triggar nu på `/login` istället för `/` och hanterar omdirigering till inloggning/dashboard som tidigare.
- Eventuella interna länkar i appen som pekar på `/` (om sådana finns) bör fortsätta fungera eftersom `/` nu är publik landing — men användare som redan är inloggade och navigerar till `/` kommer att se landingsidan. Om du vill att inloggade användare istället auto-omdirigeras från `/` till `/login` kan vi lägga till det i ett senare steg (säg till om du vill ha det).
