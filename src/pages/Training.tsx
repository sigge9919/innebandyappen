import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { TrainingCard } from '@/components/training/TrainingCard';
import { DrillCard } from '@/components/training/DrillCard';
import { useTrainingSessions, usePlayers, useDrills, useRPERatings, useAllTrainingSessions } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Plus, Calendar, Dumbbell, Search, Star, History, Activity, User, Download } from 'lucide-react';
import { Drill } from '@/types';
import { format } from 'date-fns';
import { DrillCatalogPicker } from '@/components/team/DrillCatalogPicker';
import { useTeam } from '@/contexts/TeamContext';

function getRPEColor(rating: number) {
  if (rating <= 1) return 'text-green-500';
  if (rating <= 3) return 'text-yellow-500';
  if (rating <= 4) return 'text-orange-500';
  return 'text-red-500';
}

export default function Training() {
  const navigate = useNavigate();
  const { sessions } = useTrainingSessions();
  const { sessions: allSessions } = useAllTrainingSessions();
  const { players } = usePlayers();
  const { drills, updateDrill } = useDrills();
  const { ratings } = useRPERatings();

  const [drillSearch, setDrillSearch] = useState('');
  const [drillFilter, setDrillFilter] = useState<string>('all');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'team' | 'personal'>('all');
  const [historySearch, setHistorySearch] = useState('');

  // Compute average RPE per session
  const sessionRPEMap = useMemo(() => {
    const map: Record<string, { avg: number; count: number }> = {};
    for (const session of allSessions) {
      // For personal sessions, use the inline rpe_rating
      if (session.isPersonal && session.rpeRating != null) {
        map[session.id] = { avg: session.rpeRating, count: 1 };
        continue;
      }
      // For team sessions, aggregate from player_rpe_ratings
      const sessionRatings = ratings.filter(r => r.sessionType === 'training' && r.sessionId === session.id);
      if (sessionRatings.length > 0) {
        const avg = sessionRatings.reduce((s, r) => s + r.rating, 0) / sessionRatings.length;
        map[session.id] = { avg, count: sessionRatings.length };
      }
    }
    return map;
  }, [allSessions, ratings]);

  const getPlayerNames = (playerIds: string[]) => {
    return playerIds.map(id => {
      const player = players.find(p => p.id === id);
      return player?.name ?? '';
    });
  };

  const getPlayerName = (playerId?: string) => {
    if (!playerId) return '';
    return players.find(p => p.id === playerId)?.name ?? '';
  };

  const allDrillCategories = Array.from(new Set(drills.flatMap(d => d.categories)));

  const filteredDrills = drills.filter(drill => {
    const matchesSearch = drill.name.toLowerCase().includes(drillSearch.toLowerCase()) ||
                         drill.description.toLowerCase().includes(drillSearch.toLowerCase());
    const matchesFilter = drillFilter === 'all' || 
                          (drillFilter === 'favorites' ? drill.isFavorite : drill.categories.includes(drillFilter));
    return matchesSearch && matchesFilter;
  });

  // History: past sessions sorted by date desc
  const historySessions = useMemo(() => {
    return allSessions
      .filter(s => {
        if (historyFilter === 'team') return !s.isPersonal;
        if (historyFilter === 'personal') return s.isPersonal;
        return true;
      })
      .filter(s => {
        if (!historySearch) return true;
        const q = historySearch.toLowerCase();
        const playerName = getPlayerName(s.createdByPlayerId);
        return s.theme.toLowerCase().includes(q) || playerName.toLowerCase().includes(q);
      });
  }, [allSessions, historyFilter, historySearch, players]);

  const handleToggleFavorite = (drillId: string, isFavorite: boolean) => {
    updateDrill(drillId, { isFavorite });
  };

  const handleDrillClick = (drill: Drill) => {
    navigate(`/training/drill/${drill.id}`);
  };

  return (
    <AppLayout>
      <div className="page-container">
        <div className="section-header">
          <div>
            <h1 className="section-title">Träning</h1>
            <p className="text-muted-foreground mt-1">
              {sessions.length} pass planerade
            </p>
          </div>
          <Button className="gap-2" onClick={() => navigate('/training/session/new')}>
            <Plus className="h-4 w-4" />
            Skapa pass
          </Button>
        </div>

        <Tabs defaultValue="upcoming" className="mb-10">
          <TabsList>
            <TabsTrigger value="upcoming" className="gap-1.5">
              <Calendar className="h-4 w-4" />
              Kommande
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5">
              <History className="h-4 w-4" />
              Historik
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
              {sessions.map(session => (
                <div key={session.id} onClick={() => navigate(`/training/session/${session.id}`)} className="cursor-pointer">
                  <TrainingCard
                    session={session}
                    playerNames={getPlayerNames(session.playerIds)}
                    avgRPE={sessionRPEMap[session.id]?.avg}
                    rpeCount={sessionRPEMap[session.id]?.count}
                  />
                </div>
              ))}
            </div>

            {sessions.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">Inga pass planerade</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/training/session/new')}>
                  Skapa ditt första pass
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            <div className="flex flex-col sm:flex-row gap-3 mt-4 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Sök tema eller spelare..."
                  value={historySearch}
                  onChange={e => setHistorySearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant={historyFilter === 'all' ? 'default' : 'outline'} onClick={() => setHistoryFilter('all')}>
                  Alla
                </Button>
                <Button size="sm" variant={historyFilter === 'team' ? 'default' : 'outline'} onClick={() => setHistoryFilter('team')}>
                  Lagpass
                </Button>
                <Button size="sm" variant={historyFilter === 'personal' ? 'default' : 'outline'} onClick={() => setHistoryFilter('personal')}>
                  Personliga
                </Button>
              </div>
            </div>

            {historySessions.length > 0 ? (
              <div className="space-y-2">
                {historySessions.map(session => {
                  const rpeData = sessionRPEMap[session.id];
                  const playerName = session.isPersonal ? getPlayerName(session.createdByPlayerId) : '';
                  return (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => !session.isPersonal && navigate(`/training/session/${session.id}`)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{session.theme}</p>
                          {session.isPersonal && (
                            <Badge variant="outline" className="text-[10px] gap-1">
                              <User className="h-2.5 w-2.5" />
                              {playerName || 'Personligt'}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span>{format(new Date(session.date), 'yyyy-MM-dd')}</span>
                          <span>{session.duration} min</span>
                          {!session.isPersonal && <span>{session.playerIds.length} spelare</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {rpeData && (
                          <div className="text-center">
                            <div className="flex items-center gap-1">
                              <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className={`text-lg font-bold ${getRPEColor(rpeData.avg)}`}>
                                {rpeData.avg.toFixed(1)}
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                              {rpeData.count === 1 ? 'RPE' : `${rpeData.count} svar`}
                            </p>
                          </div>
                        )}
                        {!rpeData && (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <History className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">Ingen träningshistorik ännu</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Drill Library */}
        <div>
          <div className="section-header">
            <div>
              <div className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-primary" />
                <h2 className="section-title">Övningsbibliotek</h2>
              </div>
              <p className="text-muted-foreground mt-1">{drills.length} övningar</p>
            </div>
            <Button className="gap-2" onClick={() => navigate('/training/drill/new')}>
              <Plus className="h-4 w-4" />
              Lägg till övning
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Sök övningar..." value={drillSearch} onChange={(e) => setDrillSearch(e.target.value)} className="pl-10" />
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <Button variant={drillFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setDrillFilter('all')}>
                Alla
              </Button>
              <Button
                variant={drillFilter === 'favorites' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDrillFilter(drillFilter === 'favorites' ? 'all' : 'favorites')}
                className="gap-1"
              >
                <Star className={`h-3.5 w-3.5 ${drillFilter === 'favorites' ? 'fill-current' : ''}`} />
                Favoriter
              </Button>
              {allDrillCategories.map(cat => (
                <Button key={cat} variant={drillFilter === cat ? 'default' : 'outline'} size="sm" onClick={() => setDrillFilter(cat)}>
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDrills.map(drill => (
              <DrillCard key={drill.id} drill={drill} onClick={() => handleDrillClick(drill)} onToggleFavorite={handleToggleFavorite} />
            ))}
          </div>

          {filteredDrills.length === 0 && (
            <div className="text-center py-12">
              <Dumbbell className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">Inga övningar hittades</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate('/training/drill/new')}>
                Lägg till din första övning
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
