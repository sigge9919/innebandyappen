import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface WeeklyFocusCardProps {
  focus: string;
  notes: string;
  onFocusChange?: (focus: string) => void;
  onNotesChange?: (notes: string) => void;
}

export function WeeklyFocusCard({ focus, notes, onFocusChange, onNotesChange }: WeeklyFocusCardProps) {
  const [editingFocus, setEditingFocus] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [focusValue, setFocusValue] = useState(focus);
  const [notesValue, setNotesValue] = useState(notes);

  const handleSaveFocus = () => {
    onFocusChange?.(focusValue);
    setEditingFocus(false);
  };

  const handleSaveNotes = () => {
    onNotesChange?.(notesValue);
    setEditingNotes(false);
  };

  const handleCancelFocus = () => {
    setFocusValue(focus);
    setEditingFocus(false);
  };

  const handleCancelNotes = () => {
    setNotesValue(notes);
    setEditingNotes(false);
  };

  return (
    <div className="stat-card">
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <h3 className="metric-label">Weekly Focus</h3>
          {!editingFocus && onFocusChange && (
            <button onClick={() => setEditingFocus(true)} className="text-xs text-primary hover:underline">Edit</button>
          )}
        </div>
        {editingFocus ? (
          <div className="flex gap-2">
            <Input
              value={focusValue}
              onChange={(e) => setFocusValue(e.target.value)}
              className="flex-1 h-8 text-sm"
              autoFocus
            />
            <Button size="icon" className="h-8 w-8" onClick={handleSaveFocus}>
              <Check className="h-3 w-3" />
            </Button>
            <Button size="icon" variant="outline" className="h-8 w-8" onClick={handleCancelFocus}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <p className="text-base font-semibold text-foreground">{focus || 'Not set'}</p>
        )}
      </div>

      <div className="border-t border-border pt-3">
        <div className="flex items-center justify-between mb-1">
          <h4 className="metric-label">Coach Notes</h4>
          {!editingNotes && onNotesChange && (
            <button onClick={() => setEditingNotes(true)} className="text-xs text-primary hover:underline">Edit</button>
          )}
        </div>
        {editingNotes ? (
          <div className="space-y-2">
            <Textarea
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              rows={3}
              className="text-sm"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <Button size="sm" className="h-7 text-xs" onClick={handleSaveNotes}>Save</Button>
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleCancelNotes}>Cancel</Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {notes || 'No notes'}
          </p>
        )}
      </div>
    </div>
  );
}
