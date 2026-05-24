import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useGameDetail } from '@/hooks/useEnhancedGames';
import { usePlayers } from '@/hooks/useLocalStorage';
import { SquadSelection } from '@/components/games/SquadSelection';
import { LineSetup } from '@/components/games/LineSetup';
import { GameCategoryPicker } from '@/components/games/GameCategoryPicker';
import { LiveTracking } from '@/components/games/LiveTracking';
import { PostGameNotes } from '@/components/games/PostGameNotes';
import { GameStatsCard } from '@/components/games/GameStatsCard';
import { PostGameTeamStats } from '@/components/games/PostGameTeamStats';
import { PostGamePlayerStats } from '@/components/games/PostGamePlayerStats';
import { EnhancedLinePerformance } from '@/components/games/EnhancedLinePerformance';
import { GoalDetailsEditor } from '@/components/games/GoalDetailsEditor';
import { PenaltyEditor } from '@/components/games/PenaltyEditor';
import { SpecialTeamsSummary } from '@/components/games/SpecialTeamsSummary';
import { CollapsibleSection } from '@/components/games/CollapsibleSection';
import { GoalieSelector } from '@/components/games/GoalieSelector';
import { GameMediaSection } from '@/components/games/GameMediaSection';
import { Period, Team, TeamStats, GameSituation } from '@/types/game';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { ArrowLeft, Play, MapPin, Calendar, Trophy, BarChart3, Zap, CircleDot, AlertOctagon, User, TrendingUp, FileText, ChevronRight, Square, Shield, Settings, LayoutGrid, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function GameDetail() {
  const [showLiveLineEdit, setShowLiveLineEdit] = useState(false);
  const [liveView, setLiveView] = useState<'tracking' | 'stats'>('tracking');
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { players } = usePlayers();
  
  const {
    game,
    updateGame,
    updateSquad,
    updateLine,
    startGame,
    endGame,
    setStartingGoalie,
    setActiveGoalie,
    setActiveLine,
    nextPeriod,
    setCurrentSituation,
    recordEvent,
    recordPenalty,
    undoLast,
    getHomeStats,
    getOpponentStats,
    getPeriodHomeStats,
    getPeriodOpponentStats,
    getPeriodStats,
    getLineStats,
    getSpecialTeamsStats,
    updateNotes,
    updatePlayerStat,
    assignBlockedShot,
    updateGoalDetails,
    assignPenaltyPlayer,
    updateTeamPeriodStats,
    addGameMedia,
    removeGameMedia,
  } = useGameDetail(gameId || '');

  if (!game) {
    return (
      <AppLayout>
        <div className="page-container">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Matchen hittades inte</p>
            <Button className="mt-4" onClick={() => navigate('/games')}>
              Tillbaka till matcher
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const squadPlayers = players.filter(p => game.squadPlayerIds.includes(p.id));
  const squadGoalies = squadPlayers.filter(p => p.positions?.includes('Goalkeeper'));
  const canStartGame = game.squadPlayerIds.length > 0;

  const STATUS_LABELS: Record<string, string> = {
    'Not Started': 'Ej startad',
    'Live': 'Live',
    'Finished': 'Avslutad',
  };

  const statusColor = {
    'Not Started': 'bg-muted text-muted-foreground',
    'Live': 'bg-success/10 text-success border border-success',
    'Finished': 'bg-primary/10 text-primary',
  }[game.status];

  const handleUpdateTeamStats = (team: Team, period: Period, stats: Partial<TeamStats>) => {
    updateTeamPeriodStats(team, period, stats);
  };

  const PERIOD_LABELS: Record<string, string> = {
    '1': 'Period 1',
    '2': 'Period 2',
    '3': 'Period 3',
    'OT': 'Övertid',
  };

  const PERIOD_ORDER = ['1', '2', '3', 'OT'];
  const currentPeriodIndex = PERIOD_ORDER.indexOf(game.currentPeriod);
  const isLastPeriod = currentPeriodIndex >= PERIOD_ORDER.length - 1;

  return (
    <AppLayout>
      <div className="page-container max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/games')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">vs {game.opponent}</h1>
              <Badge className={statusColor}>{STATUS_LABELS[game.status] || game.status}</Badge>
              {game.status === 'Live' && (
                <Badge variant="outline" className="text-base px-3 py-1">
                  {PERIOD_LABELS[game.currentPeriod]}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(game.date), 'EEE d MMM yyyy', { locale: sv })}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {game.location}
              </span>
            </div>
            <div className="mt-2">
              <GameCategoryPicker
                value={game.categories ?? []}
                onChange={(next) => updateGame({ categories: next })}
              />
            </div>
          </div>
          {/* Live game controls in header */}
          {game.status === 'Live' && (
            <div className="flex items-center gap-2">
              <Button
                variant={liveView === 'stats' ? 'secondary' : 'outline'}
                size="sm"
                className="gap-1"
                onClick={() => setLiveView(liveView === 'tracking' ? 'stats' : 'tracking')}
              >
                <BarChart3 className="h-4 w-4" />
                {liveView === 'stats' ? 'Live' : 'Statistik'}
              </Button>
              <Button
                variant={showLiveLineEdit ? 'secondary' : 'outline'}
                size="sm"
                className="gap-1"
                onClick={() => setShowLiveLineEdit(!showLiveLineEdit)}
              >
                <Settings className="h-4 w-4" />
                {showLiveLineEdit ? 'Dölj' : 'Redigera kedjor'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => navigate(`/tactics?from=/games/${gameId}`)}
              >
                <LayoutGrid className="h-4 w-4" />
                Taktik
              </Button>
              {!isLastPeriod && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1"
                  onClick={nextPeriod}
                >
                  Nästa period
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="gap-1"
                  >
                    <Square className="h-4 w-4" />
                    Avsluta match
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Avsluta matchen?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Matchen avslutas med resultatet {game.ourScore} - {game.opponentScore}. 
                      Du kan fortfarande redigera spelarstatistik och anteckningar efteråt.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Avbryt</AlertDialogCancel>
                    <AlertDialogAction onClick={endGame}>Avsluta match</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        {/* Pre-Game Setup View */}
        {game.status === 'Not Started' && (
          <div className="space-y-6">
            {/* Squad Selection */}
            <div className="stat-card">
              <SquadSelection
                allPlayers={players}
                selectedPlayerIds={game.squadPlayerIds}
                onSelectionChange={updateSquad}
              />
            </div>

            {/* Goalie Selection */}
            {squadGoalies.length > 0 && (
              <div className="stat-card">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Startmålvakt
                </h3>
                <GoalieSelector
                  goalies={squadGoalies}
                  selectedGoalieId={game.startingGoalieId}
                  onSelectGoalie={setStartingGoalie}
                  label="Välj startmålvakt"
                />
              </div>
            )}

            {/* Line Setup */}
            {game.squadPlayerIds.length > 0 && (
              <div className="stat-card">
                <h3 className="text-lg font-semibold mb-1">Kedjor</h3>
                <p className="text-sm text-muted-foreground mb-4">Sätt upp kedjor redan nu — du behöver inte starta matchen först.</p>
                <LineSetup
                  lines={game.lines}
                  squadPlayers={squadPlayers}
                  onUpdateLine={updateLine}
                />
              </div>
            )}

            {/* Start Game Button */}
            <Button 
              size="lg" 
              className="w-full gap-2 h-14 text-lg"
              disabled={!canStartGame}
              onClick={startGame}
            >
              <Play className="h-6 w-6" />
              Starta match
            </Button>
            {!canStartGame && (
              <p className="text-center text-sm text-muted-foreground">
                Välj minst en spelare för att starta matchen
              </p>
            )}
          </div>
        )}

        {/* Live Game View */}
        {game.status === 'Live' && (
          <div className="space-y-4">
            {/* Line Edit Panel (Collapsible) */}
            {showLiveLineEdit && (
              <div className="stat-card">
                <h3 className="text-sm font-semibold mb-3">Redigera kedjor & målvakt</h3>
                <LineSetup
                  lines={game.lines}
                  squadPlayers={squadPlayers}
                  onUpdateLine={updateLine}
                  goalies={squadGoalies}
                  selectedGoalieId={game.activeGoalieId}
                  onSelectGoalie={setActiveGoalie}
                />
              </div>
            )}

            {/* Main Content: Tracking or Stats */}
            {liveView === 'tracking' ? (
              <LiveTracking
                game={game}
                squadPlayers={squadPlayers}
                homeStats={getHomeStats()}
                opponentStats={getOpponentStats()}
                periodHomeStats={getPeriodHomeStats()}
                periodOpponentStats={getPeriodOpponentStats()}
                onRecordEvent={recordEvent}
                onRecordPenalty={recordPenalty}
                onSetActiveLine={setActiveLine}
                onSetSituation={setCurrentSituation}
                onUndo={undoLast}
                onUpdatePlayerStat={updatePlayerStat}
                playerStats={game.playerStats}
              />
            ) : (
              <div className="space-y-4">
                {/* Live Score */}
                <div className="stat-card text-center py-4">
                  <p className="text-4xl font-bold">
                    {game.ourScore} - {game.opponentScore}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {PERIOD_LABELS[game.currentPeriod]} — Live
                  </p>
                </div>

                <CollapsibleSection title="Lagstatistik" icon={<BarChart3 className="h-5 w-5" />}>
                  <PostGameTeamStats
                    homeTeamName="Vårt lag"
                    opponentName={game.opponent}
                    getHomeStats={getHomeStats}
                    getOpponentStats={getOpponentStats}
                    homeScore={game.ourScore}
                    opponentScore={game.opponentScore}
                    onUpdateStats={handleUpdateTeamStats}
                  />
                </CollapsibleSection>

                {(() => {
                  const specialTeams = getSpecialTeamsStats();
                  return specialTeams.powerPlay && specialTeams.boxPlay ? (
                    <CollapsibleSection title="Specialteam" icon={<Zap className="h-5 w-5" />}>
                      <SpecialTeamsSummary
                        powerPlay={specialTeams.powerPlay}
                        boxPlay={specialTeams.boxPlay}
                      />
                    </CollapsibleSection>
                  ) : null;
                })()}

                <CollapsibleSection title="Spelarstatistik" icon={<User className="h-5 w-5" />}>
                  <PostGamePlayerStats
                    squadPlayers={squadPlayers.filter(p => !p.positions?.includes('Goalkeeper'))}
                    goalies={squadGoalies}
                    events={game.events}
                    penalties={game.penalties || []}
                    lines={game.lines}
                    playerStats={game.playerStats}
                    teamStats={getHomeStats()}
                    activeGoalieId={game.activeGoalieId || game.startingGoalieId}
                    onUpdatePlayerStat={updatePlayerStat}
                  />
                </CollapsibleSection>

                <CollapsibleSection title="Kedjeprestation" icon={<TrendingUp className="h-5 w-5" />}>
                  <EnhancedLinePerformance
                    lines={game.lines}
                    events={game.events}
                    squadPlayers={squadPlayers}
                  />
                </CollapsibleSection>
              </div>
            )}
          </div>
        )}

        {/* Post-Game View */}
        {game.status === 'Finished' && (
          <div className="space-y-6">
            {/* Final Score & Stats */}
            <div className="stat-card text-center py-6">
              <Trophy className={cn(
                'h-12 w-12 mx-auto mb-3',
                game.ourScore > game.opponentScore ? 'text-success' : 
                game.ourScore < game.opponentScore ? 'text-destructive' : 
                'text-muted-foreground'
              )} />
              <p className="text-5xl font-bold mb-2">
                {game.ourScore} - {game.opponentScore}
              </p>
              <p className={cn(
                'text-lg font-semibold',
                game.ourScore > game.opponentScore ? 'text-success' : 
                game.ourScore < game.opponentScore ? 'text-destructive' : 
                'text-muted-foreground'
              )}>
                {game.ourScore > game.opponentScore ? 'Vinst!' : 
                 game.ourScore < game.opponentScore ? 'Förlust' : 
                 'Oavgjort'}
              </p>
            </div>

            <CollapsibleSection title="Lagstatistik" icon={<BarChart3 className="h-5 w-5" />}>
              <PostGameTeamStats
                homeTeamName="Vårt lag"
                opponentName={game.opponent}
                getHomeStats={getHomeStats}
                getOpponentStats={getOpponentStats}
                homeScore={game.ourScore}
                opponentScore={game.opponentScore}
                onUpdateStats={handleUpdateTeamStats}
              />
            </CollapsibleSection>

            {(() => {
              const specialTeams = getSpecialTeamsStats();
              return specialTeams.powerPlay && specialTeams.boxPlay ? (
                <CollapsibleSection title="Specialteam" icon={<Zap className="h-5 w-5" />}>
                  <SpecialTeamsSummary
                    powerPlay={specialTeams.powerPlay}
                    boxPlay={specialTeams.boxPlay}
                  />
                </CollapsibleSection>
              ) : null;
            })()}

            <CollapsibleSection title="Spelarstatistik" icon={<User className="h-5 w-5" />}>
              <PostGamePlayerStats
                squadPlayers={squadPlayers.filter(p => !p.positions?.includes('Goalkeeper'))}
                goalies={squadGoalies}
                events={game.events}
                penalties={game.penalties || []}
                lines={game.lines}
                playerStats={game.playerStats}
                teamStats={getHomeStats()}
                activeGoalieId={game.activeGoalieId || game.startingGoalieId}
                onUpdatePlayerStat={updatePlayerStat}
              />
            </CollapsibleSection>

            <CollapsibleSection title="Kedjeprestation" icon={<TrendingUp className="h-5 w-5" />}>
              <EnhancedLinePerformance
                lines={game.lines}
                events={game.events}
                squadPlayers={squadPlayers}
              />
            </CollapsibleSection>

            <CollapsibleSection title="Matchanteckningar" icon={<FileText className="h-5 w-5" />}>
              <PostGameNotes
                game={game}
                onUpdateNotes={updateNotes}
              />
            </CollapsibleSection>

            <CollapsibleSection title="Måldetaljer" icon={<CircleDot className="h-5 w-5 text-success" />} defaultOpen={false}>
              <GoalDetailsEditor
                goalEvents={game.events.filter(e => e.type === 'goal')}
                squadPlayers={squadPlayers}
                onUpdateGoalDetails={updateGoalDetails}
              />
            </CollapsibleSection>

            <CollapsibleSection title="Utvisningar" icon={<AlertOctagon className="h-5 w-5 text-amber-500" />} defaultOpen={false}>
              <PenaltyEditor
                penalties={game.penalties || []}
                squadPlayers={squadPlayers}
                onAssignPenaltyPlayer={assignPenaltyPlayer}
              />
            </CollapsibleSection>

            <CollapsibleSection title="Media" icon={<ImageIcon className="h-5 w-5" />} defaultOpen={false}>
              <GameMediaSection
                media={game.mediaFiles || []}
                onAdd={addGameMedia}
                onRemove={removeGameMedia}
              />
            </CollapsibleSection>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
