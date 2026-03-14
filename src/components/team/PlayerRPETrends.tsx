import { PlayerRPERating } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface PlayerRPETrendsProps {
  ratings: PlayerRPERating[];
  sessions?: { id: string; theme?: string; date?: string }[];
  games?: { id: string; opponent?: string; date?: string }[];
}

export function PlayerRPETrends({ ratings, sessions = [], games = [] }: PlayerRPETrendsProps) {
  if (ratings.length < 2) return null;

  const sorted = [...ratings].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const data = sorted.map(r => {
    let label = '';
    if (r.sessionType === 'game') {
      const g = games.find(g => g.id === r.sessionId);
       label = g ? `vs ${g.opponent}` : 'Match';
     } else {
       const s = sessions.find(s => s.id === r.sessionId);
       label = s?.theme || 'Träning';
    }
    return {
      label,
      rating: r.rating,
      date: new Date(r.createdAt).toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' }),
      type: r.sessionType,
    };
  });

  const avg = (sorted.reduce((s, r) => s + r.rating, 0) / sorted.length).toFixed(1);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
           RPE-trend
           <span className="text-sm font-normal text-muted-foreground ml-auto">Snitt: {avg}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[1, 10]}
                ticks={[1, 3, 5, 7, 10]}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-popover border border-border rounded-md shadow-md px-3 py-2 text-sm">
                      <p className="font-medium">{d.label}</p>
                      <p className="text-muted-foreground text-xs">{d.date} • {d.type}</p>
                      <p className="font-bold mt-1" style={{ color: getRPEChartColor(d.rating) }}>
                        RPE: {d.rating}/10
                      </p>
                    </div>
                  );
                }}
              />
              <ReferenceLine
                y={8}
                stroke="hsl(var(--destructive))"
                strokeDasharray="4 4"
                strokeOpacity={0.5}
              />
              <Line
                type="monotone"
                dataKey="rating"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  const color = getRPEChartColor(payload.rating);
                  return (
                    <circle
                      key={`dot-${cx}-${cy}`}
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill={color}
                      stroke="hsl(var(--background))"
                      strokeWidth={2}
                    />
                  );
                }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
           <span className="flex items-center gap-1">
             <span className="w-2 h-2 rounded-full bg-green-500" /> 1-3 Pigg
           </span>
           <span className="flex items-center gap-1">
             <span className="w-2 h-2 rounded-full bg-yellow-500" /> 4-6 Måttlig
           </span>
           <span className="flex items-center gap-1">
             <span className="w-2 h-2 rounded-full bg-orange-500" /> 7-8 Trött
           </span>
           <span className="flex items-center gap-1">
             <span className="w-2 h-2 rounded-full bg-red-500" /> 9-10 Utmattad
           </span>
        </div>
      </CardContent>
    </Card>
  );
}

function getRPEChartColor(rating: number): string {
  if (rating <= 3) return '#22c55e';
  if (rating <= 6) return '#eab308';
  if (rating <= 8) return '#f97316';
  return '#ef4444';
}
