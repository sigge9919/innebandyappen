import { useMemo, useState } from 'react';
import { EnhancedGame, GameEvent, GameLine, GameSituation } from '@/types/game';
import { Player } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

interface LineCombinationStatsProps {
  games: EnhancedGame[];
  players: Player[];
}

interface ComboStats {
  playerIds: string[];
  gamesPlayed: number;
  goalsFor: number;
  goalsAgainst: number;
  plusMinus: number;
}

export function LineCombinationStats({ games, players }: LineCombinationStatsProps) {
  const [situationFilter, setSituationFilter] = useState<GameSituation | 'all'>('all');

  const situationOptions: { value: GameSituation | 'all'; label: string }[] = [
    { value: 'all', label: 'Alla' },
    { value: '5v5', label: '5v5' },
    { value: '5v4', label: '5v4 (PP)' },
    { value: '4v5', label: '4v5 (PK)' },
    { value: '6v5', label: '6v5' },
    { value: '5v6', label: '5v6' },
  ];

  const playerMap = useMemo(() => {
    const map = new Map<string, Player>();
    players.forEach(p => map.set(p.id, p));
    return map;
  }, [players]);

  const combos = useMemo(() => {
    const comboMap = new Map<string, ComboStats>();
    // Track which gameIds each combo appeared in (situation-aware when filtered)
    const comboGameIds = new Map<string, Set<string>>();

    for (const game of games) {
      if (game.status !== 'Finished' || !game.lines || !game.events) continue;

      const lines = game.lines as GameLine[];
      const events = game.events as GameEvent[];

      for (const line of lines) {
        if (!line.playerIds || line.playerIds.length < 2) continue;
        const key = [...line.playerIds].sort().join('-');

        if (!comboMap.has(key)) {
          comboMap.set(key, {
            playerIds: [...line.playerIds].sort(),
            gamesPlayed: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            plusMinus: 0,
          });
          comboGameIds.set(key, new Set());
        }

        // When no situation filter, count every line that was set up in this game.
        if (situationFilter === 'all') {
          comboGameIds.get(key)!.add(game.id);
        }
      }

      // Attribute goals to combos based on lineId
      for (const event of events) {
        if (event.type !== 'goal') continue;
        if (event.situation === 'PS') continue; // Exclude penalty shots
        if (situationFilter !== 'all' && event.situation !== situationFilter) continue;

        if (event.team === 'home' && event.lineId) {
          const line = lines.find(l => l.id === event.lineId);
          if (line && line.playerIds.length >= 2) {
            const key = [...line.playerIds].sort().join('-');
            const combo = comboMap.get(key);
            if (combo) {
              combo.goalsFor += 1;
              combo.plusMinus += 1;
              comboGameIds.get(key)!.add(game.id);
            }
          }
        } else if (event.team === 'opponent' && event.lineId) {
          // Goal against — attributed to the line that was on ice
          const line = lines.find(l => l.id === event.lineId);
          if (line && line.playerIds.length >= 2) {
            const key = [...line.playerIds].sort().join('-');
            const combo = comboMap.get(key);
            if (combo) {
              combo.goalsAgainst += 1;
              combo.plusMinus -= 1;
              comboGameIds.get(key)!.add(game.id);
            }
          }
        } else if (event.team === 'opponent' && event.onIcePlayerIds && event.onIcePlayerIds.length >= 2) {
          // Opponent goal with on-ice snapshot — find matching combo
          for (const [key, combo] of comboMap) {
            if (combo.playerIds.every(pid => event.onIcePlayerIds!.includes(pid))) {
              combo.goalsAgainst += 1;
              combo.plusMinus -= 1;
              comboGameIds.get(key)!.add(game.id);
            }
          }
        }
      }
    }

    // Finalize gamesPlayed from the collected sets
    for (const [key, combo] of comboMap) {
      combo.gamesPlayed = comboGameIds.get(key)?.size ?? 0;
    }

    return Array.from(comboMap.values())
      .filter(c => c.gamesPlayed > 0)
      .sort((a, b) => {
        const avgA = a.gamesPlayed > 0 ? a.plusMinus / a.gamesPlayed : 0;
        const avgB = b.gamesPlayed > 0 ? b.plusMinus / b.gamesPlayed : 0;
        return avgB - avgA;
      });
  }, [games, situationFilter]);

  const getPlayerNames = (playerIds: string[]) => {
    return playerIds
      .map(id => {
        const p = playerMap.get(id);
        return p ? `#${p.jerseyNumber} ${p.name}` : 'Okänd';
      })
      .join(', ');
  };

  const filterButtons = (
    <div className="flex flex-wrap gap-2 mb-4">
      {situationOptions.map(opt => (
        <Button
          key={opt.value}
          variant={situationFilter === opt.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSituationFilter(opt.value)}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );

  if (combos.length === 0) {
    return (
      <div>
        {filterButtons}
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">
            {situationFilter === 'all'
              ? 'Inga kedjedata att analysera'
              : `Inga kombinationer i ${situationFilter}`}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Sätt upp kedjor i matcher och spela klart för att se kombinationsstatistik
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {filterButtons}
      <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Bästa kombinationer{situationFilter !== 'all' ? ` — ${situationFilter}` : ''}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Spelare</TableHead>
              <TableHead className="text-center">Matcher</TableHead>
              <TableHead className="text-center">MF</TableHead>
              <TableHead className="text-center">ME</TableHead>
              <TableHead className="text-center">+/−</TableHead>
              <TableHead className="text-center">+/− per match</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {combos.map((combo, idx) => (
              <TableRow key={combo.playerIds.join('-')}>
                <TableCell className="font-medium text-xs">
                  {getPlayerNames(combo.playerIds)}
                </TableCell>
                <TableCell className="text-center">{combo.gamesPlayed}</TableCell>
                <TableCell className="text-center">{combo.goalsFor}</TableCell>
                <TableCell className="text-center">{combo.goalsAgainst}</TableCell>
                <TableCell className={`text-center font-semibold ${combo.plusMinus > 0 ? 'text-green-600' : combo.plusMinus < 0 ? 'text-red-600' : ''}`}>
                  {combo.plusMinus > 0 ? '+' : ''}{combo.plusMinus}
                </TableCell>
                <TableCell className={`text-center ${(combo.plusMinus / combo.gamesPlayed) > 0 ? 'text-green-600' : (combo.plusMinus / combo.gamesPlayed) < 0 ? 'text-red-600' : ''}`}>
                  {(combo.plusMinus / combo.gamesPlayed).toFixed(1)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      </Card>
    </div>
  );
}
