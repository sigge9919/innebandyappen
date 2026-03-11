import { PlayerRPERating, Player } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useMemo } from 'react';

interface TeamRPECardProps {
  ratings: PlayerRPERating[];
  players: Player[];
}

export function TeamRPECard({ ratings, players }: TeamRPECardProps) {
  const { latestSessionAvg, last7DaysAvg, dailyTrend, trendDirection } = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Latest rating per player (last session avg)
    const latestByPlayer = new Map<string, PlayerRPERating>();
    const sorted = [...ratings].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    for (const r of sorted) {
      if (!latestByPlayer.has(r.playerId)) {
        latestByPlayer.set(r.playerId, r);
      }
    }
    const latestRatings = Array.from(latestByPlayer.values());
    const latestSessionAvg = latestRatings.length > 0
      ? latestRatings.reduce((s, r) => s + r.rating, 0) / latestRatings.length
      : 0;

    // Last 7 days ratings
    const last7 = ratings.filter(r => new Date(r.createdAt) >= sevenDaysAgo);
    const last7DaysAvg = last7.length > 0
      ? last7.reduce((s, r) => s + r.rating, 0) / last7.length
      : 0;

    // Daily averages for trend (last 7 days)
    const dailyMap = new Map<string, number[]>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dailyMap.set(key, []);
    }
    for (const r of last7) {
      const key = r.createdAt.split('T')[0];
      if (dailyMap.has(key)) {
        dailyMap.get(key)!.push(r.rating);
      }
    }
    const dailyTrend = Array.from(dailyMap.entries()).map(([date, vals]) => ({
      date,
      avg: vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null,
    }));

    // Trend direction: compare last 2 days with data
    const withData = dailyTrend.filter(d => d.avg !== null);
    let trendDirection: 'up' | 'down' | 'stable' = 'stable';
    if (withData.length >= 2) {
      const recent = withData[withData.length - 1].avg!;
      const prev = withData[withData.length - 2].avg!;
      if (recent - prev > 0.5) trendDirection = 'up';
      else if (prev - recent > 0.5) trendDirection = 'down';
    }

    return { latestSessionAvg, last7DaysAvg, dailyTrend, trendDirection };
  }, [ratings]);

  const getLevel = (v: number) => {
    if (v <= 3) return { label: 'Fresh', color: 'text-green-500', bg: 'bg-green-500' };
    if (v <= 5) return { label: 'Good', color: 'text-emerald-500', bg: 'bg-emerald-500' };
    if (v <= 7) return { label: 'Moderate', color: 'text-yellow-500', bg: 'bg-yellow-500' };
    if (v <= 8) return { label: 'Tired', color: 'text-orange-500', bg: 'bg-orange-500' };
    return { label: 'Exhausted', color: 'text-red-500', bg: 'bg-red-500' };
  };

  const level = getLevel(latestSessionAvg);
  const level7d = getLevel(last7DaysAvg);

  // Sparkline dimensions
  const sparkW = 200;
  const sparkH = 32;
  const validPoints = dailyTrend.filter(d => d.avg !== null);

  const getSparklinePath = () => {
    if (validPoints.length < 2) return null;
    const indices = dailyTrend.map((d, i) => d.avg !== null ? i : -1).filter(i => i >= 0);
    const points = indices.map(i => {
      const x = (i / 6) * sparkW;
      const y = sparkH - ((dailyTrend[i].avg! - 1) / 9) * sparkH;
      return { x, y };
    });
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  };

  const sparkPath = getSparklinePath();
  const dayLabels = dailyTrend.map(d => {
    const date = new Date(d.date);
    return date.toLocaleDateString('en', { weekday: 'short' }).charAt(0);
  });

  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Team Fatigue</span>
          <div className="ml-auto flex items-center gap-1">
            {trendDirection === 'up' && <TrendingUp className="h-4 w-4 text-red-500" />}
            {trendDirection === 'down' && <TrendingDown className="h-4 w-4 text-green-500" />}
            {trendDirection === 'stable' && <Minus className="h-4 w-4 text-muted-foreground" />}
            <span className="text-xs text-muted-foreground">
              {trendDirection === 'up' ? 'Rising' : trendDirection === 'down' ? 'Dropping' : 'Stable'}
            </span>
          </div>
        </div>

        {/* Two metrics side by side */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Last Session</p>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold ${level.color}`}>{latestSessionAvg.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">/ 10</span>
            </div>
            <span className={`text-[10px] font-medium ${level.color}`}>{level.label}</span>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">7-Day Avg</p>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold ${level7d.color}`}>
                {last7DaysAvg > 0 ? last7DaysAvg.toFixed(1) : '—'}
              </span>
              {last7DaysAvg > 0 && <span className="text-xs text-muted-foreground">/ 10</span>}
            </div>
            <span className={`text-[10px] font-medium ${level7d.color}`}>
              {last7DaysAvg > 0 ? level7d.label : 'No data'}
            </span>
          </div>
        </div>

        {/* Sparkline */}
        {sparkPath && (
          <div className="mb-2">
            <svg width="100%" viewBox={`0 0 ${sparkW} ${sparkH}`} className="overflow-visible" preserveAspectRatio="none">
              <path d={sparkPath} fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              {validPoints.map((_, idx) => {
                const allIdx = dailyTrend.findIndex((d, i) => {
                  let count = 0;
                  for (let j = 0; j <= i; j++) if (dailyTrend[j].avg !== null) count++;
                  return count === idx + 1;
                });
                if (allIdx < 0) return null;
                const x = (allIdx / 6) * sparkW;
                const y = sparkH - ((dailyTrend[allIdx].avg! - 1) / 9) * sparkH;
                const pointLevel = getLevel(dailyTrend[allIdx].avg!);
                const fillClass = pointLevel.bg.replace('bg-', '');
                const colorMap: Record<string, string> = {
                  'green-500': '#22c55e', 'emerald-500': '#10b981',
                  'yellow-500': '#eab308', 'orange-500': '#f97316', 'red-500': '#ef4444'
                };
                return <circle key={idx} cx={x} cy={y} r="3" fill={colorMap[fillClass] || 'hsl(var(--primary))'} />;
              })}
            </svg>
            <div className="flex justify-between mt-1">
              {dayLabels.map((l, i) => (
                <span key={i} className="text-[9px] text-muted-foreground">{l}</span>
              ))}
            </div>
          </div>
        )}

        <p className="text-[10px] text-muted-foreground">
          Based on {new Set(ratings.map(r => r.playerId)).size} players' ratings
        </p>
      </CardContent>
    </Card>
  );
}
