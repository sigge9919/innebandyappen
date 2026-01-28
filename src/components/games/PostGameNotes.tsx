import { useState } from 'react';
import { EnhancedGame } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Edit2, Save, X } from 'lucide-react';

interface PostGameNotesProps {
  game: EnhancedGame;
  onUpdateNotes: (notes: EnhancedGame['notes']) => void;
}

export function PostGameNotes({ game, onUpdateNotes }: PostGameNotesProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(game.notes || {
    whatWorked: '',
    whatDidnt: '',
    focusNextWeek: '',
  });

  const handleSave = () => {
    onUpdateNotes(notes);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setNotes(game.notes || { whatWorked: '', whatDidnt: '', focusNextWeek: '' });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={handleCancel}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="whatWorked">What Worked</Label>
            <Textarea
              id="whatWorked"
              value={notes.whatWorked}
              onChange={(e) => setNotes({ ...notes, whatWorked: e.target.value })}
              placeholder="What went well in this game?"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatDidnt">What Didn't Work</Label>
            <Textarea
              id="whatDidnt"
              value={notes.whatDidnt}
              onChange={(e) => setNotes({ ...notes, whatDidnt: e.target.value })}
              placeholder="What needs improvement?"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="focusNextWeek">Focus for Next Week</Label>
            <Textarea
              id="focusNextWeek"
              value={notes.focusNextWeek}
              onChange={(e) => setNotes({ ...notes, focusNextWeek: e.target.value })}
              placeholder="Key areas to work on"
              rows={3}
            />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
          <Edit2 className="h-4 w-4 mr-1" />
          Edit
        </Button>
      </div>

      {game.notes ? (
        <div className="space-y-4">
          {game.notes.whatWorked && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                What Worked
              </p>
              <p className="text-sm text-foreground">{game.notes.whatWorked}</p>
            </div>
          )}
          {game.notes.whatDidnt && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                What Didn't Work
              </p>
              <p className="text-sm text-foreground">{game.notes.whatDidnt}</p>
            </div>
          )}
          {game.notes.focusNextWeek && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                Focus for Next Week
              </p>
              <p className="text-sm text-foreground">{game.notes.focusNextWeek}</p>
            </div>
          )}
          {!game.notes.whatWorked && !game.notes.whatDidnt && !game.notes.focusNextWeek && (
            <p className="text-sm text-muted-foreground italic">No notes added yet</p>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">No notes added yet</p>
      )}
    </div>
  );
}
