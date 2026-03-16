import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { usePlayers, useRPERatings, useTrainingSessions } from '@/hooks/useLocalStorage';
import { useEnhancedGames } from '@/hooks/useEnhancedGames';
import { useTeam } from '@/contexts/TeamContext';
import { SeasonSelector } from '@/components/SeasonSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Activity, Search, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Player, PlayerRPERating } from '@/types';

function getRPEColor(rating: number): string {
  if (rating <= 1) return '#22c55e';
  if (rating <= 3) return '#eab308';
  if (rating <= 4) return '#f97316';
  return '#ef4444';
}

function getRPETextColor(rating: number): string {
  if (rating <= 1) return 'text-green-500';
  if (rating <= 3) return 'text-yellow-500';
  if (rating <= 4) return 'text-orange-500';
  return 'text-red-500';
}

interface PlayerRPESummary {
  player: Player;
  ratings: PlayerRPERating[];
  avg: number;
  latest: number;
  trend: 'up' | 'down' | 'stable';
}

export default function RPETrends() {
  const navigate = useNavigate();
  const { players } = usePlayers();
  const { ratings: allRatings } = useRPERatings();
  const { sessions } = useTrainingSessions();
  const { games } = useEnhancedGames();
  const { seasons, selectedSeasonId, setSelectedSeasonId } = useTeam();
  const [search, setSearch] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const activePlayers = players.filter(p => p.status !== 'Archived');

  const playerSummaries: PlayerRPESummary[] = useMemo(() => {
    return activePlayers
      .map(player => {
        const playerRatings = allRatings
          .filter(r => r.playerId === player.id)
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

        if (playerRatings.length === 0) return null;

        const avg = playerRatings.reduce((s, r) => s + r.rating, 0) / playerRatings.length;
        const latest = playerRatings[playerRatings.length - 1].rating;

        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (playerRatings.length >= 2) {
          const last = playerRatings[playerRatings.length - 1].rating;
          const prev = playerRatings[playerRatings.length - 2].rating;
          if (last - prev >= 1) trend = 'up';
          else if (prev - last >= 1) trend = 'down';
        }

        return { player, ratings: playerRatings, avg, latest, trend };
      })
      .filter(Boolean) as PlayerRPESummary[];
  }, [activePlayers, allRatings]);

  const filteredSummaries = playerSummaries.filter(s =>
    s.player.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedSummary = selectedPlayerId
    ? playerSummaries.find(s => s.player.id === selectedPlayerId)
    : null;

  const chartData = selectedSummary?.ratings.map(r => {
    let label = '';
    if (r.sessionType === 'game') {
      const g = games.find(g => g.id === r.sessionId);
      label = g ? `vs ${g.opponent}` : 'Match';
    } else {
      const s = sessions.find(s => s.id === r.sessionId);
      label = s?.theme || 'Träning';
    }
    return {
      label,
      rating: r.rating,
      date: new Date(r.createdAt).toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' }),
      type: r.sessionType,
    };
  });

  return (
    <AppLayout>
      <div className="page-container">
        <div className="section-header">
          <div>
            <h1 className="section-title">RPE-trender</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Alla spelares trötthet över tid</p>
          </div>
          <SeasonSelector
            seasons={seasons}
            selectedSeasonId={selectedSeasonId}
            onSeasonChange={setSelectedSeasonId}
          />
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Sök spelare..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Player list */}
          <div className="lg:col-span-1 space-y-2">
            {filteredSummaries.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">Inga RPE-betyg registrerade</p>
            )}
            {filteredSummaries
              .sort((a, b) => b.latest - a.latest)
              .map(s => (
                <button
                  key={s.player.id}
                  onClick={() => setSelectedPlayerId(s.player.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                    selectedPlayerId === s.player.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                    {s.player.jerseyNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{s.player.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Snitt: {s.avg.toFixed(1)} • {s.ratings.length} betyg
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-lg font-bold ${getRPETextColor(s.latest)}`}>{s.latest}</span>
                    {s.trend === 'up' && <TrendingUp className="h-4 w-4 text-red-500" />}
                    {s.trend === 'down' && <TrendingDown className="h-4 w-4 text-green-500" />}
                    {s.trend === 'stable' && <Minus className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </button>
              ))}
          </div>

          {/* Chart area */}
          <div className="lg:col-span-2">
            {selectedSummary && chartData ? (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    RPE-trend: {selectedSummary.player.name}
                    <Badge variant="outline" className="ml-auto text-xs">
                      Snitt: {selectedSummary.avg.toFixed(1)}/5
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          domain={[1, 5]}
                          ticks={[1, 2, 3, 4, 5]}
                          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const d = payload[0].payload;
                            return (
                              <div className="bg-popover border border-border rounded-md shadow-md px-3 py-2 text-sm">
                                <p className="font-medium">{d.label}</p>
                                <p className="text-muted-foreground text-xs">{d.date} • {d.type === 'game' ? 'Match' : 'Träning'}</p>
                                <p className="font-bold mt-1" style={{ color: getRPEColor(d.rating) }}>
                                  RPE: {d.rating}/5
                                </p>
                              </div>
                            );
                          }}
                        />
                        <ReferenceLine y={4} stroke="hsl(var(--destructive))" strokeDasharray="4 4" strokeOpacity={0.5} />
                        <Line
                          type="monotone"
                          dataKey="rating"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={(props: any) => {
                            const { cx, cy, payload } = props;
                            return (
                              <circle
                                key={`dot-${cx}-${cy}`}
                                cx={cx}
                                cy={cy}
                                r={4}
                                fill={getRPEColor(payload.rating)}
                                stroke="hsl(var(--background))"
                                strokeWidth={2}
                              />
                            );
                          }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> 1 Pigg</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" /> 2-3 Måttlig</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" /> 4 Trött</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> 5 Utmattad</span>
                  </div>

                  {/* History list */}
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Historik</p>
                    {[...selectedSummary.ratings].reverse().slice(0, 15).map(r => {
                      const sessionLabel = r.sessionType === 'game'
                        ? (() => { const g = games.find(g => g.id === r.sessionId); return g ? `vs ${g.opponent}` : 'Match'; })()
                        : (() => { const s = sessions.find(s => s.id === r.sessionId); return s?.theme || 'Träning'; })();
                      return (
                        <div key={r.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                          <div>
                            <p className="text-sm font-medium">{sessionLabel}</p>
                            <p className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString('sv')}</p>
                          </div>
                          <span className={`text-sm font-bold ${getRPETextColor(r.rating)}`}>{r.rating}/5</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Välj en spelare för att se RPE-trend</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
