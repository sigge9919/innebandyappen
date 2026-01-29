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

      {/* Stats Grid - Period and Game Totals side by side */}
      <div className="grid grid-cols-2 gap-3">
        {/* Current Period Stats */}
        <div className="border border-primary/30 rounded-lg p-2 bg-primary/5">
          <p className="text-xs font-medium text-primary mb-1.5 text-center">This Period</p>
          <div className="space-y-1 text-sm">
            <CompactStatRow label="Goals" home={periodHomeStats.goals} opponent={periodOpponentStats.goals} highlight />
            <CompactStatRow label="On Goal" home={periodHomeStats.shotsOnGoal} opponent={periodOpponentStats.shotsOnGoal} />
            <CompactStatRow label="Off/Blk" home={periodHomeStats.shotsOffGoal + periodHomeStats.shotsBlocked} opponent={periodOpponentStats.shotsOffGoal + periodOpponentStats.shotsBlocked} muted />
            <CompactStatRow label="Total" home={getTotalShots(periodHomeStats)} opponent={getTotalShots(periodOpponentStats)} bold />
          </div>
        </div>

        {/* Game Totals */}
        <div className="border border-border rounded-lg p-2">
          <p className="text-xs font-medium text-muted-foreground mb-1.5 text-center">Game Total</p>
          <div className="space-y-1 text-sm">
            <CompactStatRow label="Goals" home={homeScore} opponent={opponentScore} highlight />
            <CompactStatRow label="On Goal" home={totalHomeStats.shotsOnGoal} opponent={totalOpponentStats.shotsOnGoal} />
            <CompactStatRow label="Off/Blk" home={totalHomeStats.shotsOffGoal + totalHomeStats.shotsBlocked} opponent={totalOpponentStats.shotsOffGoal + totalOpponentStats.shotsBlocked} muted />
            <CompactStatRow label="Total" home={getTotalShots(totalHomeStats)} opponent={getTotalShots(totalOpponentStats)} bold />
          </div>
        </div>
      </div>
    </div>
  );
}

function CompactStatRow({ 
  label, 
  home, 
  opponent, 
  highlight = false,
  bold = false,
  muted = false
}: { 
  label: string; 
  home: number; 
  opponent: number; 
  highlight?: boolean;
  bold?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className={cn(
        "w-8 text-right",
        highlight && "text-success font-semibold",
        bold && "font-semibold",
        muted && "text-muted-foreground"
      )}>
        {home}
      </span>
      <span className={cn(
        "text-xs text-muted-foreground",
        bold && "font-medium text-foreground"
      )}>
        {label}
      </span>
      <span className={cn(
        "w-8 text-left",
        highlight && "text-destructive font-semibold",
        bold && "font-semibold",
        muted && "text-muted-foreground"
      )}>
        {opponent}
      </span>
    </div>
  );
}
