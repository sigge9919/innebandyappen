import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { EnhancedGame } from '@/types/game';
import { calculateTeamStats } from '@/lib/gameStorage';
import { format } from 'date-fns';

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
          label: `${game.opponent}`,
          date: format(new Date(game.date), 'dd/MM'),
          ourGoals: game.ourScore,
          oppGoals: game.opponentScore,
          sog: homeStats.shotsOnGoal,
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

  const goalsConfig = {
    ourGoals: { label: 'Our Goals', color: 'hsl(var(--chart-1))' },
    oppGoals: { label: 'Opponent Goals', color: 'hsl(var(--chart-2))' },
  };

  const shotsConfig = {
    sog: { label: 'SOG', color: 'hsl(var(--chart-1))' },
    shotsOff: { label: 'Off Goal', color: 'hsl(var(--chart-3))' },
    shotsBlocked: { label: 'Blocked', color: 'hsl(var(--chart-4))' },
  };

  return (
    <div className="space-y-6">
      {/* Goals Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Goals per Game</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={goalsConfig} className="h-[250px] w-full">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="ourGoals" stroke="var(--color-ourGoals)" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="oppGoals" stroke="var(--color-oppGoals)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Shots Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Shots per Game</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={shotsConfig} className="h-[250px] w-full">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="sog" stroke="var(--color-sog)" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="shotsOff" stroke="var(--color-shotsOff)" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="shotsBlocked" stroke="var(--color-shotsBlocked)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
