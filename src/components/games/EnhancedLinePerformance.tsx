import { Period, LineStats, GameLine, GameEvent } from '@/types/game';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useState } from 'react';

interface EnhancedLinePerformanceProps {
  lines: GameLine[];
  events: GameEvent[];
}

const PERIODS: { value: Period | 'total'; label: string }[] = [
  { value: 'total', label: 'Total' },
  { value: '1', label: 'P1' },
  { value: '2', label: 'P2' },
  { value: '3', label: 'P3' },
  { value: 'OT', label: 'OT' },
];

export function EnhancedLinePerformance({ lines, events }: EnhancedLinePerformanceProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<Period | 'total'>('total');

  const calculateLineStats = (lineId: string, period?: Period): LineStats => {
    const filteredEvents = period 
      ? events.filter(e => e.period === period)
      : events;

    const goalsFor = filteredEvents.filter(
      e => e.type === 'goal' && e.team === 'home' && e.lineId === lineId
    ).length;
    
    const goalsAgainst = filteredEvents.filter(
      e => e.type === 'goal' && e.team === 'opponent' && e.lineId === lineId
    ).length;

    const line = lines.find(l => l.id === lineId);
    
    return {
      lineId,
      lineName: line?.name || 'Unknown',
      goalsFor,
      goalsAgainst,
      plusMinus: goalsFor - goalsAgainst,
    };
  };

  const getLineStatsByPeriod = (lineId: string): { period: Period; stats: LineStats }[] => {
    const periods: Period[] = ['1', '2', '3', 'OT'];
    return periods
      .map(period => ({
        period,
        stats: calculateLineStats(lineId, period),
      }))
      .filter(p => p.stats.goalsFor > 0 || p.stats.goalsAgainst > 0);
  };

  const lineStats = lines
    .filter(l => l.playerIds.length > 0)
    .map(line => ({
      line,
      stats: selectedPeriod === 'total' 
        ? calculateLineStats(line.id) 
        : calculateLineStats(line.id, selectedPeriod),
      periodBreakdown: getLineStatsByPeriod(line.id),
    }))
    .filter(ls => 
      selectedPeriod === 'total' 
        ? ls.stats.goalsFor > 0 || ls.stats.goalsAgainst > 0 || ls.periodBreakdown.length > 0
        : ls.stats.goalsFor > 0 || ls.stats.goalsAgainst > 0
    );

  if (lineStats.length === 0 && selectedPeriod === 'total') {
    return (
      <p className="text-center text-muted-foreground py-8">
        No line statistics recorded yet
      </p>
    );
  }

  return (
    <div>

      <Tabs value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as Period | 'total')}>
        <TabsList className="grid grid-cols-5 w-full mb-4">
          {PERIODS.map(period => (
            <TabsTrigger key={period.value} value={period.value}>
              {period.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedPeriod} className="mt-0">
          <div className="space-y-3">
            {lineStats.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No goals in this period
              </p>
            ) : (
              lineStats.map(({ line, stats, periodBreakdown }) => (
                <div key={line.id} className="border border-border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{line.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {line.type}
                      </Badge>
                    </div>
                    <PlusMinusBadge value={stats.plusMinus} />
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">GF:</span>
                      <span className="font-medium text-success">{stats.goalsFor}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">GA:</span>
                      <span className="font-medium text-destructive">{stats.goalsAgainst}</span>
                    </div>
                  </div>

                  {/* Period breakdown (only in total view) */}
                  {selectedPeriod === 'total' && periodBreakdown.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border flex flex-wrap gap-2">
                      {periodBreakdown.map(({ period, stats: pStats }) => (
                        <div key={period} className="flex items-center gap-1 text-xs">
                          <Badge variant="secondary" className="text-xs">P{period}</Badge>
                          <span className={cn(
                            "font-medium",
                            pStats.plusMinus > 0 && "text-success",
                            pStats.plusMinus < 0 && "text-destructive"
                          )}>
                            {pStats.plusMinus > 0 ? '+' : ''}{pStats.plusMinus}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PlusMinusBadge({ value }: { value: number }) {
  const Icon = value > 0 ? TrendingUp : value < 0 ? TrendingDown : Minus;
  
  return (
    <div className={cn(
      "flex items-center gap-1 px-2 py-1 rounded-full text-sm font-bold",
      value > 0 && "bg-success/10 text-success",
      value < 0 && "bg-destructive/10 text-destructive",
      value === 0 && "bg-muted text-muted-foreground"
    )}>
      <Icon className="h-4 w-4" />
      <span>{value > 0 ? '+' : ''}{value}</span>
    </div>
  );
}
