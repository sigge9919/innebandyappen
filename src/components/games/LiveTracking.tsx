import { useState } from 'react';
import { Player } from '@/types';
import { EnhancedGame, Period, EventType, Team, TeamStats, GameSituation, getSituationLabel, LineStats, PlayerGameStats } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Target, XCircle, Shield, CircleDot, Undo2, AlertOctagon, TrendingUp, TrendingDown, Minus, Crosshair } from 'lucide-react';
import { LivePeriodStats } from './LivePeriodStats';
import { calculateLineStats } from '@/lib/gameStorage';
import { GoalConfirmDialog, GoalConfirmData } from './GoalConfirmDialog';
import { PenaltyConfirmDialog } from './PenaltyConfirmDialog';
import { ShotPlayerDialog } from './ShotPlayerDialog';
import { PenaltyShotDialog, PenaltyShotResult } from './PenaltyShotDialog';

interface LiveTrackingProps {
  game: EnhancedGame;
  squadPlayers: Player[];
  homeStats: TeamStats;
  opponentStats: TeamStats;
  periodHomeStats: TeamStats;
  periodOpponentStats: TeamStats;
  onRecordEvent: (type: EventType, team: Team, goalDetails?: { scorerId?: string; assistPlayerIds?: string[]; lineId?: string; situationOverride?: GameSituation }) => void;
  onRecordPenalty: (team: Team, playerId?: string) => void;
  onSetActiveLine: (lineId: string) => void;
  onSetSituation: (situation: GameSituation) => void;
  onUndo: () => void;
  onUpdatePlayerStat?: (playerId: string, field: keyof Omit<PlayerGameStats, 'playerId'>, value: number) => void;
  playerStats?: PlayerGameStats[];
}

function LiveLinePlusMinus({ value }: { value: number }) {
  const Icon = value > 0 ? TrendingUp : value < 0 ? TrendingDown : Minus;
  
  return (
    <span className={cn(
      "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-bold",
      value > 0 && "bg-success/10 text-success",
      value < 0 && "bg-destructive/10 text-destructive",
      value === 0 && "bg-muted text-muted-foreground"
    )}>
      <Icon className="h-3 w-3" />
      {value > 0 ? '+' : ''}{value}
    </span>
  );
}

const PERIOD_LABELS: Record<Period, string> = {
  '1': 'Period 1',
  '2': 'Period 2',
  '3': 'Period 3',
  'OT': 'Övertid',
};

export function LiveTracking({
  game,
  squadPlayers,
  homeStats,
  opponentStats,
  periodHomeStats,
  periodOpponentStats,
  onRecordEvent,
  onRecordPenalty,
  onSetActiveLine,
  onSetSituation,
  onUndo,
  onUpdatePlayerStat,
  playerStats = [],
}: LiveTrackingProps) {
  const [pendingGoal, setPendingGoal] = useState<{ team: Team } | null>(null);
  const [showPenaltyDialog, setShowPenaltyDialog] = useState(false);
  const [showPenaltyShotDialog, setShowPenaltyShotDialog] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [pendingShot, setPendingShot] = useState<{ type: 'shot_on_goal' | 'shot_off_goal' | 'shot_blocked' | 'defensive_block'; team: Team } | null>(null);

  const activeLine = game.lines.find(l => l.id === game.activeLineId);
  const activeLinePlayers = activeLine 
    ? squadPlayers.filter(p => activeLine.playerIds.includes(p.id))
    : [];

  // Calculate live line stats
  const lineStats = calculateLineStats(game.events, game.lines);
  const getLineStats = (lineId: string): LineStats | undefined => 
    lineStats.find(ls => ls.lineId === lineId);

  // Get lines based on current situation
  const getRelevantLines = () => {
    const situation = game.currentSituation || '5v5';
    if (situation === '5v4') return game.lines.filter(l => l.type === 'PP');
    if (situation === '4v5') return game.lines.filter(l => l.type === 'PK');
    if (situation === '6v5') return game.lines.filter(l => l.type === '6v5');
    if (situation === '5v6') return game.lines.filter(l => l.type === '5v6');
    return game.lines.filter(l => l.type === '5v5');
  };

  const relevantLines = getRelevantLines();
  const otherLines = game.lines.filter(l => !relevantLines.includes(l) && l.playerIds.length > 0);

  const handleGoalClick = (team: Team) => setPendingGoal({ team });

  const handleGoalConfirm = (data: GoalConfirmData) => {
    if (!pendingGoal) return;
    onRecordEvent('goal', pendingGoal.team, {
      scorerId: data.scorerId,
      assistPlayerIds: data.assistPlayerIds,
      lineId: data.lineId,
    });

    // Auto-add SOG for the goal scorer (same as advanced mode shot attribution)
    if (pendingGoal.team === 'home' && data.scorerId && onUpdatePlayerStat) {
      const currentStats = playerStats?.find(ps => ps.playerId === data.scorerId);
      const currentValue = currentStats?.shotsOnGoal || 0;
      onUpdatePlayerStat(data.scorerId, 'shotsOnGoal', currentValue + 1);
    }

    setPendingGoal(null);
  };

  const handleHomePenaltyClick = () => setShowPenaltyDialog(true);

  const handlePenaltyConfirm = (playerId?: string) => {
    onRecordPenalty('home', playerId);
    setShowPenaltyDialog(false);
  };

  // Handle shot button clicks - in advanced mode, show player dialog
  const handleShotClick = (type: EventType, team: Team) => {
    if (advancedMode && onUpdatePlayerStat) {
      // Home team SOG/Miss/Blk → attribute to our player
      if (team === 'home' && (type === 'shot_on_goal' || type === 'shot_off_goal' || type === 'shot_blocked')) {
        setPendingShot({ type: type as 'shot_on_goal' | 'shot_off_goal' | 'shot_blocked', team });
        return;
      }
      // Opponent blocked → attribute defensive block to our player
      if (team === 'opponent' && type === 'shot_blocked') {
        setPendingShot({ type: 'defensive_block', team });
        return;
      }
    }
    // Simple mode or non-attributed shots
    onRecordEvent(type, team);
  };

  // Handle shot player confirmation
  const handleShotPlayerConfirm = (playerId?: string) => {
    if (!pendingShot || !playerId || !onUpdatePlayerStat) return;

    if (pendingShot.type === 'defensive_block') {
      // Record the opponent blocked event and increment player's defensive blocks
      onRecordEvent('shot_blocked', 'opponent');
      const currentStats = playerStats.find(ps => ps.playerId === playerId);
      const currentValue = currentStats?.defensiveBlocks || 0;
      onUpdatePlayerStat(playerId, 'defensiveBlocks', currentValue + 1);
    } else {
      // Record the home shot event and increment player's shot stat
      onRecordEvent(pendingShot.type, 'home');
      const fieldMap: Record<string, keyof Omit<PlayerGameStats, 'playerId'>> = {
        shot_on_goal: 'shotsOnGoal',
        shot_off_goal: 'shotsOffGoal',
        shot_blocked: 'shotsBlocked',
      };
      const field = fieldMap[pendingShot.type];
      if (field) {
        const currentStats = playerStats.find(ps => ps.playerId === playerId);
        const currentValue = (currentStats?.[field] as number) || 0;
        onUpdatePlayerStat(playerId, field, currentValue + 1);
      }
    }

    setPendingShot(null);
  };

  // Handle penalty shot confirmation
  const handlePenaltyShotConfirm = (result: PenaltyShotResult) => {
    if (result.scored) {
      // Record goal with PS situation (goal already counts as SOG in stats)
      onRecordEvent('goal', result.shootingTeam, { situationOverride: 'PS', scorerId: result.playerId });
    } else {
      // Only record SOG when not scored (to avoid double-counting)
      onRecordEvent('shot_on_goal', result.shootingTeam, { situationOverride: 'PS', scorerId: result.playerId });
    }

    // Update manual player stats if our team is shooting
    if (result.shootingTeam === 'home' && result.playerId && onUpdatePlayerStat) {
      const currentStats = playerStats.find(ps => ps.playerId === result.playerId);
      const currentSOG = currentStats?.shotsOnGoal || 0;
      onUpdatePlayerStat(result.playerId, 'shotsOnGoal', currentSOG + 1);

      if (result.scored) {
        const currentGoals = currentStats?.goals || 0;
        onUpdatePlayerStat(result.playerId, 'goals', currentGoals + 1);
      }
    }

    setShowPenaltyShotDialog(false);
  };

  return (
    <div className="space-y-4">
      {/* Goal Confirmation Dialog */}
      <GoalConfirmDialog
        open={pendingGoal !== null}
        onClose={() => setPendingGoal(null)}
        onConfirm={handleGoalConfirm}
        team={pendingGoal?.team || 'home'}
        squadPlayers={squadPlayers}
        lines={game.lines}
        activeLineId={game.activeLineId}
        opponentName={game.opponent}
      />

      {/* Penalty Confirmation Dialog */}
      <PenaltyConfirmDialog
        open={showPenaltyDialog}
        onClose={() => setShowPenaltyDialog(false)}
        onConfirm={handlePenaltyConfirm}
        squadPlayers={squadPlayers}
      />

      {/* Shot Player Attribution Dialog */}
      <ShotPlayerDialog
        open={pendingShot !== null}
        onClose={() => setPendingShot(null)}
        onConfirm={handleShotPlayerConfirm}
        shotType={pendingShot?.type || 'shot_on_goal'}
        squadPlayers={squadPlayers}
        lines={game.lines}
        activeLineId={game.activeLineId}
      />

      {/* Penalty Shot Dialog */}
      <PenaltyShotDialog
        open={showPenaltyShotDialog}
        onClose={() => setShowPenaltyShotDialog(false)}
        onConfirm={handlePenaltyShotConfirm}
        squadPlayers={squadPlayers}
        opponentName={game.opponent}
      />

      {/* Live Period Stats */}
      <LivePeriodStats
        currentPeriod={game.currentPeriod}
        homeTeamName="Vårt lag"
        opponentName={game.opponent}
        periodHomeStats={periodHomeStats}
        periodOpponentStats={periodOpponentStats}
        totalHomeStats={homeStats}
        totalOpponentStats={opponentStats}
        homeScore={game.ourScore}
        opponentScore={game.opponentScore}
      />

      {/* Active Line & Situation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm">Aktiv kedja</span>
          <div className="flex items-center gap-2">
            {activeLine && (
              <Badge variant="default" className="text-xs">{activeLine.name}</Badge>
            )}
            {activeLinePlayers.length > 0 && (
              <div className="flex gap-1">
                {activeLinePlayers.map(player => (
                  <Badge key={player.id} variant="secondary" className="text-xs">
                    #{player.jerseyNumber}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-1.5 flex-wrap">
          {relevantLines.map(line => {
            const stats = getLineStats(line.id);
            return (
              <Button
                key={line.id}
                variant={game.activeLineId === line.id ? 'default' : 'outline'}
                size="sm"
                className="h-8 px-3 text-xs gap-1.5"
                onClick={() => onSetActiveLine(line.id)}
              >
                {line.name}
                {stats && <LiveLinePlusMinus value={stats.plusMinus} />}
              </Button>
            );
          })}
          {otherLines.map(line => {
            const stats = getLineStats(line.id);
            return (
              <Button
                key={line.id}
                variant={game.activeLineId === line.id ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8 px-3 text-xs gap-1.5"
                onClick={() => onSetActiveLine(line.id)}
              >
                {line.name}
                {stats && <LiveLinePlusMinus value={stats.plusMinus} />}
              </Button>
            );
          })}
        </div>

        {/* Situation Selection */}
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm">Situation</span>
          <Badge 
            variant={game.currentSituation === '5v4' ? 'default' : game.currentSituation === '4v5' ? 'destructive' : 'secondary'}
            className="text-xs"
          >
            {getSituationLabel(game.currentSituation || '5v5')}
          </Badge>
        </div>
        
        <div className="flex gap-1.5">
          {(['5v5', '5v4', '4v5', '6v5', '5v6'] as GameSituation[]).map(situation => (
            <Button
              key={situation}
              variant={(game.currentSituation || '5v5') === situation ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'flex-1 h-8 text-xs font-semibold',
                (game.currentSituation || '5v5') === situation && situation === '5v4' && 'bg-success hover:bg-success/90 text-success-foreground',
                (game.currentSituation || '5v5') === situation && situation === '4v5' && 'bg-destructive hover:bg-destructive/90'
              )}
              onClick={() => onSetSituation(situation)}
            >
              {situation}
            </Button>
          ))}
        </div>
      </div>

      {/* Event Buttons */}
      <div className="grid grid-cols-2 gap-4">
        {/* Our Team */}
        <div className="space-y-3">
          <h4 className="text-center font-semibold text-foreground">Our Team</h4>
          <EventButton
            icon={CircleDot}
            label="Goal"
            variant="success"
            onClick={() => handleGoalClick('home')}
          />
          <EventButton
            icon={Target}
            label="Shot on Goal"
            onClick={() => handleShotClick('shot_on_goal', 'home')}
          />
          <EventButton
            icon={XCircle}
            label="Shot Off"
            variant="muted"
            onClick={() => handleShotClick('shot_off_goal', 'home')}
          />
          <EventButton
            icon={Shield}
            label="Blocked"
            variant="muted"
            onClick={() => handleShotClick('shot_blocked', 'home')}
          />
          <button
            onClick={handleHomePenaltyClick}
            className="w-full p-4 rounded-xl flex flex-col items-center gap-2 transition-all active:scale-95 border-2 border-amber-500 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 dark:text-amber-400 dark:border-amber-400"
          >
            <AlertOctagon className="h-8 w-8" />
            <span className="font-semibold text-sm">2 min Penalty</span>
          </button>
        </div>

        {/* Opponent */}
        <div className="space-y-3">
          <h4 className="text-center font-semibold text-foreground">{game.opponent}</h4>
          <EventButton
            icon={CircleDot}
            label="Goal"
            variant="destructive"
            onClick={() => handleGoalClick('opponent')}
          />
          <EventButton
            icon={Target}
            label="Shot on Goal"
            onClick={() => onRecordEvent('shot_on_goal', 'opponent')}
          />
          <EventButton
            icon={XCircle}
            label="Shot Off"
            variant="muted"
            onClick={() => onRecordEvent('shot_off_goal', 'opponent')}
          />
          <EventButton
            icon={Shield}
            label="Blocked"
            variant="muted"
            onClick={() => handleShotClick('shot_blocked', 'opponent')}
          />
          <button
            onClick={() => onRecordPenalty('opponent')}
            className="w-full p-4 rounded-xl flex flex-col items-center gap-2 transition-all active:scale-95 border-2 border-amber-500 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 dark:text-amber-400 dark:border-amber-400"
          >
            <AlertOctagon className="h-8 w-8" />
            <span className="font-semibold text-sm">2 min Penalty</span>
          </button>
        </div>
      </div>

      {/* Penalty Shot Button */}
      <button
        onClick={() => setShowPenaltyShotDialog(true)}
        className="w-full p-4 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95 border-2 border-primary bg-primary/10 text-primary hover:bg-primary/20"
      >
        <Crosshair className="h-6 w-6" />
        <span className="font-semibold">Penalty Shot</span>
      </button>

      {/* Undo */}
      {game.events.length > 0 && (
        <Button 
          variant="outline" 
          className="w-full gap-2"
          onClick={onUndo}
        >
          <Undo2 className="h-4 w-4" />
          Undo Last Event
        </Button>
      )}

      {/* Simple / Advanced Toggle */}
      <div className="flex items-center justify-between px-2 py-3 rounded-lg bg-muted/50 border border-border">
        <span className="text-sm font-medium text-muted-foreground">
          {advancedMode ? 'Advanced Stats' : 'Simple Stats'}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Simple</span>
          <Switch
            checked={advancedMode}
            onCheckedChange={setAdvancedMode}
          />
          <span className="text-xs text-muted-foreground">Advanced</span>
        </div>
      </div>
      {advancedMode && (
        <p className="text-xs text-muted-foreground text-center -mt-2">
          Shots will be attributed to individual players
        </p>
      )}
    </div>
  );
}

function EventButton({
  icon: Icon,
  label,
  variant = 'default',
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  variant?: 'default' | 'success' | 'destructive' | 'muted';
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-4 rounded-xl flex flex-col items-center gap-2 transition-all active:scale-95',
        variant === 'success' && 'bg-success/10 text-success hover:bg-success/20 border-2 border-success',
        variant === 'destructive' && 'bg-destructive/10 text-destructive hover:bg-destructive/20 border-2 border-destructive',
        variant === 'default' && 'bg-primary/10 text-primary hover:bg-primary/20 border-2 border-primary',
        variant === 'muted' && 'bg-muted text-muted-foreground hover:bg-muted/80 border border-border'
      )}
    >
      <Icon className="h-8 w-8" />
      <span className="font-semibold text-sm">{label}</span>
    </button>
  );
}
