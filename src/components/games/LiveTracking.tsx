import { Player } from '@/types';
import { EnhancedGame, Period, EventType, Team, TeamStats, GameSituation, getSituationLabel } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Target, XCircle, Shield, CircleDot, Undo2, AlertOctagon } from 'lucide-react';
import { LivePeriodStats } from './LivePeriodStats';

interface LiveTrackingProps {
  game: EnhancedGame;
  squadPlayers: Player[];
  homeStats: TeamStats;
  opponentStats: TeamStats;
  periodHomeStats: TeamStats;
  periodOpponentStats: TeamStats;
  onRecordEvent: (type: EventType, team: Team) => void;
  onRecordPenalty: (team: Team) => void;
  onSetActiveLine: (lineId: string) => void;
  onSetSituation: (situation: GameSituation) => void;
  onUndo: () => void;
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
  const activeLine = game.lines.find(l => l.id === game.activeLineId);
  const activeLinePlayers = activeLine 
    ? squadPlayers.filter(p => activeLine.playerIds.includes(p.id))
    : [];

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

  return (
    <div className="space-y-4">

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
          {relevantLines.map(line => (
            <Button
              key={line.id}
              variant={game.activeLineId === line.id ? 'default' : 'outline'}
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => onSetActiveLine(line.id)}
            >
              {line.name}
            </Button>
          ))}
          {otherLines.map(line => (
            <Button
              key={line.id}
              variant={game.activeLineId === line.id ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => onSetActiveLine(line.id)}
            >
              {line.name}
            </Button>
          ))}
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
            onClick={() => onRecordEvent('goal', 'home')}
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
            onClick={() => onRecordPenalty('home')}
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
            onClick={() => onRecordEvent('goal', 'opponent')}
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
          {/* Penalty Button */}
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
