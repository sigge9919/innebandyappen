import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { IndividualDevelopmentPlan, Player } from '@/types';
import { Plus, X } from 'lucide-react';

interface IDPFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idp?: IndividualDevelopmentPlan | null;
  player: Player | null;
  onSave: (idp: IndividualDevelopmentPlan) => void;
}

export function IDPFormDialog({ open, onOpenChange, idp, player, onSave }: IDPFormDialogProps) {
  const [formData, setFormData] = useState({
    focusAreas: [''],
    shortTermGoals: [''],
    coachNotes: '',
  });

  useEffect(() => {
    if (idp) {
      setFormData({
        focusAreas: idp.focusAreas.length > 0 ? idp.focusAreas : [''],
        shortTermGoals: idp.shortTermGoals.length > 0 ? idp.shortTermGoals : [''],
        coachNotes: idp.coachNotes,
      });
    } else {
      setFormData({
        focusAreas: [''],
        shortTermGoals: [''],
        coachNotes: '',
      });
    }
  }, [idp, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!player) return;
    
    const newIDP: IndividualDevelopmentPlan = {
      playerId: player.id,
      focusAreas: formData.focusAreas.filter(fa => fa.trim() !== ''),
      shortTermGoals: formData.shortTermGoals.filter(g => g.trim() !== ''),
      coachNotes: formData.coachNotes,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    onSave(newIDP);
    onOpenChange(false);
  };

  const addField = (field: 'focusAreas' | 'shortTermGoals') => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeField = (field: 'focusAreas' | 'shortTermGoals', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const updateField = (field: 'focusAreas' | 'shortTermGoals', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  if (!player) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Development Plan - {player.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Focus Areas</Label>
                <Button type="button" variant="ghost" size="sm" onClick={() => addField('focusAreas')}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {formData.focusAreas.map((area, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={area}
                      onChange={(e) => updateField('focusAreas', index, e.target.value)}
                      placeholder={`Focus area ${index + 1}`}
                    />
                    {formData.focusAreas.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeField('focusAreas', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Short-Term Goals</Label>
                <Button type="button" variant="ghost" size="sm" onClick={() => addField('shortTermGoals')}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {formData.shortTermGoals.map((goal, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={goal}
                      onChange={(e) => updateField('shortTermGoals', index, e.target.value)}
                      placeholder={`Goal ${index + 1}`}
                    />
                    {formData.shortTermGoals.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeField('shortTermGoals', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="coachNotes">Coach Notes</Label>
              <Textarea
                id="coachNotes"
                value={formData.coachNotes}
                onChange={(e) => setFormData({ ...formData, coachNotes: e.target.value })}
                placeholder="Notes on player development..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Development Plan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
