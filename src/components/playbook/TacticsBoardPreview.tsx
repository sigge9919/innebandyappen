import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Maximize2, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TacticsBoardFullscreen } from './TacticsBoardFullscreen';
import { TacticsBoardRenderer } from './TacticsBoardRenderer';

interface PlayerMarker {
  id: string;
  x: number;
  y: number;
  team: 'home' | 'away' | 'ball';
  number?: string;
}

interface Keyframe {
  id: string;
  timestamp: number;
  positions: { [playerId: string]: { x: number; y: number } };
}

interface TacticsLayout {
  id: string;
  name: string;
  players: PlayerMarker[];
  drawings: any[];
  keyframes: Keyframe[];
}

interface TacticsBoardPreviewProps {
  layoutId: string;
  className?: string;
}

export function TacticsBoardPreview({ layoutId, className }: TacticsBoardPreviewProps) {
  const [layout, setLayout] = useState<TacticsLayout | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [displayPositions, setDisplayPositions] = useState<{ [playerId: string]: { x: number; y: number } }>({});
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  
  const hasAnimation = layout?.keyframes && layout.keyframes.length > 1;

  useEffect(() => {
    const stored = localStorage.getItem('tactics-layouts');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const found = parsed.find((l: TacticsLayout) => l.id === layoutId);
        if (found) {
          setLayout(found);
          const initial: { [id: string]: { x: number; y: number } } = {};
          found.players.forEach((p: PlayerMarker) => {
            initial[p.id] = { x: p.x, y: p.y };
          });
          setDisplayPositions(initial);
        }
      } catch (e) {
        console.error('Failed to load layout:', e);
      }
    }
  }, [layoutId]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || !hasAnimation || !layout) return;

    const animate = (timestamp: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
      const delta = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      setCurrentTime(prev => {
        const next = prev + delta;
        if (next >= 1) {
          return 0;
        }
        return next;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      lastTimeRef.current = 0;
    };
  }, [isPlaying, hasAnimation, layout]);

  // Interpolate positions
  useEffect(() => {
    if (!layout || !hasAnimation) return;

    const keyframes = layout.keyframes.sort((a, b) => a.timestamp - b.timestamp);
    let prevKf = keyframes[0];
    let nextKf = keyframes[keyframes.length - 1];

    for (let i = 0; i < keyframes.length - 1; i++) {
      if (currentTime >= keyframes[i].timestamp && currentTime <= keyframes[i + 1].timestamp) {
        prevKf = keyframes[i];
        nextKf = keyframes[i + 1];
        break;
      }
    }

    const range = nextKf.timestamp - prevKf.timestamp;
    const progress = range > 0 ? (currentTime - prevKf.timestamp) / range : 0;

    const interpolated: { [id: string]: { x: number; y: number } } = {};
    layout.players.forEach(player => {
      const prevPos = prevKf.positions?.[player.id] || { x: player.x, y: player.y };
      const nextPos = nextKf.positions?.[player.id] || { x: player.x, y: player.y };
      
      interpolated[player.id] = {
        x: prevPos.x + (nextPos.x - prevPos.x) * progress,
        y: prevPos.y + (nextPos.y - prevPos.y) * progress,
      };
    });

    setDisplayPositions(interpolated);
  }, [currentTime, layout, hasAnimation]);

  if (!layout) {
    return (
      <div className={cn("bg-muted rounded-lg flex items-center justify-center h-48", className)}>
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div 
        className={cn(
          "rounded-lg overflow-hidden border bg-card cursor-pointer group hover:border-primary/50 transition-colors",
          className
        )}
        onClick={() => setFullscreenOpen(true)}
      >
        {/* Mini Tactics Board */}
        <div className="relative">
          <TacticsBoardRenderer
            players={layout.players}
            displayPositions={displayPositions}
            width={400}
            height={240}
          />
          
          {/* Overlay with expand icon */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 rounded-full p-3 shadow-lg">
              <Maximize2 className="h-5 w-5" />
            </div>
          </div>
          
          {/* Animation indicator */}
          {hasAnimation && (
            <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1.5">
              <Film className="h-3 w-3" />
            </div>
          )}
        </div>

        {/* Playback controls for animations */}
        {hasAnimation && (
          <div 
            className="flex items-center justify-center gap-2 p-2 border-t bg-muted/50"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                setIsPlaying(!isPlaying);
              }}
            >
              {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            </Button>
            <div className="flex-1 mx-2 h-1 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all"
                style={{ width: `${currentTime * 100}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Layout name */}
        <div className="px-3 py-2 border-t text-sm font-medium truncate flex items-center gap-2">
          {layout.name}
          <span className="ml-auto text-xs text-muted-foreground group-hover:text-primary transition-colors">
            Click to expand
          </span>
        </div>
      </div>

      <TacticsBoardFullscreen
        open={fullscreenOpen}
        onOpenChange={setFullscreenOpen}
        layoutId={layoutId}
      />
    </>
  );
}
