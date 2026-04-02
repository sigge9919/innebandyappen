## Plan: Egna pass som lagträningar + RPE-historik

### 1. Databasmigrering
- Lägg till kolumner i `training_sessions`:
  - `is_personal` (boolean, default false) — markerar personliga pass
  - `created_by_player_id` (uuid, nullable) — vilken spelare som skapade passet
- Migrera befintlig data från `personal_trainings` till `training_sessions`
- Uppdatera RLS: spelare kan skapa/redigera egna personliga pass
- Behåll `personal_trainings`-tabellen tills vidare (bakåtkompatibilitet)

### 2. Kod: useLocalStorage-hook
- Uppdatera `useTrainingSessions` för att hantera personliga pass (is_personal-filter)
- Uppdatera `usePersonalTrainings` att skriva till `training_sessions` istället
- Spelarportalen använder samma hook med is_personal=true filter

### 3. Träningssidan — RPE på kort
- Visa snitt-RPE badge på varje TrainingCard (beräknat från `player_rpe_ratings`)
- Klickbar för att se individuella RPE-betyg per spelare

### 4. Träningssidan — Historikvy
- Ny flik "Historik" på Training-sidan
- Tabell med alla genomförda pass (datum, tema, längd, snitt-RPE, antal spelare)
- Filter: tidsperiod, personligt/gemensamt, tematext
- Klick öppnar detaljer med RPE per spelare

### 5. Spelarportalen
- Uppdatera formuläret för "Logga personlig träning" att spara som training_session med is_personal=true
- Lista personliga pass från samma källa

### Avgränsning
- Personliga pass får förenklat formulär (ingen sektionsuppdelning/övningar)
- Befintlig data i personal_trainings migreras men tabellen tas inte bort ännu
