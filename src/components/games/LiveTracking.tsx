import { useState } from 'react';
import { Player } from '@/types';
import { EnhancedGame, Period, EventType, Team, TeamStats, getTotalShots } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Target, XCircle, Shield, CircleDot, Undo2, Clock } from 'lucide-react';
import { GameStatsCard } from './GameStatsCard';

interface LiveTrackingProps {
  game: EnhancedGame;
  squadPlayers: Player[];
  homeStats: TeamStats;
  opponentStats: TeamStats;
  onRecordEvent: (type: EventType, team: Team) => void;
  onSetPeriod: (period: Period) => void;
  onSetActiveLine: (lineId: string) => void;
  onUndo: () => void;
  onEndGame: () => void;
}

const PERIODS: { value: Period; label: string }[] = [
  { value: '1', label: 'P1' },
  { value: '2', label: 'P2' },
  { value: '3', label: 'P3' },
  { value: 'OT', label: 'OT' },
];

export function LiveTracking({
  game,
  squadPlayers,
  homeStats,
  opponentStats,
  onRecordEvent,
  onSetPeriod,
  onSetActiveLine,
  onUndo,
  onEndGame,
}: LiveTrackingProps) {
  const activeLine = game.lines.find(l => l.id === game.activeLineId);
  const activeLinePlayers = activeLine 
    ? squadPlayers.filter(p => activeLine.playerIds.includes(p.id))
    : [];

  // Get 5v5 lines for quick selection
  const regularLines = game.lines.filter(l => l.type === '5v5');
  const specialLines = game.lines.filter(l => l.type !== '5v5');

  return (
    <div className="space-y-6">
      {/* Stats Card */}
      <GameStatsCard
        homeTeamName="Our Team"
        opponentName={game.opponent}
        homeStats={homeStats}
        opponentStats={opponentStats}
        homeScore={game.ourScore}
        opponentScore={game.opponentScore}
      />

      {/* Period Control */}
      <div className="stat-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <span className="font-semibold">Period</span>
          </div>
          <Button variant="destructive" size="sm" onClick={onEndGame}>
            End Game
          </Button>
        </div>
        <div className="flex gap-2">
          {PERIODS.map(period => (
            <Button
              key={period.value}
              variant={game.currentPeriod === period.value ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => onSetPeriod(period.value)}
            >
              {period.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Active Line Selection */}
      <div className="stat-card">
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold">Active Line</span>
          {activeLine && (
            <Badge variant="default" className="text-sm">
              {activeLine.name}
            </Badge>
          )}
        </div>
        
        {/* Regular lines */}
        <div className="flex gap-2 mb-2">
          {regularLines.map(line => (
            <Button
              key={line.id}
              variant={game.activeLineId === line.id ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
              onClick={() => onSetActiveLine(line.id)}
            >
              {line.name}
            </Button>
          ))}
        </div>
        
        {/* Special teams */}
        <div className="flex gap-2 flex-wrap">
          {specialLines.filter(l => l.playerIds.length > 0).map(line => (
            <Button
              key={line.id}
              variant={game.activeLineId === line.id ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onSetActiveLine(line.id)}
            >
              {line.name}
            </Button>
          ))}
        </div>

        {/* Active line players */}
        {activeLinePlayers.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex flex-wrap gap-1.5">
              {activeLinePlayers.map(player => (
                <Badge key={player.id} variant="secondary">
                  #{player.jerseyNumber} {player.name.split(' ')[0]}
                </Badge>
              ))}
            </div>
          </div>
        )}
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
