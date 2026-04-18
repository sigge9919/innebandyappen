import { useMemo, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnhancedGame } from '@/types/game';
import { calculatePlayerStatsFromEvents } from '@/lib/gameStorage';
import { Player } from '@/types';
import { TrendChart, TrendSeries } from './TrendChart';
import { TrendSparkline } from './TrendSparkline';

interface PlayerTrendsProps {
  games: EnhancedGame[];
  players: Player[];
}

const OUR = 'hsl(var(--primary))';
const OPP = 'hsl(var(--chart-opponent))';
const ACCENT = 'hsl(var(--success))';

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
      .filter(Boolean) as Array<Record<string, any>>;
  }, [games, selectedPlayerId, isGoalie]);

  if (players.length === 0) {
    return <p className="text-center text-muted-foreground py-8">Inga spelare tillgängliga</p>;
  }

  const sparkValues = (k: string) => trendData.map(d => Number(d[k]) || 0);

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
      ) : isGoalie ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <TrendSparkline label="Mål emot" values={sparkValues('goalsAgainst')} invertTrend />
            <TrendSparkline label="Save %" values={sparkValues('savePct')} suffix="%" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <TrendChart
              title="Mål emot"
              data={trendData}
              xKey="label"
              series={[{ key: 'goalsAgainst', label: 'Mål emot', color: OPP }]}
              invertTrend
            />
            <TrendChart
              title="Save %"
              data={trendData}
              xKey="label"
              series={[{ key: 'savePct', label: 'Save %', color: OUR }]}
              domain={[0, 100]}
            />
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <TrendSparkline label="Mål" values={sparkValues('goals')} />
            <TrendSparkline label="Assists" values={sparkValues('assists')} />
            <TrendSparkline label="SOG" values={sparkValues('sog')} />
            <TrendSparkline label="Off" values={sparkValues('shotsOff')} />
            <TrendSparkline label="Blockerade" values={sparkValues('shotsBlocked')} />
            <TrendSparkline label="+/-" values={sparkValues('plusMinus')} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <TrendChart title="Mål" data={trendData} xKey="label" series={[{ key: 'goals', label: 'Mål', color: OUR }]} />
            <TrendChart title="Assists" data={trendData} xKey="label" series={[{ key: 'assists', label: 'Assists', color: ACCENT }]} />
            <TrendChart title="Skott på mål" data={trendData} xKey="label" series={[{ key: 'sog', label: 'SOG', color: OUR }]} />
            <TrendChart title="Skott utanför" data={trendData} xKey="label" series={[{ key: 'shotsOff', label: 'Off', color: OPP }]} />
            <TrendChart title="Blockerade skott" data={trendData} xKey="label" series={[{ key: 'shotsBlocked', label: 'Blk', color: ACCENT }]} />
            <TrendChart title="Plus/Minus (5v5)" data={trendData} xKey="label" series={[{ key: 'plusMinus', label: '+/-', color: OUR }]} />
          </div>
        </>
      )}
    </div>
  );
}
