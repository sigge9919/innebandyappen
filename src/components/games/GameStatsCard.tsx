import { TeamStats, getTotalShots } from '@/types/game';
import { cn } from '@/lib/utils';

interface GameStatsCardProps {
  homeTeamName: string;
  opponentName: string;
  homeStats: TeamStats;
  opponentStats: TeamStats;
  homeScore: number;
  opponentScore: number;
  className?: string;
}

export function GameStatsCard({
  homeTeamName,
  opponentName,
  homeStats,
  opponentStats,
  homeScore,
  opponentScore,
  className,
}: GameStatsCardProps) {
  return (
    <div className={cn('stat-card', className)}>
      {/* Score Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-center flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{homeTeamName}</p>
          <p className="text-4xl font-bold text-foreground">{homeScore}</p>
        </div>
        <div className="px-4">
          <span className="text-2xl font-light text-muted-foreground">-</span>
        </div>
        <div className="text-center flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{opponentName}</p>
          <p className="text-4xl font-bold text-foreground">{opponentScore}</p>
        </div>
      </div>

      {/* Stats Comparison */}
      <div className="space-y-3">
        <StatRow 
          label="Shots on Goal" 
          home={homeStats.shotsOnGoal} 
          opponent={opponentStats.shotsOnGoal} 
        />
        <StatRow 
          label="Shots Off Goal" 
          home={homeStats.shotsOffGoal} 
          opponent={opponentStats.shotsOffGoal} 
        />
        <StatRow 
          label="Blocked Shots" 
          home={homeStats.shotsBlocked} 
          opponent={opponentStats.shotsBlocked} 
        />
        <div className="border-t border-border pt-3">
          <StatRow 
            label="Total Shots" 
            home={getTotalShots(homeStats)} 
            opponent={getTotalShots(opponentStats)} 
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
  bold = false 
}: { 
  label: string; 
  home: number; 
  opponent: number; 
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn(
        'text-lg tabular-nums',
        bold ? 'font-bold' : 'font-medium',
        home > opponent ? 'text-success' : home < opponent ? 'text-destructive' : 'text-foreground'
      )}>
        {home}
      </span>
      <span className={cn(
        'text-sm text-muted-foreground',
        bold && 'font-semibold'
      )}>
        {label}
      </span>
      <span className={cn(
        'text-lg tabular-nums',
        bold ? 'font-bold' : 'font-medium',
        opponent > home ? 'text-success' : opponent < home ? 'text-destructive' : 'text-foreground'
      )}>
        {opponent}
      </span>
    </div>
  );
}
