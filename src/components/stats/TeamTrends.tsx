import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { EnhancedGame } from '@/types/game';
import { calculateTeamStats } from '@/lib/gameStorage';

interface TeamTrendsProps {
  games: EnhancedGame[];
}

const GREEN = 'hsl(142, 71%, 45%)';
const RED = 'hsl(0, 72%, 51%)';

export function TeamTrends({ games }: TeamTrendsProps) {
  const trendData = useMemo(() => {
    return [...games]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(game => {
        const home = calculateTeamStats(game.events, 'home');
        const opp = calculateTeamStats(game.events, 'opponent');

        const homeTotalShots = home.shotsOnGoal + home.shotsOffGoal + home.shotsBlocked;
        const oppTotalShots = opp.shotsOnGoal + opp.shotsOffGoal + opp.shotsBlocked;

        return {
          label: game.opponent,
          ourGoals: game.ourScore,
          oppGoals: game.opponentScore,
          ourSog: home.shotsOnGoal,
          oppSog: opp.shotsOnGoal,
          ourShotsOff: home.shotsOffGoal,
          oppShotsOff: opp.shotsOffGoal,
          ourBlk: home.shotsBlocked,
          oppBlk: opp.shotsBlocked,
          ourDef: opp.shotsBlocked,   // opponent blocked = our defensive blocks
          oppDef: home.shotsBlocked,  // our blocked = their defensive blocks
          ourSogPct: homeTotalShots > 0 ? Math.round((home.shotsOnGoal / homeTotalShots) * 100) : 0,
          oppSogPct: oppTotalShots > 0 ? Math.round((opp.shotsOnGoal / oppTotalShots) * 100) : 0,
          ourBlkPct: homeTotalShots > 0 ? Math.round((home.shotsBlocked / homeTotalShots) * 100) : 0,
          oppBlkPct: oppTotalShots > 0 ? Math.round((opp.shotsBlocked / oppTotalShots) * 100) : 0,
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
      title: 'Goals',
      keys: ['ourGoals', 'oppGoals'] as const,
      config: {
        ourGoals: { label: 'Our Goals', color: GREEN },
        oppGoals: { label: 'Opponent Goals', color: RED },
      },
    },
    {
      title: 'Shots on Goal',
      keys: ['ourSog', 'oppSog'] as const,
      config: {
        ourSog: { label: 'Our SOG', color: GREEN },
        oppSog: { label: 'Opp SOG', color: RED },
      },
    },
    {
      title: 'SOG %',
      keys: ['ourSogPct', 'oppSogPct'] as const,
      config: {
        ourSogPct: { label: 'Our SOG %', color: GREEN },
        oppSogPct: { label: 'Opp SOG %', color: RED },
      },
      domain: [0, 100] as [number, number],
    },
    {
      title: 'Shots Off Goal',
      keys: ['ourShotsOff', 'oppShotsOff'] as const,
      config: {
        ourShotsOff: { label: 'Our Off Goal', color: GREEN },
        oppShotsOff: { label: 'Opp Off Goal', color: RED },
      },
    },
    {
      title: 'Shots Blocked',
      keys: ['ourBlk', 'oppBlk'] as const,
      config: {
        ourBlk: { label: 'Our Blocked', color: GREEN },
        oppBlk: { label: 'Opp Blocked', color: RED },
      },
    },
    {
      title: 'BLK %',
      keys: ['ourBlkPct', 'oppBlkPct'] as const,
      config: {
        ourBlkPct: { label: 'Our BLK %', color: GREEN },
        oppBlkPct: { label: 'Opp BLK %', color: RED },
      },
      domain: [0, 100] as [number, number],
    },
    {
      title: 'Defensive Blocks',
      keys: ['ourDef', 'oppDef'] as const,
      config: {
        ourDef: { label: 'Our Def Blocks', color: GREEN },
        oppDef: { label: 'Opp Def Blocks', color: RED },
      },
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {charts.map(chart => (
        <Card key={chart.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{chart.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chart.config} className="h-[200px] w-full">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} domain={chart.domain} />
                <ChartTooltip content={<ChartTooltipContent />} />
                {chart.keys.map(key => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={`var(--color-${key})`}
                    strokeWidth={2}
                    dot={{ r: 5, fill: `var(--color-${key})`, strokeWidth: 0 }}
                    activeDot={{ r: 7 }}
                  />
                ))}
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
