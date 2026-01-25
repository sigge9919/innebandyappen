import { useState } from 'react';
import { Target, MessageSquare, Edit2, Check, X } from 'lucide-react';
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
    <div className="stat-card animate-slide-up bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Weekly Focus</h3>
            </div>
            {!editingFocus && onFocusChange && (
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingFocus(true)}>
                <Edit2 className="h-3 w-3" />
              </Button>
            )}
          </div>
          {editingFocus ? (
            <div className="flex gap-2">
              <Input
                value={focusValue}
                onChange={(e) => setFocusValue(e.target.value)}
                className="flex-1"
                autoFocus
              />
              <Button size="icon" className="h-9 w-9" onClick={handleSaveFocus}>
                <Check className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline" className="h-9 w-9" onClick={handleCancelFocus}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <p className="text-xl font-bold text-foreground">{focus || 'Click edit to set focus'}</p>
          )}
        </div>

        <div className="border-t border-border/50 pt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium text-muted-foreground">Coach Notes</h4>
            </div>
            {!editingNotes && onNotesChange && (
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingNotes(true)}>
                <Edit2 className="h-3 w-3" />
              </Button>
            )}
          </div>
          {editingNotes ? (
            <div className="space-y-2">
              <Textarea
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                rows={3}
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <Button size="sm" onClick={handleSaveNotes}>
                  <Check className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelNotes}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {notes || 'Click edit to add notes'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
