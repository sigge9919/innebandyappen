import { PlayerRPERating, Player } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

interface RPEAlertsCardProps {
  ratings: PlayerRPERating[];
  players: Player[];
  onPlayerClick: (player: Player) => void;
}

export function RPEAlertsCard({ ratings, players, onPlayerClick }: RPEAlertsCardProps) {
  const latestByPlayer = new Map<string, PlayerRPERating>();
  const sorted = [...ratings].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  for (const r of sorted) {
    if (!latestByPlayer.has(r.playerId)) {
      latestByPlayer.set(r.playerId, r);
    }
  }

  const highRPE = Array.from(latestByPlayer.values())
    .filter(r => r.rating >= 8)
    .sort((a, b) => b.rating - a.rating);

  if (highRPE.length === 0) return null;

  return (
    <Card className="border-orange-500/30 bg-orange-500/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          Hög trötthet
          <Badge variant="destructive" className="text-xs ml-auto">{highRPE.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {highRPE.map(r => {
          const player = players.find(p => p.id === r.playerId);
          if (!player) return null;
          return (
            <div
              key={r.id}
              onClick={() => onPlayerClick(player)}
              className="flex items-center justify-between p-2 rounded-md bg-background border border-border cursor-pointer hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  {player.jerseyNumber}
                </div>
                <div>
                  <p className="text-sm font-medium">{player.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    Senaste {r.sessionType === 'game' ? 'match' : 'träning'} • {new Date(r.createdAt).toLocaleDateString('sv')}
                  </p>
                </div>
              </div>
              <span className={`text-lg font-bold ${r.rating >= 9 ? 'text-red-500' : 'text-orange-500'}`}>
                {r.rating}/10
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
