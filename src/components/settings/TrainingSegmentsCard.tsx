import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { ListOrdered, Plus, ArrowUp, ArrowDown, Trash2, Check, X, Pencil } from 'lucide-react';
import { useTrainingSegments, TrainingSegment } from '@/hooks/useTrainingSegments';

export function TrainingSegmentsCard({ canEdit }: { canEdit: boolean }) {
  const { segments, addSegment, renameSegment, deleteSegment, moveSegment, countUsage } = useTrainingSegments();
  const { toast } = useToast();
  const [newName, setNewName] = useState('');
  const [newPosition, setNewPosition] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [pendingDelete, setPendingDelete] = useState<{ segment: TrainingSegment; usage: number } | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const pos = newPosition.trim() ? parseInt(newPosition, 10) - 1 : undefined;
    await addSegment(newName.trim(), Number.isNaN(pos as number) ? undefined : pos);
    setNewName('');
    setNewPosition('');
    toast({ title: 'Segment tillagt' });
  };

  const startEdit = (s: TrainingSegment) => {
    setEditingId(s.id);
    setEditingName(s.name);
  };

  const saveEdit = async () => {
    if (editingId && editingName.trim()) {
      await renameSegment(editingId, editingName.trim());
    }
    setEditingId(null);
  };

  const requestDelete = async (s: TrainingSegment) => {
    const usage = await countUsage(s.id);
    setPendingDelete({ segment: s, usage });
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    await deleteSegment(pendingDelete.segment.id);
    setPendingDelete(null);
    toast({ title: 'Segment borttaget' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ListOrdered className="h-5 w-5" /> Träningssegment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Segmenten används när ni bygger träningspass. Ordningen här styr ordningen i passbyggaren.
        </p>

        <div className="space-y-2">
          {segments.map((s, index) => (
            <div key={s.id} className="flex items-center gap-2 py-2 border-b border-border last:border-0">
              <span className="text-xs text-muted-foreground w-5">{index + 1}.</span>
              {editingId === s.id ? (
                <>
                  <Input
                    value={editingName}
                    onChange={e => setEditingName(e.target.value)}
                    className="h-8 flex-1"
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={saveEdit}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingId(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="text-sm font-medium flex-1">{s.name}</span>
                  {s.isDefault && <Badge variant="secondary" className="text-xs">Standard</Badge>}
                  {canEdit && (
                    <>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => moveSegment(s.id, -1)} disabled={index === 0}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => moveSegment(s.id, 1)} disabled={index === segments.length - 1}>
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(s)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => requestDelete(s)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
          ))}
          {segments.length === 0 && (
            <p className="text-sm text-muted-foreground">Inga segment ännu.</p>
          )}
        </div>

        {canEdit && (
          <form onSubmit={handleAdd} className="flex items-end gap-3">
            <div className="flex-1 space-y-1">
              <Label htmlFor="segmentName">Nytt segment</Label>
              <Input
                id="segmentName"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="t.ex. Teknikstation"
                required
              />
            </div>
            <div className="w-24 space-y-1">
              <Label htmlFor="segmentPos">Placering</Label>
              <Input
                id="segmentPos"
                type="number"
                min={1}
                max={segments.length + 1}
                value={newPosition}
                onChange={e => setNewPosition(e.target.value)}
                placeholder={String(segments.length + 1)}
              />
            </div>
            <Button type="submit" className="gap-1">
              <Plus className="h-4 w-4" /> Lägg till
            </Button>
          </form>
        )}

        <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Ta bort segment?</AlertDialogTitle>
              <AlertDialogDescription>
                {pendingDelete?.usage
                  ? `Segmentet "${pendingDelete.segment.name}" används i ${pendingDelete.usage} sparade träningspass. Tas det bort ligger passen kvar men segmentet visas som fristående rubrik. Vill du fortsätta?`
                  : `Segmentet "${pendingDelete?.segment.name}" används inte i något sparat pass och kan tas bort.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Avbryt</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>Ta bort</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
