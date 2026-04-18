import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ReferenceLine, defs as _defs } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useMemo } from 'react';

export interface TrendSeries {
  key: string;
  label: string;
  color: string; // hsl string e.g. "hsl(var(--primary))"
}

interface TrendChartProps {
  title: string;
  data: Array<Record<string, any>>;
  xKey: string;
  series: TrendSeries[];
  domain?: [number, number];
  showAverage?: boolean;
  height?: number;
  invertTrend?: boolean; // for "lower is better" metrics (e.g. opponent stats, goals against)
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

export function TrendChart({
  title,
  data,
  xKey,
  series,
  domain,
  showAverage = true,
  height = 200,
  invertTrend = false,
}: TrendChartProps) {
  const config = useMemo(() => {
    const c: Record<string, { label: string; color: string }> = {};
    series.forEach(s => { c[s.key] = { label: s.label, color: s.color }; });
    return c;
  }, [series]);

  const primarySeries = series[0];
  const primaryValues = data.map(d => Number(d[primarySeries.key]) || 0);
  const latest = primaryValues[primaryValues.length - 1] ?? 0;
  const avg = primaryValues.length
    ? Math.round((primaryValues.reduce((s, v) => s + v, 0) / primaryValues.length) * 10) / 10
    : 0;
  const trend = computeTrend(primaryValues, invertTrend);

  const TrendIcon = trend.dir === 'up' ? TrendingUp : trend.dir === 'down' ? TrendingDown : Minus;
  const trendColor =
    trend.dir === 'flat'
      ? 'text-muted-foreground'
      : trend.dir === 'up'
        ? 'text-[hsl(var(--primary))]'
        : 'text-[hsl(var(--chart-opponent))]';

  const gradientId = `grad-${title.replace(/\s+/g, '-')}-${primarySeries.key}`;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold tabular-nums">{latest}</span>
              <span className="text-xs text-muted-foreground">snitt {avg}</span>
            </div>
          </div>
          {primaryValues.length >= 2 && (
            <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
              <TrendIcon className="h-3.5 w-3.5" />
              {trend.dir !== 'flat' && <span>{trend.pct > 0 ? '+' : ''}{trend.pct}%</span>}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer config={config} className="w-full" style={{ height }}>
          <AreaChart data={data} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
            <defs>
              {series.map(s => (
                <linearGradient key={s.key} id={`${gradientId}-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={`var(--color-${s.key})`} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={`var(--color-${s.key})`} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke="hsl(var(--border))" opacity={0.5} vertical={false} />
            <XAxis
              dataKey={xKey}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis hide domain={domain ?? ['auto', 'auto']} />
            <ChartTooltip
              content={<ChartTooltipContent />}
              cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
            />
            {showAverage && primaryValues.length >= 2 && (
              <ReferenceLine
                y={avg}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="3 3"
                strokeOpacity={0.5}
              />
            )}
            {series.map(s => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={`var(--color-${s.key})`}
                strokeWidth={2}
                fill={`url(#${gradientId}-${s.key})`}
                dot={{ r: 3, fill: `var(--color-${s.key})`, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
