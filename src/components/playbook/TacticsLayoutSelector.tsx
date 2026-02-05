import { useState, useEffect } from 'react';
import { CheckCircle, Circle, Film, Layout } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TacticsLayout {
  id: string;
  name: string;
  hasAnimation: boolean;
}

interface TacticsLayoutSelectorProps {
  selectedIds: string[];
  onSelect: (layoutId: string) => void;
}

export function TacticsLayoutSelector({ selectedIds, onSelect }: TacticsLayoutSelectorProps) {
  const [layouts, setLayouts] = useState<TacticsLayout[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('tactics-layouts');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const layoutList = parsed.map((layout: any) => ({
          id: layout.id,
          name: layout.name,
          hasAnimation: layout.keyframes && layout.keyframes.length > 1,
        }));
        setLayouts(layoutList);
      } catch (e) {
        console.error('Failed to parse tactics layouts:', e);
      }
    }
  }, []);

  if (layouts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Layout className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p>No saved tactics board layouts</p>
        <p className="text-sm mt-1">Create layouts in the Tactics Board to link them here</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {layouts.map(layout => {
        const isSelected = selectedIds.includes(layout.id);
        return (
          <button
            key={layout.id}
            onClick={() => onSelect(layout.id)}
            className={cn(
              "flex items-center gap-3 p-4 rounded-lg border transition-all text-left",
              isSelected 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-muted-foreground/30"
            )}
          >
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full",
              isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
            )}>
              {layout.hasAnimation ? (
                <Film className="h-5 w-5" />
              ) : (
                <Layout className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{layout.name}</p>
              <p className="text-xs text-muted-foreground">
                {layout.hasAnimation ? 'Animated' : 'Static'}
              </p>
            </div>
            {isSelected ? (
              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground/30 flex-shrink-0" />
            )}
          </button>
        );
      })}
    </div>
  );
}
