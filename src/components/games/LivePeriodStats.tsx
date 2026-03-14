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
  'OT': 'Övertid',
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

      {/* Unified Stats Box */}
      <div className="border border-border rounded-lg p-3 bg-primary/5">
        {/* Column Headers */}
        <div className="grid grid-cols-5 gap-2 text-xs text-muted-foreground mb-2">
          <div className="text-center">Match</div>
          <div className="text-center text-primary font-medium">Period</div>
          <div></div>
          <div className="text-center text-primary font-medium">Period</div>
          <div className="text-center">Match</div>
        </div>
        
        {/* Stats Rows */}
        <div className="space-y-1.5">
          <UnifiedStatRow 
            label="Mål" 
            homePeriod={periodHomeStats.goals} 
            homeTotal={totalHomeStats.goals}
            opponentPeriod={periodOpponentStats.goals}
            opponentTotal={totalOpponentStats.goals}
            highlight
          />
          <UnifiedStatRow 
            label="På mål" 
            homePeriod={periodHomeStats.shotsOnGoal} 
            homeTotal={totalHomeStats.shotsOnGoal}
            opponentPeriod={periodOpponentStats.shotsOnGoal}
            opponentTotal={totalOpponentStats.shotsOnGoal}
          />
          <UnifiedStatRow 
            label="Utanför" 
            homePeriod={periodHomeStats.shotsOffGoal} 
            homeTotal={totalHomeStats.shotsOffGoal}
            opponentPeriod={periodOpponentStats.shotsOffGoal}
            opponentTotal={totalOpponentStats.shotsOffGoal}
          />
          <UnifiedStatRow 
            label="Blockerat" 
            homePeriod={periodHomeStats.shotsBlocked} 
            homeTotal={totalHomeStats.shotsBlocked}
            opponentPeriod={periodOpponentStats.shotsBlocked}
            opponentTotal={totalOpponentStats.shotsBlocked}
          />
          <div className="border-t border-border pt-1.5">
            <UnifiedStatRow 
              label="Totala skott" 
              homePeriod={getTotalShots(periodHomeStats)} 
              homeTotal={getTotalShots(totalHomeStats)}
              opponentPeriod={getTotalShots(periodOpponentStats)}
              opponentTotal={getTotalShots(totalOpponentStats)}
              bold
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function UnifiedStatRow({ 
  label, 
  homePeriod,
  homeTotal,
  opponentPeriod,
  opponentTotal,
  highlight = false,
  bold = false
}: { 
  label: string; 
  homePeriod: number;
  homeTotal: number;
  opponentPeriod: number;
  opponentTotal: number;
  highlight?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="grid grid-cols-5 gap-2 text-sm items-center">
      <div className={cn(
        "text-center text-muted-foreground",
        bold && "font-semibold text-foreground"
      )}>
        {homeTotal}
      </div>
      <div className={cn(
        "text-center font-medium",
        highlight && "text-success font-bold",
        bold && "font-bold"
      )}>
        {homePeriod}
      </div>
      <div className={cn(
        "text-center text-muted-foreground text-xs",
        bold && "font-semibold text-foreground"
      )}>
        {label}
      </div>
      <div className={cn(
        "text-center font-medium",
        highlight && "text-destructive font-bold",
        bold && "font-bold"
      )}>
        {opponentPeriod}
      </div>
      <div className={cn(
        "text-center text-muted-foreground",
        bold && "font-semibold text-foreground"
      )}>
        {opponentTotal}
      </div>
    </div>
  );
}
