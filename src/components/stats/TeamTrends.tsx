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
const BLUE = 'hsl(217, 91%, 60%)';

export function TeamTrends({ games }: TeamTrendsProps) {
  const trendData = useMemo(() => {
    return [...games]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(game => {
        const home = calculateTeamStats(game.events, 'home');
        const opp = calculateTeamStats(game.events, 'opponent');
        const homePP = calculateTeamStats(game.events, 'home', undefined, '5v4');
        const homePK = calculateTeamStats(game.events, 'home', undefined, '4v5');
        const oppPK = calculateTeamStats(game.events, 'opponent', undefined, '4v5');

        const homeTotalShots = home.shotsOnGoal + home.shotsOffGoal + home.shotsBlocked;
        const oppTotalShots = opp.shotsOnGoal + opp.shotsOffGoal + opp.shotsBlocked;

        const penalties = game.penalties || [];
        const ppOpportunities = penalties.filter(p => p.team === 'opponent').length;
        const pkOpportunities = penalties.filter(p => p.team === 'home').length;
        const pkGoalsAgainst = oppPK.goals;

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
          ourDef: opp.shotsBlocked,
          oppDef: home.shotsBlocked,
          ourTotalShots: homeTotalShots,
          oppTotalShots: oppTotalShots,
          ourSogPct: homeTotalShots > 0 ? Math.round((home.shotsOnGoal / homeTotalShots) * 100) : 0,
          oppSogPct: oppTotalShots > 0 ? Math.round((opp.shotsOnGoal / oppTotalShots) * 100) : 0,
          ourBlkPct: homeTotalShots > 0 ? Math.round((home.shotsBlocked / homeTotalShots) * 100) : 0,
          oppBlkPct: oppTotalShots > 0 ? Math.round((opp.shotsBlocked / oppTotalShots) * 100) : 0,
          ppGoals: homePP.goals,
          ppSog: homePP.shotsOnGoal,
          ppPct: ppOpportunities > 0 ? Math.round((homePP.goals / ppOpportunities) * 100) : 0,
          pkGoals: pkGoalsAgainst,
          pkSog: homePK.shotsOnGoal,
          pkPct: pkOpportunities > 0 ? Math.round(((pkOpportunities - pkGoalsAgainst) / pkOpportunities) * 100) : 0,
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

  const dualCharts = [
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
    {
      title: 'Total Shots',
      keys: ['ourTotalShots', 'oppTotalShots'] as const,
      config: {
        ourTotalShots: { label: 'Our Total Shots', color: GREEN },
        oppTotalShots: { label: 'Opp Total Shots', color: RED },
      },
    },
  ];

  const singleCharts = [
    {
      title: 'Power Play Goals',
      keys: ['ppGoals'] as const,
      config: { ppGoals: { label: 'PP Goals', color: BLUE } },
    },
    {
      title: 'Power Play SOG',
      keys: ['ppSog'] as const,
      config: { ppSog: { label: 'PP SOG', color: BLUE } },
    },
    {
      title: 'PP %',
      keys: ['ppPct'] as const,
      config: { ppPct: { label: 'PP %', color: BLUE } },
      domain: [0, 100] as [number, number],
    },
    {
      title: 'Box Play Goals Against',
      keys: ['pkGoals'] as const,
      config: { pkGoals: { label: 'PK Goals', color: BLUE } },
    },
    {
      title: 'Box Play SOG',
      keys: ['pkSog'] as const,
      config: { pkSog: { label: 'PK SOG', color: BLUE } },
    },
    {
      title: 'PK %',
      keys: ['pkPct'] as const,
      config: { pkPct: { label: 'PK %', color: BLUE } },
      domain: [0, 100] as [number, number],
    },
  ];

  const allCharts = [...dualCharts, ...singleCharts];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {allCharts.map(chart => (
        <Card key={chart.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{chart.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chart.config} className="h-[200px] w-full">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} domain={'domain' in chart ? chart.domain : undefined} />
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
