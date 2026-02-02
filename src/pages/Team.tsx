import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PlayerCard } from '@/components/team/PlayerCard';
import { PlayerFormDialog } from '@/components/forms/PlayerFormDialog';
import { usePlayers } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Users, AlertTriangle, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Player } from '@/types';

type FilterType = 'all' | 'active' | 'injured' | 'focus';

export default function Team() {
  const navigate = useNavigate();
  const { players, addPlayer, updatePlayer, deletePlayer } = usePlayers();
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(search.toLowerCase()) ||
                         player.position.toLowerCase().includes(search.toLowerCase());
    
    switch (filter) {
      case 'active':
        return matchesSearch && player.status === 'Active';
      case 'injured':
        return matchesSearch && player.status === 'Injured';
      case 'focus':
        return matchesSearch && player.focusFlag;
      default:
        return matchesSearch;
    }
  });

  const filterButtons: { value: FilterType; label: string; icon: React.ElementType; count: number }[] = [
    { value: 'all', label: 'All', icon: Users, count: players.length },
    { value: 'active', label: 'Active', icon: Users, count: players.filter(p => p.status === 'Active').length },
    { value: 'injured', label: 'Injured', icon: AlertTriangle, count: players.filter(p => p.status === 'Injured').length },
    { value: 'focus', label: 'Focus', icon: Target, count: players.filter(p => p.focusFlag).length },
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
            <h1 className="section-title">Team</h1>
            <p className="text-muted-foreground mt-1">{players.length} players</p>
          </div>
          <Button className="gap-2" onClick={handleAddPlayer}>
            <Plus className="h-4 w-4" />
            Add Player
          </Button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search players..."
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
        </div>

        {/* Player List */}
        <div className="grid gap-4 md:grid-cols-2">
          {filteredPlayers.map(player => (
            <PlayerCard 
              key={player.id} 
              player={player} 
              onClick={() => handlePlayerClick(player)}
            />
          ))}
        </div>

        {filteredPlayers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No players found</p>
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
