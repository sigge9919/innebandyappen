import { useState } from 'react';
import { Player } from '@/types';
import { EnhancedGame, Period, EventType, Team, TeamStats, GameSituation, getSituationLabel, LineStats } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Target, XCircle, Shield, CircleDot, Undo2, AlertOctagon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LivePeriodStats } from './LivePeriodStats';
import { calculateLineStats } from '@/lib/gameStorage';
import { GoalConfirmDialog, GoalConfirmData } from './GoalConfirmDialog';
import { PenaltyConfirmDialog } from './PenaltyConfirmDialog';
interface LiveTrackingProps {
  game: EnhancedGame;
  squadPlayers: Player[];
  homeStats: TeamStats;
  opponentStats: TeamStats;
  periodHomeStats: TeamStats;
  periodOpponentStats: TeamStats;
  onRecordEvent: (type: EventType, team: Team, goalDetails?: { scorerId?: string; assistPlayerIds?: string[]; lineId?: string }) => void;
  onRecordPenalty: (team: Team, playerId?: string) => void;
  onSetActiveLine: (lineId: string) => void;
  onSetSituation: (situation: GameSituation) => void;
  onUndo: () => void;
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
  'OT': 'Overtime',
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
}: LiveTrackingProps) {
  const [pendingGoal, setPendingGoal] = useState<{ team: Team } | null>(null);
  const [showPenaltyDialog, setShowPenaltyDialog] = useState(false);

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
    if (situation === '5v4') {
      return game.lines.filter(l => l.type === 'PP');
    } else if (situation === '4v5') {
      return game.lines.filter(l => l.type === 'PK');
    } else if (situation === '6v5') {
      return game.lines.filter(l => l.type === '6v5');
    } else if (situation === '5v6') {
      return game.lines.filter(l => l.type === '5v6');
    }
    return game.lines.filter(l => l.type === '5v5');
  };

  const relevantLines = getRelevantLines();
  const otherLines = game.lines.filter(l => !relevantLines.includes(l) && l.playerIds.length > 0);

  // Handle goal button click - open dialog
  const handleGoalClick = (team: Team) => {
    setPendingGoal({ team });
  };

  // Handle goal confirmation from dialog
  const handleGoalConfirm = (data: GoalConfirmData) => {
    if (!pendingGoal) return;
    
    onRecordEvent('goal', pendingGoal.team, {
      scorerId: data.scorerId,
      assistPlayerIds: data.assistPlayerIds,
      lineId: data.lineId,
    });
    
    setPendingGoal(null);
  };

  // Handle home team penalty button click - open dialog
  const handleHomePenaltyClick = () => {
    setShowPenaltyDialog(true);
  };

  // Handle penalty confirmation from dialog
  const handlePenaltyConfirm = (playerId?: string) => {
    onRecordPenalty('home', playerId);
    setShowPenaltyDialog(false);
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

      {/* Penalty Confirmation Dialog (Home Team Only) */}
      <PenaltyConfirmDialog
        open={showPenaltyDialog}
        onClose={() => setShowPenaltyDialog(false)}
        onConfirm={handlePenaltyConfirm}
        squadPlayers={squadPlayers}
      />

      {/* Live Period Stats - Always Visible */}
      <LivePeriodStats
        currentPeriod={game.currentPeriod}
        homeTeamName="Our Team"
        opponentName={game.opponent}
        periodHomeStats={periodHomeStats}
        periodOpponentStats={periodOpponentStats}
        totalHomeStats={homeStats}
        totalOpponentStats={opponentStats}
        homeScore={game.ourScore}
        opponentScore={game.opponentScore}
      />

      {/* Active Line & Situation - Combined Section */}
      <div className="space-y-3">
        {/* Line Selection */}
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm">Active Line</span>
          <div className="flex items-center gap-2">
            {activeLine && (
              <Badge variant="default" className="text-xs">
                {activeLine.name}
              </Badge>
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

      {/* Event Buttons - Two columns: Our Team / Opponent */}
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
            onClick={() => onRecordEvent('shot_on_goal', 'home')}
          />
          <EventButton
            icon={XCircle}
            label="Shot Off"
            variant="muted"
            onClick={() => onRecordEvent('shot_off_goal', 'home')}
          />
          <EventButton
            icon={Shield}
            label="Blocked"
            variant="muted"
            onClick={() => onRecordEvent('shot_blocked', 'home')}
          />
          {/* Penalty Button */}
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
            onClick={() => onRecordEvent('shot_blocked', 'opponent')}
          />
          {/* Penalty Button - Opponent (no dialog needed) */}
          <button
            onClick={() => onRecordPenalty('opponent')}
            className="w-full p-4 rounded-xl flex flex-col items-center gap-2 transition-all active:scale-95 border-2 border-amber-500 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 dark:text-amber-400 dark:border-amber-400"
          >
            <AlertOctagon className="h-8 w-8" />
            <span className="font-semibold text-sm">2 min Penalty</span>
          </button>
        </div>
      </div>

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
