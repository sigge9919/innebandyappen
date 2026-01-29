import { Period, TeamStats, getTotalShots } from '@/types/game';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LivePeriodStatsProps {
  currentPeriod: Period;
  homeTeamName: string;
  opponentName: string;
  periodHomeStats: TeamStats;
  periodOpponentStats: TeamStats;
  totalHomeStats: TeamStats;
  totalOpponentStats: TeamStats;
  homeScore: number;
  opponentScore: number;
}

const PERIOD_LABELS: Record<Period, string> = {
  '1': 'Period 1',
  '2': 'Period 2',
  '3': 'Period 3',
  'OT': 'Overtime',
};

export function LivePeriodStats({
  currentPeriod,
  homeTeamName,
  opponentName,
  periodHomeStats,
  periodOpponentStats,
  totalHomeStats,
  totalOpponentStats,
  homeScore,
  opponentScore,
}: LivePeriodStatsProps) {
  return (
    <div className="stat-card space-y-4">
      {/* Score Header */}
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <p className="text-sm text-muted-foreground">{homeTeamName}</p>
          <p className="text-4xl font-bold text-foreground">{homeScore}</p>
        </div>
        <Badge variant="default" className="mx-4 text-lg px-4 py-1">
          {PERIOD_LABELS[currentPeriod]}
        </Badge>
        <div className="text-center flex-1">
          <p className="text-sm text-muted-foreground">{opponentName}</p>
          <p className="text-4xl font-bold text-foreground">{opponentScore}</p>
        </div>
      </div>

      {/* Current Period Stats */}
      <div className="border border-border rounded-lg p-3 bg-primary/5">
        <p className="text-xs font-medium text-primary mb-2 text-center">Current Period Stats</p>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <StatRow 
            label="Goals" 
            home={periodHomeStats.goals} 
            opponent={periodOpponentStats.goals}
            highlight
          />
          <StatRow 
            label="On Goal" 
            home={periodHomeStats.shotsOnGoal} 
            opponent={periodOpponentStats.shotsOnGoal} 
          />
          <StatRow 
            label="Off Goal" 
            home={periodHomeStats.shotsOffGoal} 
            opponent={periodOpponentStats.shotsOffGoal} 
          />
          <StatRow 
            label="Blocked" 
            home={periodHomeStats.shotsBlocked} 
            opponent={periodOpponentStats.shotsBlocked} 
          />
          <StatRow 
            label="Total Shots" 
            home={getTotalShots(periodHomeStats)} 
            opponent={getTotalShots(periodOpponentStats)}
            bold
          />
        </div>
      </div>

      {/* Game Total Stats (Secondary) */}
      <div className="border border-border rounded-lg p-3 opacity-75">
        <p className="text-xs font-medium text-muted-foreground mb-2 text-center">Game Totals</p>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <StatRow 
            label="On Goal" 
            home={totalHomeStats.shotsOnGoal} 
            opponent={totalOpponentStats.shotsOnGoal} 
          />
          <StatRow 
            label="Off Goal" 
            home={totalHomeStats.shotsOffGoal} 
            opponent={totalOpponentStats.shotsOffGoal} 
          />
          <StatRow 
            label="Blocked" 
            home={totalHomeStats.shotsBlocked} 
            opponent={totalOpponentStats.shotsBlocked} 
          />
          <StatRow 
            label="Total Shots" 
            home={getTotalShots(totalHomeStats)} 
            opponent={getTotalShots(totalOpponentStats)}
            bold
          />
        </div>
      </div>
    </div>
  );
}

function StatRow({ 
  label, 
  home, 
  opponent, 
  highlight = false,
  bold = false
}: { 
  label: string; 
  home: number; 
  opponent: number; 
  highlight?: boolean;
  bold?: boolean;
}) {
  return (
    <>
      <div className={cn(
        "text-right",
        highlight && "text-success font-semibold",
        bold && "font-semibold"
      )}>
        {home}
      </div>
      <div className={cn(
        "text-center text-muted-foreground text-xs",
        bold && "font-medium text-foreground"
      )}>
        {label}
      </div>
      <div className={cn(
        "text-left",
        highlight && "text-destructive font-semibold",
        bold && "font-semibold"
      )}>
        {opponent}
      </div>
    </>
  );
}
