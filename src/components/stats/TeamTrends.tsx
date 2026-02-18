import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { EnhancedGame } from '@/types/game';
import { calculateTeamStats } from '@/lib/gameStorage';

interface TeamTrendsProps {
  games: EnhancedGame[];
}

export function TeamTrends({ games }: TeamTrendsProps) {
  const trendData = useMemo(() => {
    return [...games]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(game => {
        const homeStats = calculateTeamStats(game.events, 'home');
        const oppStats = calculateTeamStats(game.events, 'opponent');
        return {
          label: game.opponent,
          ourGoals: game.ourScore,
          oppGoals: game.opponentScore,
          sog: homeStats.shotsOnGoal,
          oppSog: oppStats.shotsOnGoal,
          shotsOff: homeStats.shotsOffGoal,
          shotsBlocked: homeStats.shotsBlocked,
        };
      });
  }, [games]);

  if (trendData.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No finished games to show trends
      </p>
    );
  }

  const charts = [
    {
      title: 'Goals Scored',
      dataKey: 'ourGoals',
      config: { ourGoals: { label: 'Our Goals', color: 'hsl(var(--chart-1))' } },
    },
    {
      title: 'Goals Against',
      dataKey: 'oppGoals',
      config: { oppGoals: { label: 'Opponent Goals', color: 'hsl(var(--chart-2))' } },
    },
    {
      title: 'Shots on Goal',
      dataKey: 'sog',
      config: { sog: { label: 'SOG', color: 'hsl(var(--chart-1))' } },
    },
    {
      title: 'Opponent SOG',
      dataKey: 'oppSog',
      config: { oppSog: { label: 'Opp SOG', color: 'hsl(var(--chart-2))' } },
    },
    {
      title: 'Shots Off Goal',
      dataKey: 'shotsOff',
      config: { shotsOff: { label: 'Off Goal', color: 'hsl(var(--chart-3))' } },
    },
    {
      title: 'Shots Blocked',
      dataKey: 'shotsBlocked',
      config: { shotsBlocked: { label: 'Blocked', color: 'hsl(var(--chart-4))' } },
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {charts.map(chart => (
        <Card key={chart.dataKey}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{chart.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chart.config} className="h-[200px] w-full">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey={chart.dataKey}
                  stroke={`var(--color-${chart.dataKey})`}
                  strokeWidth={2}
                  dot={{ r: 5, fill: `var(--color-${chart.dataKey})`, strokeWidth: 0 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
