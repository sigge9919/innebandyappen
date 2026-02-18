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

export function PlayerTrends({ games, players }: PlayerTrendsProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(players[0]?.id || '');

  const selectedPlayer = players.find(p => p.id === selectedPlayerId);
  const isGoalie = selectedPlayer?.positions.includes('Goalkeeper');

  const trendData = useMemo(() => {
    if (!selectedPlayerId) return [];

    return [...games]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(game => {
        // Check if player was in squad
        if (!game.squadPlayerIds.includes(selectedPlayerId)) return null;

        const playerStats = calculatePlayerStatsFromEvents(
          game.events, game.penalties || [], game.lines, game.squadPlayerIds
        );
        const stat = playerStats.find(s => s.playerId === selectedPlayerId);

        if (isGoalie) {
          // Goalie stats: Goals Against, Save %
          const oppShotsOnGoal = game.events.filter(
            e => (e.type === 'shot_on_goal' || e.type === 'goal') && e.team === 'opponent'
          ).length;
          const goalsAgainst = game.opponentScore;
          const saves = oppShotsOnGoal - goalsAgainst;
          const savePct = oppShotsOnGoal > 0 ? Math.round((saves / oppShotsOnGoal) * 100) : 0;

          return {
            label: game.opponent,
            goalsAgainst,
            savePct,
          };
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
    return <p className="text-center text-muted-foreground py-8">No players available</p>;
  }

  const skaterPointsConfig = {
    goals: { label: 'Goals', color: 'hsl(var(--chart-1))' },
    assists: { label: 'Assists', color: 'hsl(var(--chart-3))' },
  };

  const skaterShotsConfig = {
    sog: { label: 'SOG', color: 'hsl(var(--chart-1))' },
    shotsOff: { label: 'Off Goal', color: 'hsl(var(--chart-3))' },
    shotsBlocked: { label: 'Blocked', color: 'hsl(var(--chart-4))' },
  };

  const plusMinusConfig = {
    plusMinus: { label: '+/-', color: 'hsl(var(--chart-1))' },
  };

  const goalieGAConfig = {
    goalsAgainst: { label: 'Goals Against', color: 'hsl(var(--chart-2))' },
  };

  const goalieSvConfig = {
    savePct: { label: 'Save %', color: 'hsl(var(--chart-1))' },
  };

  return (
    <div className="space-y-6">
      {/* Player Selector */}
      <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
        <SelectTrigger className="w-full max-w-xs">
          <SelectValue placeholder="Select player" />
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
          No game data for this player
        </p>
      ) : isGoalie ? (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Goals Against per Game</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={goalieGAConfig} className="h-[250px] w-full">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="goalsAgainst" stroke="var(--color-goalsAgainst)" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Save % per Game</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={goalieSvConfig} className="h-[250px] w-full">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="savePct" stroke="var(--color-savePct)" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Points per Game</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={skaterPointsConfig} className="h-[250px] w-full">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="goals" stroke="var(--color-goals)" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="assists" stroke="var(--color-assists)" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Shots per Game</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={skaterShotsConfig} className="h-[250px] w-full">
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

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Plus/Minus per Game</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={plusMinusConfig} className="h-[250px] w-full">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="plusMinus" stroke="var(--color-plusMinus)" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
