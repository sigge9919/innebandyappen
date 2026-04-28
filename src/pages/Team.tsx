import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PlayerCard } from '@/components/team/PlayerCard';
import { PlayerFormDialog } from '@/components/forms/PlayerFormDialog';
import { usePlayers } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Users, AlertTriangle, Target, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Player } from '@/types';

type FilterType = 'all' | 'active' | 'injured' | 'focus' | 'archived';
type SortType = 'number' | 'name' | 'position';

const POSITION_RANK: Record<string, number> = {
  Goalkeeper: 0,
  Defender: 1,
  Forward: 2,
};

export default function Team() {
  const navigate = useNavigate();
  const { players, addPlayer, updatePlayer, deletePlayer } = usePlayers();
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('number');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const filteredPlayers = players.filter(player => {
    const positionsText = player.positions?.join(' ').toLowerCase() || '';
    const matchesSearch = player.name.toLowerCase().includes(search.toLowerCase()) ||
                         positionsText.includes(search.toLowerCase());
    switch (filter) {
      case 'active':
        return matchesSearch && player.status === 'Active';
      case 'injured':
        return matchesSearch && player.status === 'Injured';
      case 'archived':
        return matchesSearch && player.status === 'Archived';
      case 'focus':
        return matchesSearch && player.focusFlag;
      default:
        return matchesSearch && player.status !== 'Archived';
    }
  });

  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    if (sort === 'name') {
      return a.name.localeCompare(b.name, 'sv');
    }
    if (sort === 'position') {
      const ra = POSITION_RANK[a.positions?.[0] ?? (a as any).position ?? 'Forward'] ?? 99;
      const rb = POSITION_RANK[b.positions?.[0] ?? (b as any).position ?? 'Forward'] ?? 99;
      if (ra !== rb) return ra - rb;
      return (a.jerseyNumber ?? 0) - (b.jerseyNumber ?? 0);
    }
    return (a.jerseyNumber ?? 0) - (b.jerseyNumber ?? 0);
  });

  const archivedCount = players.filter(p => p.status === 'Archived').length;

  const filterButtons: { value: FilterType; label: string; icon: React.ElementType; count: number }[] = [
    { value: 'all', label: 'Alla', icon: Users, count: players.filter(p => p.status !== 'Archived').length },
    { value: 'active', label: 'Aktiva', icon: Users, count: players.filter(p => p.status === 'Active').length },
    { value: 'injured', label: 'Skadade', icon: AlertTriangle, count: players.filter(p => p.status === 'Injured').length },
    { value: 'focus', label: 'Fokus', icon: Target, count: players.filter(p => p.focusFlag && p.status !== 'Archived').length },
    ...(archivedCount > 0 ? [{ value: 'archived' as FilterType, label: 'Arkiverade', icon: Archive, count: archivedCount }] : []),
  ];

  const handlePlayerClick = (player: Player) => {
    navigate(`/team/${player.id}`);
  };

  const handleAddPlayer = () => {
    setSelectedPlayer(null);
    setDialogOpen(true);
  };

  const handleSavePlayer = (player: Player) => {
    if (selectedPlayer) {
      updatePlayer(player.id, player);
    } else {
      addPlayer(player);
    }
  };

  return (
    <AppLayout>
      <div className="page-container">
        {/* Header */}
        <div className="section-header">
          <div>
            <h1 className="section-title">Lag</h1>
            <p className="text-muted-foreground mt-1">{players.length} spelare</p>
          </div>
          <Button className="gap-2" onClick={handleAddPlayer}>
            <Plus className="h-4 w-4" />
            Lägg till spelare
          </Button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Sök spelare..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {filterButtons.map(btn => (
              <Button
                key={btn.value}
                variant={filter === btn.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(btn.value)}
                className="gap-2"
              >
                <btn.icon className="h-4 w-4" />
                {btn.label}
                <span className={cn(
                  'ml-1 px-1.5 py-0.5 rounded-full text-xs',
                  filter === btn.value 
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}>
                  {btn.count}
                </span>
              </Button>
            ))}
          </div>
          <Select value={sort} onValueChange={(v) => setSort(v as SortType)}>
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="Sortera" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="number">Nummer</SelectItem>
              <SelectItem value="name">Namn (A–Ö)</SelectItem>
              <SelectItem value="position">Position</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Player List */}
        <div className="grid gap-4 md:grid-cols-2">
          {sortedPlayers.map(player => (
            <PlayerCard 
              key={player.id} 
              player={player} 
              onClick={() => handlePlayerClick(player)}
            />
          ))}
        </div>

        {sortedPlayers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Inga spelare hittades</p>
          </div>
        )}
      </div>

      <PlayerFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        player={selectedPlayer}
        onSave={handleSavePlayer}
        onDelete={deletePlayer}
      />
    </AppLayout>
  );
}
