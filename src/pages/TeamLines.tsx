import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineFormationBoard } from '@/components/lines/LineFormationBoard';
import { usePlayers } from '@/hooks/useLocalStorage';
import { useLineLayouts } from '@/hooks/useLineLayouts';
import {
  LineLayoutType,
  LineSlot,
  createDefaultSlots,
} from '@/types/lineLayout';
import { ArrowLeft, Plus, Save, Trash2, Copy, Pencil, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const TYPE_LABELS: Record<LineLayoutType, string> = {
  '5v5': '5 mot 5',
  PP: 'Powerplay (5v4)',
  PK: 'Boxplay (4v5)',
  '6v5': '6 mot 5 (Tom kasse)',
  '5v6': '5 mot 6 (Försvar tom kasse)',
};

export default function TeamLines() {
  const navigate = useNavigate();
  const { players } = usePlayers();
  const { layouts, loading, createLayout, updateLayout, deleteLayout } =
    useLineLayouts();

  const [type, setType] = useState<LineLayoutType>('5v5');
  const [slots, setSlots] = useState<LineSlot[]>(() => createDefaultSlots('5v5'));
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // When type changes and we are not editing an existing layout, reset slots
  useEffect(() => {
    if (!editingId) setSlots(createDefaultSlots(type));
  }, [type, editingId]);

  const filteredLayouts = useMemo(
    () => layouts.filter(l => l.type === type),
    [layouts, type]
  );

  const handleNew = () => {
    setEditingId(null);
    setName('');
    setSlots(createDefaultSlots(type));
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error('Ge uppställningen ett namn');
      return;
    }
    if (editingId) {
      const { error } = await updateLayout(editingId, { name: trimmed, slots, type });
      if (error) toast.error('Kunde inte spara');
      else toast.success('Uppställning uppdaterad');
    } else {
      const result = await createLayout(trimmed, type, slots);
      if (result.error) toast.error('Kunde inte spara');
      else {
        toast.success('Uppställning sparad');
        if ('layout' in result && result.layout) setEditingId(result.layout.id);
      }
    }
  };

  const handleLoad = (id: string) => {
    const layout = layouts.find(l => l.id === id);
    if (!layout) return;
    setType(layout.type);
    setSlots(layout.slots.length ? layout.slots : createDefaultSlots(layout.type));
    setName(layout.name);
    setEditingId(layout.id);
  };

  const handleDuplicate = async (id: string) => {
    const layout = layouts.find(l => l.id === id);
    if (!layout) return;
    const result = await createLayout(`${layout.name} (kopia)`, layout.type, layout.slots);
    if (result.error) toast.error('Kunde inte duplicera');
    else toast.success('Duplicerad');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Ta bort uppställningen?')) return;
    const { error } = await deleteLayout(id);
    if (error) toast.error('Kunde inte ta bort');
    else {
      toast.success('Borttagen');
      if (editingId === id) handleNew();
    }
  };

  const handleRenameSubmit = async (id: string) => {
    const trimmed = renameValue.trim();
    if (!trimmed) return;
    const { error } = await updateLayout(id, { name: trimmed });
    if (error) toast.error('Kunde inte byta namn');
    setRenamingId(null);
  };

  const filledCount = slots.filter(s => s.playerId).length;

  return (
    <AppLayout>
      <div className="page-container">
        <div className="section-header">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/team')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="section-title">Lines</h1>
              <p className="text-muted-foreground mt-1">
                Bygg och spara kedjeuppställningar inför match
              </p>
            </div>
          </div>
        </div>

        {/* Type tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {(Object.keys(TYPE_LABELS) as LineLayoutType[]).map(t => (
            <Button
              key={t}
              variant={type === t ? 'default' : 'outline'}
              onClick={() => {
                setType(t);
                setEditingId(null);
                setName('');
              }}
            >
              {TYPE_LABELS[t]}
            </Button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Builder */}
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <Input
                placeholder="Namnge uppställningen..."
                value={name}
                onChange={e => setName(e.target.value)}
                className="flex-1"
              />
              <div className="flex gap-2">
                <Button onClick={handleSave} className="gap-2">
                  <Save className="h-4 w-4" />
                  {editingId ? 'Uppdatera' : 'Spara'}
                </Button>
                <Button variant="outline" onClick={handleNew} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Ny
                </Button>
              </div>
            </div>

            <div className="text-xs text-muted-foreground mb-2">
              {filledCount} av {slots.length} positioner tilldelade
              {editingId && (
                <span className="ml-2 text-primary">• Redigerar sparad uppställning</span>
              )}
            </div>

            <LineFormationBoard
              type={type}
              slots={slots}
              players={players.filter(p => p.status !== 'Archived')}
              onChange={setSlots}
            />
          </Card>

          {/* Sidebar list */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">
              Sparade {TYPE_LABELS[type]}
            </h3>
            {loading && (
              <p className="text-sm text-muted-foreground">Laddar...</p>
            )}
            {!loading && filteredLayouts.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Inga sparade uppställningar än.
              </p>
            )}
            <div className="space-y-2">
              {filteredLayouts.map(l => {
                const filled = l.slots.filter(s => s.playerId).length;
                const total = l.slots.length || createDefaultSlots(l.type).length;
                const isActive = editingId === l.id;
                const isRenaming = renamingId === l.id;
                return (
                  <div
                    key={l.id}
                    className={cn(
                      'p-3 rounded-md border transition-colors',
                      isActive
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card'
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {isRenaming ? (
                        <>
                          <Input
                            value={renameValue}
                            onChange={e => setRenameValue(e.target.value)}
                            className="h-8 flex-1"
                            autoFocus
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleRenameSubmit(l.id);
                              if (e.key === 'Escape') setRenamingId(null);
                            }}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => handleRenameSubmit(l.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => setRenamingId(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <button
                            className="font-medium text-left flex-1 truncate hover:text-primary"
                            onClick={() => handleLoad(l.id)}
                          >
                            {l.name}
                          </button>
                          <Badge variant="secondary" className="text-xs">
                            {filled}/{total}
                          </Badge>
                        </>
                      )}
                    </div>
                    {!isRenaming && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleLoad(l.id)}
                        >
                          Ladda
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => {
                            setRenamingId(l.id);
                            setRenameValue(l.name);
                          }}
                          title="Byt namn"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => handleDuplicate(l.id)}
                          title="Duplicera"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(l.id)}
                          title="Ta bort"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}