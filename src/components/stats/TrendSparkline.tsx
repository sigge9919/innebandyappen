import { Card, CardContent } from '@/components/ui/card';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendSparklineProps {
  label: string;
  values: number[];
  invertTrend?: boolean;
  suffix?: string;
}

function computeTrend(values: number[], invert = false): { dir: 'up' | 'down' | 'flat'; pct: number } {
  if (values.length < 2) return { dir: 'flat', pct: 0 };
  const n = values.length;
  const recentCount = Math.min(3, Math.floor(n / 2));
  const recent = values.slice(-recentCount);
  const previous = values.slice(-recentCount * 2, -recentCount);
  if (previous.length === 0) return { dir: 'flat', pct: 0 };
  const avg = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length;
  const r = avg(recent);
  const p = avg(previous);
  if (p === 0 && r === 0) return { dir: 'flat', pct: 0 };
  const pct = p === 0 ? 100 : Math.round(((r - p) / Math.abs(p)) * 100);
  if (Math.abs(pct) < 5) return { dir: 'flat', pct };
  const dir = pct > 0 ? 'up' : 'down';
  if (invert) return { dir: dir === 'up' ? 'down' : 'up', pct };
  return { dir, pct };
}

export function TrendSparkline({ label, values, invertTrend = false, suffix = '' }: TrendSparklineProps) {
  const latest = values[values.length - 1] ?? 0;
  const avg = values.length
    ? Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 10) / 10
    : 0;
  const trend = computeTrend(values, invertTrend);
  const data = values.map((v, i) => ({ i, v }));

  const TrendIcon = trend.dir === 'up' ? TrendingUp : trend.dir === 'down' ? TrendingDown : Minus;
  const isPositive = trend.dir === 'up';
  const isNegative = trend.dir === 'down';
  const strokeColor = isPositive
    ? 'hsl(var(--primary))'
    : isNegative
      ? 'hsl(var(--chart-opponent))'
      : 'hsl(var(--muted-foreground))';
  const trendTextColor = isPositive
    ? 'text-[hsl(var(--primary))]'
    : isNegative
      ? 'text-[hsl(var(--chart-opponent))]'
      : 'text-muted-foreground';

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">
            {label}
          </span>
          {values.length >= 2 && (
            <div className={`flex items-center gap-0.5 text-[10px] font-semibold ${trendTextColor}`}>
              <TrendIcon className="h-3 w-3" />
              {trend.dir !== 'flat' && <span>{trend.pct > 0 ? '+' : ''}{trend.pct}%</span>}
            </div>
          )}
        </div>
        <div className="text-xl font-bold tabular-nums leading-tight">
          {latest}{suffix}
        </div>
        <div className="h-8 -mx-1 mt-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`spark-${label}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={strokeColor} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <YAxis hide domain={['auto', 'auto']} />
              <Area
                type="monotone"
                dataKey="v"
                stroke={strokeColor}
                strokeWidth={1.5}
                fill={`url(#spark-${label})`}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="text-[10px] text-muted-foreground mt-1">snitt {avg}{suffix}</div>
      </CardContent>
    </Card>
  );
}
