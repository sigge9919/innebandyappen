import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
          // Initialize display positions
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
      const prevPos = prevKf.positions[player.id] || { x: player.x, y: player.y };
      const nextPos = nextKf.positions[player.id] || { x: player.x, y: player.y };
      
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

  // Canvas dimensions (smaller preview version)
  const width = 400;
  const height = 240;
  const scaleX = width / 800;
  const scaleY = height / 480;

  return (
    <div className={cn("rounded-lg overflow-hidden border bg-card", className)}>
      {/* Mini Tactics Board */}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full bg-background">
        {/* Field background */}
        <rect x="0" y="0" width={width} height={height} fill="hsl(var(--muted))" />
        
        {/* Field outline */}
        <rect 
          x={10 * scaleX} y={10 * scaleY} 
          width={(width - 20 * scaleX)} height={(height - 20 * scaleY)} 
          fill="none" stroke="hsl(var(--border))" strokeWidth="2"
          rx="4"
        />
        
        {/* Center line */}
        <line 
          x1={width / 2} y1={10 * scaleY} 
          x2={width / 2} y2={height - 10 * scaleY} 
          stroke="hsl(var(--border))" strokeWidth="1"
        />
        
        {/* Center circle */}
        <circle cx={width / 2} cy={height / 2} r={30 * scaleX} fill="none" stroke="hsl(var(--border))" strokeWidth="1" />
        
        {/* Goal areas */}
        <rect 
          x={10 * scaleX} y={(height / 2) - 40 * scaleY} 
          width={50 * scaleX} height={80 * scaleY} 
          fill="hsl(var(--primary) / 0.1)" stroke="hsl(var(--primary))" strokeWidth="1"
          rx="2"
        />
        <rect 
          x={width - 60 * scaleX} y={(height / 2) - 40 * scaleY} 
          width={50 * scaleX} height={80 * scaleY} 
          fill="hsl(var(--primary) / 0.1)" stroke="hsl(var(--primary))" strokeWidth="1"
          rx="2"
        />

        {/* Players */}
        {layout.players.map(player => {
          const pos = displayPositions[player.id] || { x: player.x, y: player.y };
          const scaledX = pos.x * scaleX;
          const scaledY = pos.y * scaleY;
          const radius = player.team === 'ball' ? 6 : 12;
          
          return (
            <g key={player.id}>
              <circle
                cx={scaledX}
                cy={scaledY}
                r={radius}
                fill={
                  player.team === 'home' ? 'hsl(var(--primary))' :
                  player.team === 'away' ? 'hsl(var(--destructive))' :
                  'hsl(30, 100%, 50%)'
                }
              />
              {player.number && player.team !== 'ball' && (
                <text
                  x={scaledX}
                  y={scaledY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="white"
                  fontSize="8"
                  fontWeight="bold"
                >
                  {player.number}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Playback controls for animations */}
      {hasAnimation && (
        <div className="flex items-center justify-center gap-2 p-2 border-t bg-muted/50">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setCurrentTime(0)}
          >
            <SkipBack className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setCurrentTime(1)}
          >
            <SkipForward className="h-3 w-3" />
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
      <div className="px-3 py-2 border-t text-sm font-medium truncate">
        {layout.name}
      </div>
    </div>
  );
}
