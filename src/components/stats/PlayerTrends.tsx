import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnhancedGame } from '@/types/game';
import { calculatePlayerStatsFromEvents } from '@/lib/gameStorage';
import { Player } from '@/types';

interface PlayerTrendsProps {
  games: EnhancedGame[];
  players: Player[];
}

interface ChartDef {
  title: string;
  dataKey: string;
  config: Record<string, { label: string; color: string }>;
}

export function PlayerTrends({ games, players }: PlayerTrendsProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(players[0]?.id || '');

  const selectedPlayer = players.find(p => p.id === selectedPlayerId);
  const isGoalie = selectedPlayer?.positions.includes('Goalkeeper');

  const trendData = useMemo(() => {
    if (!selectedPlayerId) return [];

    return [...games]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(game => {
        if (!game.squadPlayerIds.includes(selectedPlayerId)) return null;

        const playerStats = calculatePlayerStatsFromEvents(
          game.events, game.penalties || [], game.lines, game.squadPlayerIds
        );
        const stat = playerStats.find(s => s.playerId === selectedPlayerId);

        if (isGoalie) {
          const oppShotsOnGoal = game.events.filter(
            e => (e.type === 'shot_on_goal' || e.type === 'goal') && e.team === 'opponent'
          ).length;
          const goalsAgainst = game.opponentScore;
          const saves = oppShotsOnGoal - goalsAgainst;
          const savePct = oppShotsOnGoal > 0 ? Math.round((saves / oppShotsOnGoal) * 100) : 0;

          return { label: game.opponent, goalsAgainst, savePct };
        }

        return {
          label: game.opponent,
          goals: stat?.goals || 0,
          assists: stat?.assists || 0,
          sog: stat?.shotsOnGoal || 0,
          shotsOff: stat?.shotsOffGoal || 0,
          shotsBlocked: stat?.shotsBlocked || 0,
          plusMinus: stat?.plusMinus5v5 || 0,
        };
      })
      .filter(Boolean);
  }, [games, selectedPlayerId, isGoalie]);

  if (players.length === 0) {
    return <p className="text-center text-muted-foreground py-8">Inga spelare tillgängliga</p>;
  }

  const skaterCharts: ChartDef[] = [
    { title: 'Goals', dataKey: 'goals', config: { goals: { label: 'Goals', color: 'hsl(var(--chart-1))' } } },
    { title: 'Assists', dataKey: 'assists', config: { assists: { label: 'Assists', color: 'hsl(var(--chart-3))' } } },
    { title: 'Shots on Goal', dataKey: 'sog', config: { sog: { label: 'SOG', color: 'hsl(var(--chart-1))' } } },
    { title: 'Shots Off Goal', dataKey: 'shotsOff', config: { shotsOff: { label: 'Off Goal', color: 'hsl(var(--chart-3))' } } },
    { title: 'Shots Blocked', dataKey: 'shotsBlocked', config: { shotsBlocked: { label: 'Blocked', color: 'hsl(var(--chart-4))' } } },
    { title: 'Plus/Minus (5v5)', dataKey: 'plusMinus', config: { plusMinus: { label: '+/-', color: 'hsl(var(--chart-1))' } } },
  ];

  const goalieCharts: ChartDef[] = [
    { title: 'Goals Against', dataKey: 'goalsAgainst', config: { goalsAgainst: { label: 'Goals Against', color: 'hsl(var(--chart-2))' } } },
    { title: 'Save %', dataKey: 'savePct', config: { savePct: { label: 'Save %', color: 'hsl(var(--chart-1))' } } },
  ];

  const charts = isGoalie ? goalieCharts : skaterCharts;

  return (
    <div className="space-y-6">
      <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
        <SelectTrigger className="w-full max-w-xs">
          <SelectValue placeholder="Välj spelare" />
        </SelectTrigger>
        <SelectContent>
          {players.map(p => (
            <SelectItem key={p.id} value={p.id}>
              #{p.jerseyNumber} {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {trendData.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          Ingen matchdata för denna spelare
        </p>
      ) : (
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
                    <YAxis allowDecimals={false} domain={chart.dataKey === 'savePct' ? [0, 100] : undefined} />
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
      )}
    </div>
  );
}
