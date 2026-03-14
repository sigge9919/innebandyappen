

## Översätt hela appen till svenska

### Omfattning
Alla synliga engelska strängar i appen ska översättas till svenska. Detta inkluderar navigering, sidtitlar, knappar, filter, formulär, dialogrutor, felmeddelanden, statustexter och tomma tillstånd.

### Tillvägagångssätt
Direkt strängbyte i varje fil — ingen i18n-ramverk behövs då appen bara ska finnas på svenska.

### Filer som behöver ändras

**Navigering & Layout:**
- `src/components/layout/AppSidebar.tsx` — Nav labels: Dashboard→Översikt, Team→Lag, Games→Matcher, Stats→Statistik, Training→Träning, Playbook→Spelbok, Development→Utveckling, Tactics Board→Taktiktavla, Settings→Inställningar, Sign Out→Logga ut, "Create new team"→"Skapa nytt lag"

**Inloggning & Lagsetup:**
- `src/pages/Login.tsx` — Sign in, Create Account, Email, Password, etc.
- `src/pages/TeamSetup.tsx` — Create Your Team, Team Name, etc.

**Sidor (pages):**
- `src/pages/Dashboard.tsx` — Active Players→Aktiva spelare, Games Played→Spelade matcher, Win Rate→Vinstprocent, Sessions→Träningar
- `src/pages/Team.tsx` — Add Player, Search players, All, Active, Injured, Focus, etc.
- `src/pages/Games.tsx` — Add Game, All Games, Not Started, Live, Finished, Wins, Draws, Losses, total games, etc.
- `src/pages/GameDetail.tsx` — Period labels, Start Game, End Game, Victory/Defeat/Draw, Squad, Line Setup, Starting Goalie, section titles
- `src/pages/Stats.tsx` — Player Stats, Team Stats, Trends, Full Season, Last 3 Games
- `src/pages/Training.tsx` — (delvis redan på svenska med "Favoriter"), Create Session, Upcoming Sessions, Drill Library, Add Drill, Search drills
- `src/pages/TrainingSessionForm.tsx` — Section types (Warm-up, Main drills, etc.), Create Session, Save Changes, team-delnings-text
- `src/pages/Development.tsx` — Active Plans, With Plan, Without Plan, Recent Tests, Add Test, Complete, Edit, etc.
- `src/pages/Playbook.tsx` — Add Play, All Plays, Search plays, Category
- `src/pages/PlayDetail.tsx` — Edit, Back to Playbook, Tactics Board Layouts, Photos & Videos, No content
- `src/pages/DrillDetail.tsx` — Edit, Video, Back to Training, No content, Add Content
- `src/pages/PlayerDetail.tsx` — Back, Edit Player, Invite Player, Season Statistics, Development Plans, Test Results, RPE Ratings, Personal Trainings
- `src/pages/PlayerPortal.tsx` — My Season Stats, RPE History, Personal Trainings, How tired are you feeling?, Fresh/Exhausted
- `src/pages/TacticsBoard.tsx` — Plan formations, plays, and strategies
- `src/pages/TeamSettings.tsx` — Team Members, Invite Coach, roles (Head Coach, Assistant Coach, etc.)

**Dashboard-komponenter:**
- `src/components/dashboard/NextGameCard.tsx` — Next Game, Upcoming, View details
- `src/components/dashboard/LastGameCard.tsx` — Last Game, View all games
- `src/components/dashboard/NextTrainingCard.tsx` — Next Training, Scheduled, View training plan
- `src/components/dashboard/WeeklyFocusCard.tsx` — Weekly Focus, Coach Notes, Not set, No notes, Save, Cancel, Edit
- `src/components/dashboard/PlayerAlerts.tsx` — Player Alerts, No alerts, Injured, Focus, View all players
- `src/components/dashboard/RPEAlertsCard.tsx` — High Fatigue Alerts
- `src/components/dashboard/TeamRPECard.tsx` — Team Fatigue, Fresh/Good/Moderate/Tired/Exhausted, Last Session, 7-Day Avg, Rising/Dropping/Stable

**Formulär-dialoger:**
- `src/components/forms/PlayerFormDialog.tsx` — Edit/Add Player, Name, Jersey Number, Stick Side, Positions (Forward→Forward, Center→Center, Defender→Back, Goalkeeper→Målvakt), Status, Notes, Focus Flag, Delete, Cancel, Save Changes
- `src/components/forms/DrillFormDialog.tsx` — Edit/Add Drill, Name, Description, Categories, Video URL, Delete, Cancel
- `src/components/forms/EditDrillDialog.tsx` — same
- `src/components/forms/PlayFormDialog.tsx` — Edit/Add Play, Name, Category, Key Points, Tags, Diagram URL, Video URL
- `src/components/forms/TrainingFormDialog.tsx` — Section types, team division text, drill selection text
- `src/components/forms/GameFormDialog.tsx`, `NewGameDialog.tsx` — Create Game, Cancel
- `src/components/forms/IDPFormDialog.tsx` — IDP-related text
- `src/components/forms/TestResultFormDialog.tsx` — test result text

**Spelkomponenter:**
- Various game components (LiveTracking, SquadSelection, PostGameNotes, PostGameTeamStats, PostGamePlayerStats, etc.) — all English labels

**Statistikkomponenter:**
- `src/components/stats/SeasonPlayerStats.tsx`, `SeasonTeamStats.tsx`, `TeamTrends.tsx`, `PlayerTrends.tsx`

### Teknisk anmärkning
- `date-fns` format-strängar med engelska veckodagar (EEE, MMM d) behöver bytas till `sv` locale
- TeamRPECard day labels behöver ändras till svensk locale
- Inga databas- eller backend-ändringar krävs

### Uppskattning
~40+ filer behöver uppdateras med svenska strängar. Alla ändringar är strängbyten — ingen logikändring.

