import { LineStats, PeriodStats, Period } from '@/types/game';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface LinePerformanceProps {
  lineStats: LineStats[];
  periodStats: PeriodStats[];
  className?: string;
}

export function LinePerformance({ lineStats, periodStats, className }: LinePerformanceProps) {
  if (lineStats.length === 0) {
    return (
      <div className={cn('stat-card text-center py-8', className)}>
        <p className="text-muted-foreground">Ingen kedjestatistik registrerad ännu</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Line Stats Summary */}
      <div className="stat-card">
        <h3 className="font-semibold mb-4">Line Performance</h3>
        <div className="space-y-3">
          {lineStats.map(stat => (
            <div 
              key={stat.lineId}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            >
              <span className="font-medium">{stat.lineName}</span>
              <div className="flex items-center gap-4">
                <StatBadge label="GF" value={stat.goalsFor} positive />
                <StatBadge label="GA" value={stat.goalsAgainst} negative />
                <PlusMinusBadge value={stat.plusMinus} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Period Breakdown */}
      {periodStats.length > 0 && (
        <div className="stat-card">
          <h3 className="font-semibold mb-4">Period Breakdown</h3>
          <div className="space-y-4">
            {periodStats.map(ps => (
              <div key={ps.period} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Period {ps.period}
                  </span>
                  <span className="text-lg font-bold">
                    {ps.home.goals} - {ps.opponent.goals}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs text-center">
                  <div>
                    <p className="text-muted-foreground">Skott på mål</p>
                    <p className="font-medium">{ps.home.shotsOnGoal} - {ps.opponent.shotsOnGoal}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Off</p>
                    <p className="font-medium">{ps.home.shotsOffGoal} - {ps.opponent.shotsOffGoal}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Blocked</p>
                    <p className="font-medium">{ps.home.shotsBlocked} - {ps.opponent.shotsBlocked}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-medium">
                      {ps.home.shotsOnGoal + ps.home.shotsOffGoal + ps.home.shotsBlocked} - {ps.opponent.shotsOnGoal + ps.opponent.shotsOffGoal + ps.opponent.shotsBlocked}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatBadge({ 
  label, 
  value, 
  positive = false, 
  negative = false 
}: { 
  label: string; 
  value: number; 
  positive?: boolean; 
  negative?: boolean;
}) {
  return (
    <div className="text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn(
        'font-bold tabular-nums',
        positive && value > 0 && 'text-success',
        negative && value > 0 && 'text-destructive'
      )}>
        {value}
      </p>
    </div>
  );
}

function PlusMinusBadge({ value }: { value: number }) {
  const Icon = value > 0 ? TrendingUp : value < 0 ? TrendingDown : Minus;
  
  return (
    <div className={cn(
      'flex items-center gap-1 px-3 py-1 rounded-full font-bold',
      value > 0 && 'bg-success/10 text-success',
      value < 0 && 'bg-destructive/10 text-destructive',
      value === 0 && 'bg-muted text-muted-foreground'
    )}>
      <Icon className="h-4 w-4" />
      <span>{value > 0 ? '+' : ''}{value}</span>
    </div>
  );
}
