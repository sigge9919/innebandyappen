import { cn } from '@/lib/utils';

interface PlayerMarker {
  id: string;
  x: number;
  y: number;
  team: 'home' | 'away' | 'ball';
  number?: string;
}

interface TacticsBoardRendererProps {
  players: PlayerMarker[];
  displayPositions: { [playerId: string]: { x: number; y: number } };
  width?: number;
  height?: number;
  className?: string;
}

export function TacticsBoardRenderer({ 
  players, 
  displayPositions, 
  width = 800, 
  height = 500,
  className 
}: TacticsBoardRendererProps) {
  const padding = 20;
  const cornerRadius = 40;
  const rinkWidth = width - padding * 2;
  const rinkHeight = height - padding * 2;

  // Goal area dimensions
  const creaseWidth = 70;
  const creaseHeight = 120;
  const goalInset = 40;
  const goalWidth = 25;
  const goalHeight = 60;

  // Corner marker dimensions
  const markerSize = 10;
  const cornerInset = 35;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={cn("w-full", className)}>
      {/* Field background - muted */}
      <rect x="0" y="0" width={width} height={height} fill="hsl(var(--muted))" />
      
      {/* Rink playing surface - background color */}
      <rect 
        x={padding} 
        y={padding} 
        width={rinkWidth} 
        height={rinkHeight} 
        fill="hsl(var(--background))" 
        stroke="hsl(var(--border))" 
        strokeWidth="3"
        rx={cornerRadius}
      />
      
      {/* Center line */}
      <line 
        x1={width / 2} y1={padding} 
        x2={width / 2} y2={height - padding} 
        stroke="hsl(var(--primary))" strokeWidth="2"
      />
      
      {/* Center circle */}
      <circle 
        cx={width / 2} 
        cy={height / 2} 
        r={50} 
        fill="none" 
        stroke="hsl(var(--primary))" 
        strokeWidth="2" 
      />
      
      {/* Center dot */}
      <circle 
        cx={width / 2} 
        cy={height / 2} 
        r={5} 
        fill="hsl(var(--primary))" 
      />
      
      {/* Left goal crease */}
      <rect 
        x={padding + goalInset} 
        y={height / 2 - creaseHeight / 2} 
        width={creaseWidth} 
        height={creaseHeight} 
        fill="none"
        stroke="hsl(var(--primary))" 
        strokeWidth="2"
      />
      
      {/* Left goal */}
      <rect 
        x={padding + goalInset + 15} 
        y={height / 2 - goalHeight / 2} 
        width={goalWidth} 
        height={goalHeight} 
        fill="none"
        stroke="hsl(var(--primary))" 
        strokeWidth="2"
      />
      
      {/* Right goal crease */}
      <rect 
        x={width - padding - goalInset - creaseWidth} 
        y={height / 2 - creaseHeight / 2} 
        width={creaseWidth} 
        height={creaseHeight} 
        fill="none"
        stroke="hsl(var(--primary))" 
        strokeWidth="2"
      />
      
      {/* Right goal */}
      <rect 
        x={width - padding - goalInset - creaseWidth + 30} 
        y={height / 2 - goalHeight / 2} 
        width={goalWidth} 
        height={goalHeight} 
        fill="none"
        stroke="hsl(var(--primary))" 
        strokeWidth="2"
      />
      
      {/* Corner markers */}
      {[
        { x: padding + cornerInset, y: padding + cornerInset },
        { x: width - padding - cornerInset, y: padding + cornerInset },
        { x: padding + cornerInset, y: height - padding - cornerInset },
        { x: width - padding - cornerInset, y: height - padding - cornerInset },
      ].map((pos, i) => (
        <g key={i}>
          <line 
            x1={pos.x - markerSize} y1={pos.y} 
            x2={pos.x + markerSize} y2={pos.y} 
            stroke="hsl(var(--primary))" strokeWidth="2"
          />
          <line 
            x1={pos.x} y1={pos.y - markerSize} 
            x2={pos.x} y2={pos.y + markerSize} 
            stroke="hsl(var(--primary))" strokeWidth="2"
          />
        </g>
      ))}

      {/* Players */}
      {players.map(player => {
        const pos = displayPositions[player.id] || { x: player.x, y: player.y };
        const radius = player.team === 'ball' ? 10 : 18;
        
        return (
          <g key={player.id}>
            <circle
              cx={pos.x}
              cy={pos.y}
              r={radius}
              fill={
                player.team === 'home' ? 'hsl(var(--primary))' :
                player.team === 'away' ? 'hsl(var(--destructive))' :
                '#f97316'
              }
              stroke={player.team === 'ball' ? '#ea580c' : 'hsl(var(--background))'}
              strokeWidth="2"
              className="drop-shadow-md"
            />
            {player.number && player.team !== 'ball' && (
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="hsl(var(--primary-foreground))"
                fontSize={12}
                fontWeight="bold"
              >
                {player.number}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}