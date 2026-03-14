import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { 
  Users, UserMinus, Pencil, Eraser, Trash2, RotateCcw, 
  Save, FolderOpen, X, Play, Pause, Circle, Square, 
  ChevronLeft, ChevronRight, Film, CircleDot
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface PlayerMarker {
  id: string;
  x: number;
  y: number;
  type: 'home' | 'opponent' | 'ball';
  number?: number;
}

interface ShadowZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AnimationKeyframe {
  id: string;
  timestamp: number; // 0-100 representing % of animation
  players: PlayerMarker[];
  drawingData?: string;
  curveControlPoints?: { [playerId: string]: { x: number; y: number } };
}

interface TacticsLayout {
  id: string;
  name: string;
  players: PlayerMarker[];
  drawingData: string;
  homePlayerCount: number;
  opponentPlayerCount: number;
  createdAt: string;
  // Animation data
  keyframes?: AnimationKeyframe[];
  isAnimation?: boolean;
  // Shadow zones
  zones?: ShadowZone[];
}

type Tool = 'select' | 'addHome' | 'addOpponent' | 'addBall' | 'draw' | 'erase' | 'addZone' | 'delete';
type Mode = 'edit' | 'animate';

const STORAGE_KEY = 'tactics-layouts';

// Helper to get computed CSS color from CSS variable
const getCssColor = (varName: string): string => {
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return value ? `hsl(${value})` : '#000';
};

// Storage helpers
const getSavedLayouts = (): TacticsLayout[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveLayoutToStorage = (layouts: TacticsLayout[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
};

// Linear interpolation helper
const lerp = (start: number, end: number, t: number) => start + (end - start) * t;

// Quadratic bezier interpolation
const quadBezier = (p0: number, p1: number, p2: number, t: number) => {
  const mt = 1 - t;
  return mt * mt * p0 + 2 * mt * t * p1 + t * t * p2;
};

interface TacticsBoardCanvasProps {
  initialLayoutId?: string;
}

export function TacticsBoardCanvas({ initialLayoutId }: TacticsBoardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  
  const [players, setPlayers] = useState<PlayerMarker[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool>('select');
  const [draggedPlayer, setDraggedPlayer] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [homePlayerCount, setHomePlayerCount] = useState(1);
  const [opponentPlayerCount, setOpponentPlayerCount] = useState(1);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 500 });
  const [touchStartPos, setTouchStartPos] = useState<{x: number, y: number} | null>(null);
  const lastTouchEndRef = useRef<number>(0);
  
  // Animation state
  const [mode, setMode] = useState<Mode>('edit');
  const [keyframes, setKeyframes] = useState<AnimationKeyframe[]>([]);
  const [currentKeyframeIndex, setCurrentKeyframeIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  
  // Shadow zone state
  const [zones, setZones] = useState<ShadowZone[]>([]);
  const [zoneStart, setZoneStart] = useState<{x: number, y: number} | null>(null);
  const [zonePreview, setZonePreview] = useState<{x: number, y: number, width: number, height: number} | null>(null);
  
  // Curve control point drag state
  const [draggedControlPoint, setDraggedControlPoint] = useState<string | null>(null);
  
  // Save/Load state
  const [savedLayouts, setSavedLayouts] = useState<TacticsLayout[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [layoutName, setLayoutName] = useState('');

  // Load saved layouts on mount
  useEffect(() => {
    const layouts = getSavedLayouts();
    setSavedLayouts(layouts);
    
    // Auto-load layout if initialLayoutId is provided
    if (initialLayoutId) {
      const found = layouts.find(l => l.id === initialLayoutId);
      if (found) {
        // Defer to after canvas is ready
        setTimeout(() => handleLoadLayout(found), 100);
      }
    }
  }, [initialLayoutId]);

  // Draw the floorball rink
  const drawRink = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);
    
    const mutedColor = getCssColor('--muted');
    const bgColor = getCssColor('--background');
    const borderColor = getCssColor('--border');
    const primaryColor = getCssColor('--primary');
    
    ctx.fillStyle = mutedColor;
    ctx.fillRect(0, 0, width, height);
    
    const padding = 20;
    const rinkWidth = width - padding * 2;
    const rinkHeight = height - padding * 2;
    const cornerRadius = 40;
    
    ctx.beginPath();
    ctx.moveTo(padding + cornerRadius, padding);
    ctx.lineTo(padding + rinkWidth - cornerRadius, padding);
    ctx.arcTo(padding + rinkWidth, padding, padding + rinkWidth, padding + cornerRadius, cornerRadius);
    ctx.lineTo(padding + rinkWidth, padding + rinkHeight - cornerRadius);
    ctx.arcTo(padding + rinkWidth, padding + rinkHeight, padding + rinkWidth - cornerRadius, padding + rinkHeight, cornerRadius);
    ctx.lineTo(padding + cornerRadius, padding + rinkHeight);
    ctx.arcTo(padding, padding + rinkHeight, padding, padding + rinkHeight - cornerRadius, cornerRadius);
    ctx.lineTo(padding, padding + cornerRadius);
    ctx.arcTo(padding, padding, padding + cornerRadius, padding, cornerRadius);
    ctx.closePath();
    
    ctx.fillStyle = bgColor;
    ctx.fill();
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    const centerX = width / 2;
    ctx.beginPath();
    ctx.moveTo(centerX, padding);
    ctx.lineTo(centerX, height - padding);
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(centerX, height / 2, 50, 0, Math.PI * 2);
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(centerX, height / 2, 5, 0, Math.PI * 2);
    ctx.fillStyle = primaryColor;
    ctx.fill();
    
    const goalHeight = 60;
    const creaseWidth = 70;
    const creaseHeight = 120;
    const goalInset = 40;
    const goalWidth = 25;
    
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(padding + goalInset, height / 2 - creaseHeight / 2, creaseWidth, creaseHeight);
    ctx.strokeRect(padding + goalInset + 15, height / 2 - goalHeight / 2, goalWidth, goalHeight);
    ctx.strokeRect(width - padding - goalInset - creaseWidth, height / 2 - creaseHeight / 2, creaseWidth, creaseHeight);
    ctx.strokeRect(width - padding - goalInset - creaseWidth + 30, height / 2 - goalHeight / 2, goalWidth, goalHeight);
    
    const markerSize = 10;
    const cornerInset = 35;
    
    const drawCornerMarker = (cx: number, cy: number) => {
      ctx.beginPath();
      ctx.moveTo(cx - markerSize, cy);
      ctx.lineTo(cx + markerSize, cy);
      ctx.moveTo(cx, cy - markerSize);
      ctx.lineTo(cx, cy + markerSize);
      ctx.stroke();
    };
    
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 2;
    drawCornerMarker(padding + cornerInset, padding + cornerInset);
    drawCornerMarker(width - padding - cornerInset, padding + cornerInset);
    drawCornerMarker(padding + cornerInset, height - padding - cornerInset);
    drawCornerMarker(width - padding - cornerInset, height - padding - cornerInset);
  }, []);

  // Draw players on canvas (with optional movement trails)
  const drawPlayers = useCallback((
    ctx: CanvasRenderingContext2D, 
    playersToRender: PlayerMarker[], 
    showTrails = false, 
    prevPlayers?: PlayerMarker[],
    curvePoints?: { [playerId: string]: { x: number; y: number } }
  ) => {
    const primaryColor = getCssColor('--primary');
    const destructiveColor = getCssColor('--destructive');
    const bgColor = getCssColor('--background');
    const fgColor = getCssColor('--primary-foreground');
    
    // Draw movement trails if in animation mode
    if (showTrails && prevPlayers && prevPlayers.length > 0) {
      playersToRender.forEach((player) => {
        const prevPlayer = prevPlayers.find(p => p.id === player.id);
        if (prevPlayer && (prevPlayer.x !== player.x || prevPlayer.y !== player.y)) {
          const cp = curvePoints?.[player.id];
          const cpX = cp ? cp.x : (prevPlayer.x + player.x) / 2;
          const cpY = cp ? cp.y : (prevPlayer.y + player.y) / 2;
          const isCurved = cp !== undefined;
          
          // Draw curved trail
          ctx.beginPath();
          ctx.moveTo(prevPlayer.x, prevPlayer.y);
          ctx.quadraticCurveTo(cpX, cpY, player.x, player.y);
          ctx.strokeStyle = player.type === 'home' ? primaryColor : 
                           player.type === 'ball' ? '#f97316' : destructiveColor;
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.stroke();
          ctx.setLineDash([]);
          
          // Arrow head using tangent at curve end (direction from control point to endpoint)
          const angle = Math.atan2(player.y - cpY, player.x - cpX);
          const arrowSize = 10;
          const arrowX = player.x - 20 * Math.cos(angle);
          const arrowY = player.y - 20 * Math.sin(angle);
          ctx.beginPath();
          ctx.moveTo(arrowX, arrowY);
          ctx.lineTo(
            arrowX - arrowSize * Math.cos(angle - Math.PI / 6),
            arrowY - arrowSize * Math.sin(angle - Math.PI / 6)
          );
          ctx.moveTo(arrowX, arrowY);
          ctx.lineTo(
            arrowX - arrowSize * Math.cos(angle + Math.PI / 6),
            arrowY - arrowSize * Math.sin(angle + Math.PI / 6)
          );
          ctx.stroke();
          
          // Draw control point handle (diamond shape)
          ctx.save();
          ctx.translate(cpX, cpY);
          ctx.rotate(Math.PI / 4);
          ctx.fillStyle = isCurved ? primaryColor : getCssColor('--muted-foreground');
          ctx.globalAlpha = isCurved ? 0.9 : 0.4;
          ctx.fillRect(-6, -6, 12, 12);
          ctx.strokeStyle = bgColor;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-6, -6, 12, 12);
          ctx.globalAlpha = 1;
          ctx.restore();
        }
      });
    }
    
    playersToRender.forEach((player) => {
      if (player.type === 'ball') {
        ctx.beginPath();
        ctx.arc(player.x, player.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#f97316';
        ctx.fill();
        ctx.strokeStyle = '#ea580c';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(player.x, player.y, 18, 0, Math.PI * 2);
        ctx.fillStyle = player.type === 'home' ? primaryColor : destructiveColor;
        ctx.fill();
        ctx.strokeStyle = bgColor;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.fillStyle = fgColor;
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(player.number?.toString() || '', player.x, player.y);
      }
    });
  }, []);

  // Initialize and resize canvas
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const width = Math.min(rect.width, 1000);
        const height = Math.min(width * 0.625, 600);
        setCanvasSize({ width, height });
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Redraw rink and players when they change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    drawRink(ctx, canvasSize.width, canvasSize.height);
    
    // Draw shadow zones
    zones.forEach(zone => {
      ctx.fillStyle = getCssColor('--primary');
      ctx.globalAlpha = 0.15;
      ctx.fillRect(zone.x, zone.y, zone.width, zone.height);
      ctx.strokeStyle = getCssColor('--primary');
      ctx.globalAlpha = 0.4;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    });
    
    // Draw zone preview while dragging
    if (zonePreview) {
      ctx.fillStyle = getCssColor('--primary');
      ctx.globalAlpha = 0.1;
      ctx.fillRect(zonePreview.x, zonePreview.y, zonePreview.width, zonePreview.height);
      ctx.strokeStyle = getCssColor('--primary');
      ctx.globalAlpha = 0.6;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(zonePreview.x, zonePreview.y, zonePreview.width, zonePreview.height);
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }
    
    // Show trails in animation mode when not playing
    if (mode === 'animate' && !isPlaying && keyframes.length > 1 && currentKeyframeIndex > 0) {
      const prevKeyframe = keyframes[currentKeyframeIndex - 1];
      drawPlayers(ctx, players, true, prevKeyframe.players, prevKeyframe.curveControlPoints);
    } else {
      drawPlayers(ctx, players);
    }
  }, [canvasSize, players, drawRink, drawPlayers, mode, isPlaying, keyframes, currentKeyframeIndex, zones, zonePreview]);

  // Animation playback loop
  useEffect(() => {
    if (!isPlaying || keyframes.length < 2) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    let lastTime = performance.now();
    const duration = 3000 / animationSpeed; // 3 seconds base duration
    
    const animate = (currentTime: number) => {
      const delta = currentTime - lastTime;
      lastTime = currentTime;
      
      setPlaybackPosition(prev => {
        const newPos = prev + (delta / duration) * 100;
        if (newPos >= 100) {
          setIsPlaying(false);
          return 100;
        }
        return newPos;
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, keyframes.length, animationSpeed]);

  // Interpolate player positions during playback
  useEffect(() => {
    if (!isPlaying || keyframes.length < 2) return;
    
    // Find the two keyframes we're between
    let prevKeyframe: AnimationKeyframe | null = null;
    let nextKeyframe: AnimationKeyframe | null = null;
    
    for (let i = 0; i < keyframes.length - 1; i++) {
      if (playbackPosition >= keyframes[i].timestamp && playbackPosition <= keyframes[i + 1].timestamp) {
        prevKeyframe = keyframes[i];
        nextKeyframe = keyframes[i + 1];
        break;
      }
    }
    
    if (!prevKeyframe || !nextKeyframe) {
      // At the end, show last keyframe
      if (keyframes.length > 0) {
        setPlayers(keyframes[keyframes.length - 1].players);
      }
      return;
    }
    
    // Calculate interpolation factor
    const range = nextKeyframe.timestamp - prevKeyframe.timestamp;
    const t = range > 0 ? (playbackPosition - prevKeyframe.timestamp) / range : 0;
    
    // Interpolate each player position using bezier curves
    const curvePoints = prevKeyframe.curveControlPoints;
    const interpolatedPlayers = prevKeyframe.players.map(prevPlayer => {
      const nextPlayer = nextKeyframe!.players.find(p => p.id === prevPlayer.id);
      if (!nextPlayer) return prevPlayer;
      
      const cp = curvePoints?.[prevPlayer.id];
      const cpX = cp ? cp.x : (prevPlayer.x + nextPlayer.x) / 2;
      const cpY = cp ? cp.y : (prevPlayer.y + nextPlayer.y) / 2;
      
      return {
        ...prevPlayer,
        x: quadBezier(prevPlayer.x, cpX, nextPlayer.x, t),
        y: quadBezier(prevPlayer.y, cpY, nextPlayer.y, t),
      };
    });
    
    setPlayers(interpolatedPlayers);
  }, [playbackPosition, isPlaying, keyframes]);

  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    if ('touches' in e) {
      const touch = e.touches[0] || (e as React.TouchEvent).changedTouches[0];
      if (!touch) return { x: 0, y: 0 };
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const findPlayerAtPosition = (x: number, y: number) => {
    return players.find((p) => {
      const dx = p.x - x;
      const dy = p.y - y;
      const hitRadius = p.type === 'ball' ? 12 : 20; // Smaller hit area for ball
      return Math.sqrt(dx * dx + dy * dy) < hitRadius;
    });
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Skip if this click was generated from a touch event
    if (Date.now() - lastTouchEndRef.current < 500) return;
    if (mode === 'animate' && isPlaying) return;
    
    const { x, y } = getCanvasCoords(e);
    
    if (mode === 'edit') {
      if (selectedTool === 'delete') {
        const player = findPlayerAtPosition(x, y);
        if (player) {
          setPlayers(prev => prev.filter(p => p.id !== player.id));
          toast.success('Spelare borttagen');
        }
      } else if (selectedTool === 'addHome') {
        setPlayers((prev) => [
          ...prev,
          { id: `home-${Date.now()}`, x, y, type: 'home', number: homePlayerCount },
        ]);
        setHomePlayerCount((c) => c + 1);
      } else if (selectedTool === 'addOpponent') {
        setPlayers((prev) => [
          ...prev,
          { id: `opponent-${Date.now()}`, x, y, type: 'opponent', number: opponentPlayerCount },
        ]);
        setOpponentPlayerCount((c) => c + 1);
      } else if (selectedTool === 'addBall') {
        const hasBall = players.some(p => p.type === 'ball');
        if (!hasBall) {
          setPlayers((prev) => [
            ...prev,
            { id: `ball-${Date.now()}`, x, y, type: 'ball' },
          ]);
        } else {
          toast.info('Bollen finns redan på planen - dra för att flytta');
        }
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e) e.preventDefault();
    if (mode === 'animate' && isPlaying) return;
    
    const { x, y } = getCanvasCoords(e);
    const isTouchEvent = 'touches' in e;
    if (isTouchEvent) setTouchStartPos({ x, y });
    
    // In animation mode, check for control point handle hits first
    if (mode === 'animate' && !isPlaying && keyframes.length > 1 && currentKeyframeIndex > 0) {
      const prevKf = keyframes[currentKeyframeIndex - 1];
      const cpMap = prevKf.curveControlPoints || {};
      
      for (const player of players) {
        const prevPlayer = prevKf.players.find(p => p.id === player.id);
        if (!prevPlayer || (prevPlayer.x === player.x && prevPlayer.y === player.y)) continue;
        
        const cp = cpMap[player.id];
        const cpX = cp ? cp.x : (prevPlayer.x + player.x) / 2;
        const cpY = cp ? cp.y : (prevPlayer.y + player.y) / 2;
        
        const dx = x - cpX;
        const dy = y - cpY;
        if (Math.sqrt(dx * dx + dy * dy) < 14) {
          setDraggedControlPoint(player.id);
          return;
        }
      }
    }
    
    if (selectedTool === 'select' || mode === 'animate') {
      const player = findPlayerAtPosition(x, y);
      if (player) {
        setDraggedPlayer(player.id);
      }
    } else if (selectedTool === 'addZone' && mode === 'edit') {
      setZoneStart({ x, y });
    } else if ((selectedTool === 'draw' || selectedTool === 'erase') && mode === 'edit') {
      setIsDrawing(true);
      const drawCtx = drawingCanvasRef.current?.getContext('2d');
      if (drawCtx) {
        drawCtx.beginPath();
        drawCtx.moveTo(x, y);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e) e.preventDefault();
    if (mode === 'animate' && isPlaying) return;
    
    const { x, y } = getCanvasCoords(e);
    
    if (draggedControlPoint) {
      // Dragging a curve control point handle
      const prevKfIndex = currentKeyframeIndex - 1;
      if (prevKfIndex >= 0) {
        setKeyframes(prev => prev.map((kf, i) => {
          if (i !== prevKfIndex) return kf;
          return {
            ...kf,
            curveControlPoints: {
              ...(kf.curveControlPoints || {}),
              [draggedControlPoint]: { x, y },
            },
          };
        }));
      }
    } else if (draggedPlayer) {
      setPlayers((prev) =>
        prev.map((p) => (p.id === draggedPlayer ? { ...p, x, y } : p))
      );
    } else if (zoneStart && selectedTool === 'addZone') {
      setZonePreview({
        x: Math.min(zoneStart.x, x),
        y: Math.min(zoneStart.y, y),
        width: Math.abs(x - zoneStart.x),
        height: Math.abs(y - zoneStart.y),
      });
    } else if (isDrawing && mode === 'edit') {
      const drawCtx = drawingCanvasRef.current?.getContext('2d');
      if (drawCtx) {
        if (selectedTool === 'draw') {
          drawCtx.strokeStyle = getCssColor('--accent');
          drawCtx.lineWidth = 3;
          drawCtx.lineCap = 'round';
          drawCtx.lineJoin = 'round';
        } else if (selectedTool === 'erase') {
          drawCtx.strokeStyle = 'rgba(0,0,0,1)';
          drawCtx.lineWidth = 20;
          drawCtx.globalCompositeOperation = 'destination-out';
        }
        drawCtx.lineTo(x, y);
        drawCtx.stroke();
        drawCtx.beginPath();
        drawCtx.moveTo(x, y);
        
        if (selectedTool === 'erase') {
          drawCtx.globalCompositeOperation = 'source-over';
        }
      }
    }
  };

  const handleMouseUp = (e?: React.MouseEvent | React.TouchEvent) => {
    // Handle touch tap (short distance = tap = place player)
    if (touchStartPos && e && 'changedTouches' in e) {
      const { x, y } = getCanvasCoords(e);
      const dx = x - touchStartPos.x;
      const dy = y - touchStartPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 10 && !draggedPlayer && !draggedControlPoint && mode === 'edit') {
        // This was a tap, not a drag
        if (selectedTool === 'delete') {
          const player = findPlayerAtPosition(x, y);
          if (player) {
            setPlayers(prev => prev.filter(p => p.id !== player.id));
            toast.success('Spelare borttagen');
          }
        } else if (selectedTool === 'addHome') {
          setPlayers(prev => [...prev, { id: `home-${Date.now()}`, x, y, type: 'home', number: homePlayerCount }]);
          setHomePlayerCount(c => c + 1);
        } else if (selectedTool === 'addOpponent') {
          setPlayers(prev => [...prev, { id: `opponent-${Date.now()}`, x, y, type: 'opponent', number: opponentPlayerCount }]);
          setOpponentPlayerCount(c => c + 1);
        } else if (selectedTool === 'addBall') {
          const hasBall = players.some(p => p.type === 'ball');
          if (!hasBall) {
            setPlayers(prev => [...prev, { id: `ball-${Date.now()}`, x, y, type: 'ball' }]);
          } else {
            toast.info('Bollen finns redan på planen - dra för att flytta');
          }
        }
      }
      setTouchStartPos(null);
      lastTouchEndRef.current = Date.now();
    }

    if (draggedControlPoint) {
      setDraggedControlPoint(null);
      return;
    }
    
    // Finalize zone creation
    if (zoneStart && zonePreview && zonePreview.width > 10 && zonePreview.height > 10) {
      setZones(prev => [...prev, {
        id: `zone-${Date.now()}`,
        ...zonePreview,
      }]);
    }
    setZoneStart(null);
    setZonePreview(null);
    setDraggedPlayer(null);
    setIsDrawing(false);
  };

  const clearDrawing = () => {
    const drawCtx = drawingCanvasRef.current?.getContext('2d');
    if (drawCtx) {
      drawCtx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    }
  };

  const clearPlayers = () => {
    setPlayers([]);
    setHomePlayerCount(1);
    setOpponentPlayerCount(1);
  };

  const resetAll = () => {
    clearDrawing();
    clearPlayers();
    setZones([]);
    setKeyframes([]);
    setCurrentKeyframeIndex(0);
    setPlaybackPosition(0);
    setIsPlaying(false);
  };

  // Animation functions
  const addKeyframe = () => {
    const drawingCanvas = drawingCanvasRef.current;
    const drawingData = drawingCanvas ? drawingCanvas.toDataURL() : '';
    
    const newKeyframe: AnimationKeyframe = {
      id: `keyframe-${Date.now()}`,
      timestamp: 0, // Will be recalculated
      players: [...players],
      drawingData,
      curveControlPoints: {},
    };
    
    const newKeyframes = [...keyframes, newKeyframe];
    
    // Redistribute timestamps evenly across all keyframes
    const redistributedKeyframes = newKeyframes.map((kf, index) => ({
      ...kf,
      timestamp: newKeyframes.length === 1 ? 0 : (index / (newKeyframes.length - 1)) * 100,
    }));
    
    setKeyframes(redistributedKeyframes);
    setCurrentKeyframeIndex(redistributedKeyframes.length - 1);
    toast.success(`Nyckelruta ${redistributedKeyframes.length} tillagd`);
  };

  const updateCurrentKeyframe = () => {
    if (keyframes.length === 0) return;
    
    const drawingCanvas = drawingCanvasRef.current;
    const drawingData = drawingCanvas ? drawingCanvas.toDataURL() : '';
    
    const updatedKeyframes = keyframes.map((kf, index) => 
      index === currentKeyframeIndex 
        ? { ...kf, players: [...players], drawingData }
        : kf
    );
    setKeyframes(updatedKeyframes);
    toast.success('Nyckelruta uppdaterad');
  };

  const deleteCurrentKeyframe = () => {
    if (keyframes.length === 0) return;
    
    const newKeyframes = keyframes.filter((_, i) => i !== currentKeyframeIndex);
    setKeyframes(newKeyframes);
    setCurrentKeyframeIndex(Math.max(0, currentKeyframeIndex - 1));
    
    if (newKeyframes.length > 0) {
      setPlayers(newKeyframes[Math.max(0, currentKeyframeIndex - 1)].players);
    }
    toast.success('Nyckelruta borttagen');
  };

  const goToKeyframe = (index: number) => {
    if (index < 0 || index >= keyframes.length) return;
    
    setCurrentKeyframeIndex(index);
    setPlayers(keyframes[index].players);
    setPlaybackPosition(keyframes[index].timestamp);
    
    // Restore drawing
    if (keyframes[index].drawingData) {
      const drawCtx = drawingCanvasRef.current?.getContext('2d');
      if (drawCtx) {
        const img = new Image();
        img.onload = () => {
          drawCtx.clearRect(0, 0, canvasSize.width, canvasSize.height);
          drawCtx.drawImage(img, 0, 0);
        };
        img.src = keyframes[index].drawingData;
      }
    }
  };

  const playAnimation = () => {
    if (keyframes.length < 2) {
      toast.error('Lägg till minst 2 nyckelrutor för att spela animation');
      return;
    }
    setPlaybackPosition(0);
    setPlayers(keyframes[0].players);
    setIsPlaying(true);
  };

  const stopAnimation = () => {
    setIsPlaying(false);
    // Return to current keyframe
    if (keyframes.length > 0) {
      goToKeyframe(currentKeyframeIndex);
    }
  };

  // Toggle between edit and animate modes
  const toggleMode = () => {
    if (mode === 'edit') {
      // Entering animation mode - create first keyframe if none exist
      if (keyframes.length === 0 && players.length > 0) {
        addKeyframe();
      }
      setMode('animate');
    } else {
      setIsPlaying(false);
      setMode('edit');
    }
  };

  // Save current layout
  const handleSaveLayout = () => {
    if (!layoutName.trim()) {
      toast.error('Ange ett namn för uppställningen');
      return;
    }

    const drawingCanvas = drawingCanvasRef.current;
    const drawingData = drawingCanvas ? drawingCanvas.toDataURL() : '';

    const newLayout: TacticsLayout = {
      id: `layout-${Date.now()}`,
      name: layoutName.trim(),
      players,
      drawingData,
      homePlayerCount,
      opponentPlayerCount,
      createdAt: new Date().toISOString(),
      keyframes: keyframes.length > 0 ? keyframes : undefined,
      isAnimation: keyframes.length > 1,
      zones: zones.length > 0 ? zones : undefined,
    };

    const updatedLayouts = [...savedLayouts, newLayout];
    saveLayoutToStorage(updatedLayouts);
    setSavedLayouts(updatedLayouts);
    setLayoutName('');
    setSaveDialogOpen(false);
    toast.success(`${keyframes.length > 1 ? 'Animation' : 'Uppställning'} "${newLayout.name}" sparad`);
  };

  // Load a saved layout
  const handleLoadLayout = (layout: TacticsLayout) => {
    setPlayers(layout.players);
    setHomePlayerCount(layout.homePlayerCount);
    setOpponentPlayerCount(layout.opponentPlayerCount);
    setZones(layout.zones || []);

    // Restore drawing
    if (layout.drawingData) {
      const drawCtx = drawingCanvasRef.current?.getContext('2d');
      if (drawCtx) {
        const img = new Image();
        img.onload = () => {
          drawCtx.clearRect(0, 0, canvasSize.width, canvasSize.height);
          drawCtx.drawImage(img, 0, 0);
        };
        img.src = layout.drawingData;
      }
    }

    // Restore animation keyframes
    if (layout.keyframes && layout.keyframes.length > 0) {
      setKeyframes(layout.keyframes);
      setCurrentKeyframeIndex(0);
      setMode('animate');
    } else {
      setKeyframes([]);
      setCurrentKeyframeIndex(0);
      setMode('edit');
    }

    setLoadDialogOpen(false);
    toast.success(`${layout.isAnimation ? 'Animation' : 'Uppställning'} "${layout.name}" laddad`);
  };

  // Delete a saved layout
  const handleDeleteLayout = (layoutId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedLayouts = savedLayouts.filter((l) => l.id !== layoutId);
    saveLayoutToStorage(updatedLayouts);
    setSavedLayouts(updatedLayouts);
    toast.success('Uppställning borttagen');
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <Card className="p-3">
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <Button
              variant={mode === 'edit' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('edit')}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Redigeringsläge
            </Button>
            <Button
              variant={mode === 'animate' ? 'default' : 'outline'}
              size="sm"
              onClick={toggleMode}
            >
              <Film className="h-4 w-4 mr-2" />
              Animeringsläge
              {keyframes.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {keyframes.length}
                </Badge>
              )}
            </Button>
          </div>
          
          <div className="flex-1" />
          
          {/* Save/Load */}
          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Save className="h-4 w-4 mr-2" />
                Spara
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Spara {keyframes.length > 1 ? 'animation' : 'uppställning'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Namn (t.ex. Powerplay uppställning 1)"
                  value={layoutName}
                  onChange={(e) => setLayoutName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveLayout()}
                />
                {keyframes.length > 1 && (
                  <p className="text-sm text-muted-foreground">
                    This will save the animation with {keyframes.length} keyframes.
                  </p>
                )}
                <Button onClick={handleSaveLayout} className="w-full">
                  Save {keyframes.length > 1 ? 'Animation' : 'Layout'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FolderOpen className="h-4 w-4 mr-2" />
                Load
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Load Layout / Animation</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 pt-4 max-h-80 overflow-y-auto">
                {savedLayouts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No saved layouts yet
                  </p>
                ) : (
                  savedLayouts.map((layout) => (
                    <div
                      key={layout.id}
                      onClick={() => handleLoadLayout(layout)}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        {layout.isAnimation && (
                          <Film className="h-4 w-4 text-primary" />
                        )}
                        <div>
                          <p className="font-medium">{layout.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {layout.players.length} players
                            {layout.isAnimation && ` • ${layout.keyframes?.length} keyframes`}
                            {' • '}
                            {new Date(layout.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDeleteLayout(layout.id, e)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      {/* Edit Mode Toolbar */}
      {mode === 'edit' && (
        <Card className="p-3">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedTool === 'select' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTool('select')}
            >
              <Users className="h-4 w-4 mr-2" />
              Select/Move
            </Button>
            <Button
              variant={selectedTool === 'addHome' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTool('addHome')}
              className={cn(selectedTool !== 'addHome' && 'border-primary text-primary hover:bg-primary/10')}
            >
              <Users className="h-4 w-4 mr-2" />
              Add Home
            </Button>
            <Button
              variant={selectedTool === 'addOpponent' ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => setSelectedTool('addOpponent')}
              className={cn(selectedTool !== 'addOpponent' && 'border-destructive text-destructive hover:bg-destructive/10')}
            >
              <UserMinus className="h-4 w-4 mr-2" />
              Add Opponent
            </Button>
            <Button
              variant={selectedTool === 'addBall' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTool('addBall')}
              className={cn(selectedTool !== 'addBall' && 'border-orange-500 text-orange-500 hover:bg-orange-500/10')}
            >
              <CircleDot className="h-4 w-4 mr-2" />
              Add Ball
            </Button>
            <Button
              variant={selectedTool === 'delete' ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => setSelectedTool('delete')}
            >
              <X className="h-4 w-4 mr-2" />
              Delete
            </Button>
            
            <div className="w-px h-8 bg-border mx-1" />
            
            <Button
              variant={selectedTool === 'draw' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTool('draw')}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Draw
            </Button>
            <Button
              variant={selectedTool === 'erase' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTool('erase')}
            >
              <Eraser className="h-4 w-4 mr-2" />
              Erase
            </Button>
            
            <div className="w-px h-8 bg-border mx-1" />
            
            <Button
              variant={selectedTool === 'addZone' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTool('addZone')}
            >
              <Square className="h-4 w-4 mr-2" />
              Shadow Zone
            </Button>
            
            <div className="w-px h-8 bg-border mx-1" />
            
            <Button variant="outline" size="sm" onClick={clearDrawing}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Drawing
            </Button>
            <Button variant="outline" size="sm" onClick={() => setZones([])}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Zones
            </Button>
            <Button variant="outline" size="sm" onClick={clearPlayers}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Players
            </Button>
            <Button variant="outline" size="sm" onClick={resetAll}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset All
            </Button>
          </div>
        </Card>
      )}

      {/* Animation Mode Toolbar */}
      {mode === 'animate' && (
        <Card className="p-3 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Playback controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToKeyframe(currentKeyframeIndex - 1)}
                disabled={currentKeyframeIndex === 0 || isPlaying}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {isPlaying ? (
                <Button variant="default" size="sm" onClick={stopAnimation}>
                  <Pause className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              ) : (
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={playAnimation}
                  disabled={keyframes.length < 2}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Play
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToKeyframe(currentKeyframeIndex + 1)}
                disabled={currentKeyframeIndex >= keyframes.length - 1 || isPlaying}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="w-px h-8 bg-border mx-1" />
            
            {/* Keyframe controls */}
            <Button
              variant="outline"
              size="sm"
              onClick={addKeyframe}
              disabled={isPlaying}
            >
              <Circle className="h-4 w-4 mr-2" />
              Add Keyframe
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={updateCurrentKeyframe}
              disabled={keyframes.length === 0 || isPlaying}
            >
              <Save className="h-4 w-4 mr-2" />
              Update Keyframe
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={deleteCurrentKeyframe}
              disabled={keyframes.length === 0 || isPlaying}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Keyframe
            </Button>
            
            <div className="flex-1" />
            
            {/* Speed control */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Speed:</span>
              <Slider
                value={[animationSpeed]}
                onValueChange={([val]) => setAnimationSpeed(val)}
                min={0.25}
                max={2}
                step={0.25}
                className="w-24"
              />
              <span className="text-sm font-medium w-8">{animationSpeed}x</span>
            </div>
          </div>
          
          {/* Keyframe timeline */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Keyframe {keyframes.length > 0 ? currentKeyframeIndex + 1 : 0} of {keyframes.length}
              </span>
              <span className="text-muted-foreground">
                {isPlaying ? `Playing: ${Math.round(playbackPosition)}%` : 'Stopped'}
              </span>
            </div>
            
            {/* Visual timeline */}
            <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
              {/* Progress bar during playback */}
              {isPlaying && (
                <div 
                  className="absolute top-0 left-0 h-full bg-primary/20"
                  style={{ width: `${playbackPosition}%` }}
                />
              )}
              
              {/* Keyframe markers */}
              {keyframes.map((kf, index) => (
                <button
                  key={kf.id}
                  className={cn(
                    'absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 transition-all',
                    index === currentKeyframeIndex
                      ? 'bg-primary border-primary scale-125'
                      : 'bg-background border-muted-foreground hover:border-primary'
                  )}
                  style={{ left: `calc(${kf.timestamp}% - 8px)` }}
                  onClick={() => !isPlaying && goToKeyframe(index)}
                  disabled={isPlaying}
                />
              ))}
              
              {/* Playback position indicator */}
              {isPlaying && (
                <div
                  className="absolute top-0 h-full w-0.5 bg-primary"
                  style={{ left: `${playbackPosition}%` }}
                />
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Canvas */}
      <Card className="overflow-hidden">
        <div
          ref={containerRef}
          className="relative w-full"
          style={{ aspectRatio: '16/10' }}
        >
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="absolute inset-0 w-full h-full"
            onClick={handleCanvasClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={(e) => handleMouseUp(e)}
            onMouseLeave={() => handleMouseUp()}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={(e) => handleMouseUp(e)}
            onTouchCancel={() => handleMouseUp()}
            style={{ 
              touchAction: 'none',
              cursor: isPlaying 
                ? 'default' 
                : selectedTool === 'addZone'
                  ? 'crosshair'
                  : (selectedTool === 'select' || mode === 'animate') 
                    ? 'grab' 
                    : 'crosshair' 
            }}
          />
          <canvas
            ref={drawingCanvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="absolute inset-0 w-full h-full pointer-events-none"
          />
        </div>
      </Card>

      {/* Instructions */}
      <Card className="p-4 bg-muted/50">
        <h3 className="font-semibold mb-2">How to use</h3>
        {mode === 'edit' ? (
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Add Home/Opponent:</strong> Click on the rink to place players</li>
            <li>• <strong>Select/Move:</strong> Drag players to reposition them</li>
            <li>• <strong>Draw:</strong> Draw arrows, lines, or annotations</li>
            <li>• <strong>Shadow Zone:</strong> Click and drag to mark a highlighted area on the field</li>
            <li>• <strong>Animation Mode:</strong> Switch to create movement animations</li>
          </ul>
        ) : (
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Add Keyframe:</strong> Record current player positions as a keyframe</li>
            <li>• <strong>Move Players:</strong> Drag players to new positions between keyframes</li>
            <li>• <strong>Curved Paths:</strong> Drag the diamond handles on movement trails to curve paths</li>
            <li>• <strong>Play:</strong> Watch players animate along curved or straight paths</li>
            <li>• <strong>Save:</strong> Save your animation for later use</li>
            <li>• <strong>Tip:</strong> Add at least 2 keyframes to create an animation</li>
          </ul>
        )}
      </Card>
    </div>
  );
}
