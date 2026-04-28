import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';
import { DashboardCard, DASHBOARD_CARD_LABELS } from '@/hooks/useDashboardLayout';
import { toast } from 'sonner';

interface DashboardCustomizerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  layout: DashboardCard[];
  onSave: (next: DashboardCard[]) => Promise<{ error: Error | null }>;
  onReset: () => Promise<{ error: Error | null }>;
}

export function DashboardCustomizer({ open, onOpenChange, layout, onSave, onReset }: DashboardCustomizerProps) {
  const [draft, setDraft] = useState<DashboardCard[]>(layout);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setDraft(layout);
  }, [open, layout]);

  const move = (index: number, dir: -1 | 1) => {
    const next = [...draft];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setDraft(next);
  };

  const toggle = (index: number, value: boolean) => {
    const next = [...draft];
    next[index] = { ...next[index], visible: value };
    setDraft(next);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await onSave(draft);
    setSaving(false);
    if (error) {
      toast.error('Kunde inte spara', { description: error.message });
    } else {
      toast.success('Översikt uppdaterad');
      onOpenChange(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    const { error } = await onReset();
    setSaving(false);
    if (error) {
      toast.error('Kunde inte återställa', { description: error.message });
    } else {
      toast.success('Återställd till standard');
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Anpassa översikt</SheetTitle>
          <SheetDescription>
            Slå av/på kort och ändra ordning. Sparas per lag.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-2">
          {draft.map((card, index) => (
            <div
              key={card.id}
              className="flex items-center gap-2 p-3 rounded-lg border border-border bg-card"
            >
              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Flytta upp"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => move(index, 1)}
                  disabled={index === draft.length - 1}
                  aria-label="Flytta ned"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
              </div>
              <span className="flex-1 text-sm font-medium">
                {DASHBOARD_CARD_LABELS[card.id]}
              </span>
              <Switch
                checked={card.visible}
                onCheckedChange={(v) => toggle(index, v)}
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 pt-3 border-t border-border">
          <Button onClick={handleSave} disabled={saving}>
            Spara
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={saving}>
              Avbryt
            </Button>
            <Button variant="ghost" className="flex-1" onClick={handleReset} disabled={saving}>
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Återställ
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}