import { PlayerRPERating, Player } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Activity } from 'lucide-react';

interface TeamRPECardProps {
  ratings: PlayerRPERating[];
  players: Player[];
}

export function TeamRPECard({ ratings, players }: TeamRPECardProps) {
  if (ratings.length === 0) return null;

  // Get latest rating per player
  const latestByPlayer = new Map<string, PlayerRPERating>();
  const sorted = [...ratings].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  for (const r of sorted) {
    if (!latestByPlayer.has(r.playerId)) {
      latestByPlayer.set(r.playerId, r);
    }
  }

  const latestRatings = Array.from(latestByPlayer.values());
  const avg = latestRatings.reduce((s, r) => s + r.rating, 0) / latestRatings.length;
  const playersReporting = latestByPlayer.size;

  const getLevel = (v: number) => {
    if (v <= 3) return { label: 'Fresh', color: 'text-green-500', bg: 'bg-green-500' };
    if (v <= 5) return { label: 'Good', color: 'text-emerald-500', bg: 'bg-emerald-500' };
    if (v <= 7) return { label: 'Moderate', color: 'text-yellow-500', bg: 'bg-yellow-500' };
    if (v <= 8) return { label: 'Tired', color: 'text-orange-500', bg: 'bg-orange-500' };
    return { label: 'Exhausted', color: 'text-red-500', bg: 'bg-red-500' };
  };

  const level = getLevel(avg);
  const pct = ((avg - 1) / 9) * 100;

  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Team Fatigue</span>
        </div>
        <div className="flex items-end gap-2 mb-2">
          <span className={`text-3xl font-bold ${level.color}`}>{avg.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground mb-1">/ 10</span>
          <span className={`text-xs font-medium ml-auto ${level.color}`}>{level.label}</span>
        </div>
        {/* Bar */}
        <div className="h-2 rounded-full bg-muted overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all ${level.bg}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Based on {playersReporting} player{playersReporting !== 1 ? 's' : ''} latest ratings
        </p>
      </CardContent>
    </Card>
  );
}
