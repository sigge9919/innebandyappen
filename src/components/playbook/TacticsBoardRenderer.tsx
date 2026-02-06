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
  height = 480,
  className 
}: TacticsBoardRendererProps) {
  const scaleX = width / 800;
  const scaleY = height / 480;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={cn("w-full bg-background", className)}>
      {/* Field background */}
      <rect x="0" y="0" width={width} height={height} fill="hsl(var(--muted))" />
      
      {/* Field outline */}
      <rect 
        x={10 * scaleX} y={10 * scaleY} 
        width={(width - 20 * scaleX)} height={(height - 20 * scaleY)} 
        fill="none" stroke="hsl(var(--border))" strokeWidth="2"
        rx={8 * scaleX}
      />
      
      {/* Center line */}
      <line 
        x1={width / 2} y1={10 * scaleY} 
        x2={width / 2} y2={height - 10 * scaleY} 
        stroke="hsl(var(--border))" strokeWidth="1"
      />
      
      {/* Center circle */}
      <circle cx={width / 2} cy={height / 2} r={60 * scaleX} fill="none" stroke="hsl(var(--border))" strokeWidth="1" />
      
      {/* Goal areas */}
      <rect 
        x={10 * scaleX} y={(height / 2) - 80 * scaleY} 
        width={100 * scaleX} height={160 * scaleY} 
        fill="hsl(var(--primary) / 0.1)" stroke="hsl(var(--primary))" strokeWidth="2"
        rx={4 * scaleX}
      />
      <rect 
        x={width - 110 * scaleX} y={(height / 2) - 80 * scaleY} 
        width={100 * scaleX} height={160 * scaleY} 
        fill="hsl(var(--primary) / 0.1)" stroke="hsl(var(--primary))" strokeWidth="2"
        rx={4 * scaleX}
      />

      {/* Players */}
      {players.map(player => {
        const pos = displayPositions[player.id] || { x: player.x, y: player.y };
        const scaledX = pos.x * scaleX;
        const scaledY = pos.y * scaleY;
        const radius = player.team === 'ball' ? 12 * scaleX : 24 * scaleX;
        
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
              className="drop-shadow-md"
            />
            {player.number && player.team !== 'ball' && (
              <text
                x={scaledX}
                y={scaledY}
                textAnchor="middle"
                dominantBaseline="central"
                fill="white"
                fontSize={14 * scaleX}
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
