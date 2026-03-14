import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PlayCard } from '@/components/playbook/PlayCard';
import { usePlays, usePlayCategories } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, BookOpen, X } from 'lucide-react';
import { Play } from '@/types';
import { toast } from 'sonner';

export default function Playbook() {
  const navigate = useNavigate();
  const { plays } = usePlays();
  const { categories, addCategory, deleteCategory } = usePlayCategories();
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);

  const filteredPlays = plays.filter(play => {
    const matchesSearch = play.name.toLowerCase().includes(search.toLowerCase()) ||
                         play.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && play.category === filter;
  });

  const handlePlayClick = (play: Play) => {
    navigate(`/playbook/${play.id}`);
  };

  const handleAddPlay = () => {
    navigate('/playbook/new');
  };

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    if (categories.includes(trimmed)) {
      toast.error('Kategorin finns redan');
      return;
    }
    addCategory(trimmed);
    setNewCategory('');
    setShowAddCategory(false);
    toast.success(`Kategorin "${trimmed}" tillagd`);
  };

  const handleDeleteCategory = (cat: string) => {
    const usedByPlays = plays.some(p => p.category === cat);
    if (usedByPlays) {
      toast.error('Kan inte ta bort kategori som används av spelsystem');
      return;
    }
    deleteCategory(cat);
    if (filter === cat) setFilter('all');
    toast.success(`Kategorin "${cat}" borttagen`);
  };

  return (
    <AppLayout>
      <div className="page-container">
        {/* Header */}
        <div className="section-header">
          <div>
            <h1 className="section-title">Spelbok</h1>
            <p className="text-muted-foreground mt-1">
              {plays.length} spelsystem
            </p>
          </div>
          <Button className="gap-2" onClick={handleAddPlay}>
            <Plus className="h-4 w-4" />
            Lägg till spel
          </Button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Sök spelsystem eller taggar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Alla
            </Button>
            {categories.map(cat => (
              <div key={cat} className="relative group">
                <Button
                  variant={filter === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(cat)}
                >
                  {cat}
                </Button>
                <button
                  className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat); }}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}
            {showAddCategory ? (
              <div className="flex gap-1 items-center">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Kategorinamn"
                  className="h-8 w-32 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                  autoFocus
                />
                <Button size="sm" variant="ghost" onClick={handleAddCategory}>
                  <Plus className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setShowAddCategory(false); setNewCategory(''); }}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" className="border-dashed" onClick={() => setShowAddCategory(true)}>
                <Plus className="h-3 w-3 mr-1" />
                Kategori
              </Button>
            )}
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
            <p className="text-muted-foreground">Inga spelsystem hittades</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
