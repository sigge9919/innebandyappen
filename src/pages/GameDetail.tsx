import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGameDetail } from '@/hooks/useEnhancedGames';
import { usePlayers } from '@/hooks/useLocalStorage';
import { SquadSelection } from '@/components/games/SquadSelection';
import { LineSetup } from '@/components/games/LineSetup';
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
import { Period, Team, TeamStats, GameSituation } from '@/types/game';
import { format } from 'date-fns';
import { ArrowLeft, Play, MapPin, Calendar, Trophy, BarChart3, Zap, CircleDot, AlertOctagon, User, TrendingUp, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function GameDetail() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { players } = usePlayers();
  
  const {
    game,
    updateSquad,
    updateLine,
    startGame,
    endGame,
    setActiveLine,
    setCurrentPeriod,
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
  } = useGameDetail(gameId || '');

  if (!game) {
    return (
      <AppLayout>
        <div className="page-container">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Game not found</p>
            <Button className="mt-4" onClick={() => navigate('/games')}>
              Back to Games
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const squadPlayers = players.filter(p => game.squadPlayerIds.includes(p.id));
  const canStartGame = game.squadPlayerIds.length > 0;

  const statusColor = {
    'Not Started': 'bg-muted text-muted-foreground',
    'Live': 'bg-success/10 text-success border border-success',
    'Finished': 'bg-primary/10 text-primary',
  }[game.status];

  const handleUpdateTeamStats = (team: Team, period: Period, stats: Partial<TeamStats>) => {
    updateTeamPeriodStats(team, period, stats);
  };

  // Get blocked shot events for attribution
  const blockedShotEvents = game.events.filter(e => e.type === 'shot_blocked');

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
              <Badge className={statusColor}>{game.status}</Badge>
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(game.date), 'EEE, MMM d, yyyy')}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {game.location}
              </span>
            </div>
          </div>
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

            {/* Line Setup */}
            {game.squadPlayerIds.length > 0 && (
              <div className="stat-card">
                <h3 className="text-lg font-semibold mb-4">Line Setup</h3>
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
              Start Game
            </Button>
            {!canStartGame && (
              <p className="text-center text-sm text-muted-foreground">
                Select at least one player to start the game
              </p>
            )}
          </div>
        )}

        {/* Live Game View */}
        {game.status === 'Live' && (
          <LiveTracking
            game={game}
            squadPlayers={squadPlayers}
            homeStats={getHomeStats()}
            opponentStats={getOpponentStats()}
            periodHomeStats={getPeriodHomeStats()}
            periodOpponentStats={getPeriodOpponentStats()}
            onRecordEvent={recordEvent}
            onRecordPenalty={recordPenalty}
            onSetPeriod={setCurrentPeriod}
            onSetActiveLine={setActiveLine}
            onSetSituation={setCurrentSituation}
            onUndo={undoLast}
            onEndGame={endGame}
          />
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
                {game.ourScore > game.opponentScore ? 'Victory!' : 
                 game.ourScore < game.opponentScore ? 'Defeat' : 
                 'Draw'}
              </p>
            </div>

            {/* Team Stats Editing */}
            <CollapsibleSection title="Team Statistics" icon={<BarChart3 className="h-5 w-5" />}>
              <PostGameTeamStats
                homeTeamName="Our Team"
                opponentName={game.opponent}
                getHomeStats={getHomeStats}
                getOpponentStats={getOpponentStats}
                homeScore={game.ourScore}
                opponentScore={game.opponentScore}
                onUpdateStats={handleUpdateTeamStats}
              />
            </CollapsibleSection>

            {/* Special Teams Summary */}
            {(() => {
              const specialTeams = getSpecialTeamsStats();
              return specialTeams.powerPlay && specialTeams.boxPlay ? (
                <CollapsibleSection title="Special Teams Summary" icon={<Zap className="h-5 w-5" />}>
                  <SpecialTeamsSummary
                    powerPlay={specialTeams.powerPlay}
                    boxPlay={specialTeams.boxPlay}
                  />
                </CollapsibleSection>
              ) : null;
            })()}

            {/* Goal Details Editing */}
            <CollapsibleSection title="Goal Details" icon={<CircleDot className="h-5 w-5 text-success" />}>
              <GoalDetailsEditor
                goalEvents={game.events.filter(e => e.type === 'goal')}
                squadPlayers={squadPlayers}
                onUpdateGoalDetails={updateGoalDetails}
              />
            </CollapsibleSection>

            {/* Penalty Attribution */}
            <CollapsibleSection title="Penalty Attribution" icon={<AlertOctagon className="h-5 w-5 text-amber-500" />}>
              <PenaltyEditor
                penalties={game.penalties || []}
                squadPlayers={squadPlayers}
                onAssignPenaltyPlayer={assignPenaltyPlayer}
              />
            </CollapsibleSection>

            {/* Player Stats */}
            <CollapsibleSection title="Player Statistics" icon={<User className="h-5 w-5" />}>
              <PostGamePlayerStats
                squadPlayers={squadPlayers}
                events={game.events}
                penalties={game.penalties || []}
                lines={game.lines}
                blockedShotEvents={blockedShotEvents}
                playerStats={game.playerStats}
                onAssignBlockedShot={assignBlockedShot}
                onUpdatePlayerStat={updatePlayerStat}
              />
            </CollapsibleSection>

            {/* Line Performance */}
            <CollapsibleSection title="Line Performance" icon={<TrendingUp className="h-5 w-5" />}>
              <EnhancedLinePerformance
                lines={game.lines}
                events={game.events}
              />
            </CollapsibleSection>

            {/* Post-Game Notes */}
            <CollapsibleSection title="Post-Game Notes" icon={<FileText className="h-5 w-5" />}>
              <PostGameNotes
                game={game}
                onUpdateNotes={updateNotes}
              />
            </CollapsibleSection>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
