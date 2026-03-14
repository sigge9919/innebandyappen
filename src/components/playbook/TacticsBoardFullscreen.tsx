import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, X, Film, ExternalLink } from 'lucide-react';
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
  curveControlPoints?: { [playerId: string]: { x: number; y: number } };
}

interface ShadowZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TacticsLayout {
  id: string;
  name: string;
  players: PlayerMarker[];
  drawings: any[];
  keyframes: Keyframe[];
  zones: ShadowZone[];
}

interface TacticsBoardFullscreenProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  layoutId: string;
}

export function TacticsBoardFullscreen({ open, onOpenChange, layoutId }: TacticsBoardFullscreenProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [layout, setLayout] = useState<TacticsLayout | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [displayPositions, setDisplayPositions] = useState<{ [playerId: string]: { x: number; y: number } }>({});
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  
  const hasAnimation = layout?.keyframes && layout.keyframes.length > 1;

  useEffect(() => {
    if (!open) return;
    
    const stored = localStorage.getItem('tactics-layouts');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const found = parsed.find((l: any) => l.id === layoutId);
        if (found) {
          // Convert player format: TacticsBoardCanvas uses 'type', renderer uses 'team'
          const convertedPlayers = found.players.map((p: any) => ({
            id: p.id,
            x: p.x,
            y: p.y,
            team: p.type || p.team, // Support both formats
            number: p.number?.toString(),
          }));
          
          // Convert keyframes to use positions format
          const convertedKeyframes = (found.keyframes || []).map((kf: any) => {
            const positions: { [playerId: string]: { x: number; y: number } } = {};
            if (kf.players) {
              // Convert from players array to positions object
              kf.players.forEach((p: any) => {
                positions[p.id] = { x: p.x, y: p.y };
              });
            } else if (kf.positions) {
              // Already in correct format
              Object.assign(positions, kf.positions);
            }
            return {
              id: kf.id,
              timestamp: kf.timestamp / 100, // Convert from 0-100 to 0-1
              positions,
              curveControlPoints: kf.curveControlPoints,
            };
          });
          
          setLayout({
            id: found.id,
            name: found.name,
            players: convertedPlayers,
            drawings: [],
            keyframes: convertedKeyframes,
            zones: found.zones || [],
          });
          
          const initial: { [id: string]: { x: number; y: number } } = {};
          convertedPlayers.forEach((p: PlayerMarker) => {
            initial[p.id] = { x: p.x, y: p.y };
          });
          setDisplayPositions(initial);
          setCurrentTime(0);
          setIsPlaying(false);
        }
      } catch (e) {
        console.error('Failed to load layout:', e);
      }
    }
  }, [layoutId, open]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || !hasAnimation || !layout) return;

    const animate = (timestamp: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
      const delta = ((timestamp - lastTimeRef.current) / 3000) * playbackSpeed; // 3s base duration
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
  }, [isPlaying, hasAnimation, layout, playbackSpeed]);

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
      
      // Use bezier curve if control point exists
      const cp = prevKf.curveControlPoints?.[player.id];
      const cpX = cp ? cp.x : (prevPos.x + nextPos.x) / 2;
      const cpY = cp ? cp.y : (prevPos.y + nextPos.y) / 2;
      
      const mt = 1 - progress;
      interpolated[player.id] = {
        x: mt * mt * prevPos.x + 2 * mt * progress * cpX + progress * progress * nextPos.x,
        y: mt * mt * prevPos.y + 2 * mt * progress * cpY + progress * progress * nextPos.y,
      };
    });

    setDisplayPositions(interpolated);
  }, [currentTime, layout, hasAnimation]);

  const handleSeek = (value: number[]) => {
    setCurrentTime(value[0]);
  };

  const goToKeyframe = (direction: 'prev' | 'next') => {
    if (!layout || !hasAnimation) return;
    
    const keyframes = layout.keyframes.sort((a, b) => a.timestamp - b.timestamp);
    
    if (direction === 'prev') {
      for (let i = keyframes.length - 1; i >= 0; i--) {
        if (keyframes[i].timestamp < currentTime - 0.01) {
          setCurrentTime(keyframes[i].timestamp);
          return;
        }
      }
      setCurrentTime(0);
    } else {
      for (let i = 0; i < keyframes.length; i++) {
        if (keyframes[i].timestamp > currentTime + 0.01) {
          setCurrentTime(keyframes[i].timestamp);
          return;
        }
      }
      setCurrentTime(1);
    }
  };

  if (!layout) return null;

  const handleOpenInEditor = () => {
    onOpenChange(false);
    navigate(`/tactics?layout=${layoutId}&from=${encodeURIComponent(location.pathname)}`);
  };

  return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl w-[95vw] max-h-[95vh] p-0 overflow-hidden flex flex-col min-h-0" aria-describedby={undefined}>
        <VisuallyHidden>
          <DialogTitle>{layout.name}</DialogTitle>
        </VisuallyHidden>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <Film className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">{layout.name}</h2>
            {hasAnimation && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                {layout.keyframes.length} nyckelrutor
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleOpenInEditor}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Öppna i redigeraren
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Board */}
          <div className="p-4 bg-background">
            <div className="rounded-lg overflow-hidden border shadow-lg">
              <TacticsBoardRenderer
                players={layout.players}
                displayPositions={displayPositions}
                width={800}
                height={500}
                zones={layout.zones}
              />
            </div>
          </div>

          {/* Controls */}
          {hasAnimation && (
            <div className="px-4 py-4 border-t bg-muted/30 space-y-4">
              {/* Timeline */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground w-12">
                  {Math.round(currentTime * 100)}%
                </span>
                <Slider
                  value={[currentTime]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={handleSeek}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {playbackSpeed}x
                </span>
              </div>

              {/* Playback controls */}
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => goToKeyframe('prev')}
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button
                  variant="default"
                  size="lg"
                  className="w-14 h-14 rounded-full"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => goToKeyframe('next')}
                >
                  <SkipForward className="h-4 w-4" />
                </Button>

                <div className="ml-6 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Hastighet:</span>
                  {[0.5, 1, 1.5, 2].map(speed => (
                    <Button
                      key={speed}
                      variant={playbackSpeed === speed ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPlaybackSpeed(speed)}
                    >
                      {speed}x
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
