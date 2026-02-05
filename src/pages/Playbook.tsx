import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PlayCard } from '@/components/playbook/PlayCard';
import { usePlays } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, BookOpen } from 'lucide-react';
import { Play } from '@/types';

type CategoryFilter = 'all' | 'System' | 'Set Play' | 'Special Teams';

export default function Playbook() {
  const navigate = useNavigate();
  const { plays } = usePlays();
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [search, setSearch] = useState('');

  const filteredPlays = plays.filter(play => {
    const matchesSearch = play.name.toLowerCase().includes(search.toLowerCase()) ||
                         play.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && play.category === filter;
  });

  const categories: CategoryFilter[] = ['all', 'System', 'Set Play', 'Special Teams'];

  const handlePlayClick = (play: Play) => {
    navigate(`/playbook/${play.id}`);
  };

  const handleAddPlay = () => {
    navigate('/playbook/new');
  };

  return (
    <AppLayout>
      <div className="page-container">
        {/* Header */}
        <div className="section-header">
          <div>
            <h1 className="section-title">Playbook</h1>
            <p className="text-muted-foreground mt-1">
              {plays.length} plays
            </p>
          </div>
          <Button className="gap-2" onClick={handleAddPlay}>
            <Plus className="h-4 w-4" />
            Add Play
          </Button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search plays or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={filter === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(cat)}
              >
                {cat === 'all' ? 'All Plays' : cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Plays Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPlays.map(play => (
            <PlayCard 
              key={play.id} 
              play={play}
              onClick={() => handlePlayClick(play)}
            />
          ))}
        </div>

        {filteredPlays.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No plays found</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
