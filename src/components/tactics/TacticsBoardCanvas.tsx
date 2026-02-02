import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Users, UserMinus, Pencil, Eraser, Trash2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlayerMarker {
  id: string;
  x: number;
  y: number;
  type: 'home' | 'opponent';
  number?: number;
}

type Tool = 'select' | 'addHome' | 'addOpponent' | 'draw' | 'erase';

// Helper to get computed CSS color from CSS variable
const getCssColor = (varName: string): string => {
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return value ? `hsl(${value})` : '#000';
};

export function TacticsBoardCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [players, setPlayers] = useState<PlayerMarker[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool>('select');
  const [draggedPlayer, setDraggedPlayer] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [homePlayerCount, setHomePlayerCount] = useState(1);
  const [opponentPlayerCount, setOpponentPlayerCount] = useState(1);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 500 });

  // Draw the floorball rink
  const drawRink = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);
    
    // Get theme colors
    const mutedColor = getCssColor('--muted');
    const bgColor = getCssColor('--background');
    const borderColor = getCssColor('--border');
    const primaryColor = getCssColor('--primary');
    const destructiveColor = getCssColor('--destructive');
    
    // Rink background
    ctx.fillStyle = mutedColor;
    ctx.fillRect(0, 0, width, height);
    
    const padding = 20;
    const rinkWidth = width - padding * 2;
    const rinkHeight = height - padding * 2;
    const cornerRadius = 40;
    
    // Main rink outline with rounded corners
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
    
    // Center line
    const centerX = width / 2;
    ctx.beginPath();
    ctx.moveTo(centerX, padding);
    ctx.lineTo(centerX, height - padding);
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Center circle
    ctx.beginPath();
    ctx.arc(centerX, height / 2, 50, 0, Math.PI * 2);
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Center dot
    ctx.beginPath();
    ctx.arc(centerX, height / 2, 5, 0, Math.PI * 2);
    ctx.fillStyle = primaryColor;
    ctx.fill();
    
    // Goal areas - positioned OUTSIDE the rink with rectangular crease
    const goalWidth = 20;
    const goalHeight = 50;
    const creaseWidth = 50;
    const creaseHeight = 90;
    
    // Left goal crease (larger rectangle)
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(padding - creaseWidth, height / 2 - creaseHeight / 2, creaseWidth, creaseHeight);
    
    // Left goal (smaller rectangle inside crease)
    ctx.strokeRect(padding - creaseWidth + 10, height / 2 - goalHeight / 2, goalWidth, goalHeight);
    
    // Right goal crease (larger rectangle)
    ctx.strokeRect(width - padding, height / 2 - creaseHeight / 2, creaseWidth, creaseHeight);
    
    // Right goal (smaller rectangle inside crease)
    ctx.strokeRect(width - padding + creaseWidth - 30, height / 2 - goalHeight / 2, goalWidth, goalHeight);
    
  }, []);

  // Draw players on canvas
  const drawPlayers = useCallback((ctx: CanvasRenderingContext2D) => {
    const primaryColor = getCssColor('--primary');
    const destructiveColor = getCssColor('--destructive');
    const bgColor = getCssColor('--background');
    const fgColor = getCssColor('--primary-foreground');
    
    players.forEach((player) => {
      ctx.beginPath();
      ctx.arc(player.x, player.y, 18, 0, Math.PI * 2);
      
      if (player.type === 'home') {
        ctx.fillStyle = primaryColor;
      } else {
        ctx.fillStyle = destructiveColor;
      }
      ctx.fill();
      
      ctx.strokeStyle = bgColor;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Player number
      ctx.fillStyle = fgColor;
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(player.number?.toString() || '', player.x, player.y);
    });
  }, [players]);

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
    drawPlayers(ctx);
  }, [canvasSize, players, drawRink, drawPlayers]);

  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
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
      return Math.sqrt(dx * dx + dy * dy) < 20;
    });
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    const { x, y } = getCanvasCoords(e);
    
    if (selectedTool === 'addHome') {
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
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const { x, y } = getCanvasCoords(e);
    
    if (selectedTool === 'select') {
      const player = findPlayerAtPosition(x, y);
      if (player) {
        setDraggedPlayer(player.id);
      }
    } else if (selectedTool === 'draw' || selectedTool === 'erase') {
      setIsDrawing(true);
      const drawCtx = drawingCanvasRef.current?.getContext('2d');
      if (drawCtx) {
        drawCtx.beginPath();
        drawCtx.moveTo(x, y);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const { x, y } = getCanvasCoords(e);
    
    if (draggedPlayer && selectedTool === 'select') {
      setPlayers((prev) =>
        prev.map((p) => (p.id === draggedPlayer ? { ...p, x, y } : p))
      );
    } else if (isDrawing) {
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

  const handleMouseUp = () => {
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
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
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
          
          <Button variant="outline" size="sm" onClick={clearDrawing}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Drawing
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
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: selectedTool === 'select' ? 'grab' : 'crosshair' }}
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
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• <strong>Add Home/Opponent:</strong> Click on the rink to place players</li>
          <li>• <strong>Select/Move:</strong> Drag players to reposition them</li>
          <li>• <strong>Draw:</strong> Draw arrows, lines, or annotations</li>
          <li>• <strong>Erase:</strong> Remove parts of your drawing</li>
        </ul>
      </Card>
    </div>
  );
}
