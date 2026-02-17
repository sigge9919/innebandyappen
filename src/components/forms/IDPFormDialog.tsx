import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { IndividualDevelopmentPlan, Player } from '@/types';
import { Plus, X, CalendarIcon, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IDPFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idp?: IndividualDevelopmentPlan | null;
  player: Player | null;
  onSave: (idp: IndividualDevelopmentPlan) => void;
  onDelete?: (id: string) => void;
}

export function IDPFormDialog({ open, onOpenChange, idp, player, onSave, onDelete }: IDPFormDialogProps) {
  const [formData, setFormData] = useState({
    goal: '',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    focusAreas: [''],
    shortTermGoals: [''],
    coachNotes: '',
  });

  useEffect(() => {
    if (idp) {
      setFormData({
        goal: idp.goal,
        startDate: idp.startDate ? new Date(idp.startDate) : undefined,
        endDate: idp.endDate ? new Date(idp.endDate) : undefined,
        focusAreas: idp.focusAreas.length > 0 ? idp.focusAreas : [''],
        shortTermGoals: idp.shortTermGoals.length > 0 ? idp.shortTermGoals : [''],
        coachNotes: idp.coachNotes,
      });
    } else {
      setFormData({
        goal: '',
        startDate: undefined,
        endDate: undefined,
        focusAreas: [''],
        shortTermGoals: [''],
        coachNotes: '',
      });
    }
  }, [idp, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!player || !formData.goal.trim()) return;
    
    const newIDP: IndividualDevelopmentPlan = {
      id: idp?.id || crypto.randomUUID(),
      playerId: player.id,
      goal: formData.goal.trim(),
      startDate: formData.startDate ? format(formData.startDate, 'yyyy-MM-dd') : new Date().toISOString().split('T')[0],
      endDate: formData.endDate ? format(formData.endDate, 'yyyy-MM-dd') : '',
      focusAreas: formData.focusAreas.filter(fa => fa.trim() !== ''),
      shortTermGoals: formData.shortTermGoals.filter(g => g.trim() !== ''),
      coachNotes: formData.coachNotes,
      completed: idp?.completed || false,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    onSave(newIDP);
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (idp && onDelete) {
      onDelete(idp.id);
      onOpenChange(false);
    }
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Development Plan - {player.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="goal">Goal *</Label>
              <Input
                id="goal"
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                placeholder="e.g. Become a stronger two-way player"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !formData.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? format(formData.startDate, "PPP") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) => setFormData({ ...formData, startDate: date })}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !formData.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? format(formData.endDate, "PPP") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) => setFormData({ ...formData, endDate: date })}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

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
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeField('focusAreas', index)}>
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
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeField('shortTermGoals', index)}>
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
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {idp && onDelete && (
              <Button type="button" variant="destructive" onClick={handleDelete} className="sm:mr-auto">
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
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
