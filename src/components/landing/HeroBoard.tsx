/**
 * Stylized SVG mock-up of a floorball rink with player dots.
 * Pure visual — no interaction.
 */
export function HeroBoard() {
  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="absolute inset-0 -z-10 blur-3xl opacity-40 bg-primary/30 rounded-full" />
      <svg
        viewBox="0 0 800 500"
        className="w-full h-auto rounded-lg border border-sidebar-border shadow-2xl"
        role="img"
        aria-label="Innebandyplan med taktikuppställning"
      >
        <defs>
          <linearGradient id="rinkBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(215 40% 12%)" />
            <stop offset="100%" stopColor="hsl(215 45% 8%)" />
          </linearGradient>
        </defs>
        {/* rink */}
        <rect x="0" y="0" width="800" height="500" fill="url(#rinkBg)" />
        <rect x="20" y="20" width="760" height="460" rx="60" ry="60" fill="none" stroke="hsl(190 100% 50% / 0.6)" strokeWidth="2" />
        {/* center line */}
        <line x1="400" y1="20" x2="400" y2="480" stroke="hsl(190 100% 50% / 0.35)" strokeWidth="2" strokeDasharray="6 6" />
        <circle cx="400" cy="250" r="48" fill="none" stroke="hsl(190 100% 50% / 0.4)" strokeWidth="2" />
        <circle cx="400" cy="250" r="3" fill="hsl(190 100% 50%)" />
        {/* goal areas */}
        <rect x="20" y="170" width="90" height="160" rx="8" fill="none" stroke="hsl(190 100% 50% / 0.35)" strokeWidth="2" />
        <rect x="690" y="170" width="90" height="160" rx="8" fill="none" stroke="hsl(190 100% 50% / 0.35)" strokeWidth="2" />
        {/* goals */}
        <rect x="10" y="220" width="14" height="60" fill="hsl(190 100% 50% / 0.7)" />
        <rect x="776" y="220" width="14" height="60" fill="hsl(12 80% 60% / 0.7)" />

        {/* arrows: play movement */}
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="hsl(190 100% 50%)" />
          </marker>
        </defs>
        <path d="M 220 360 Q 320 280 440 220" fill="none" stroke="hsl(190 100% 50%)" strokeWidth="2.5" strokeDasharray="6 4" markerEnd="url(#arrow)" />
        <path d="M 250 140 Q 360 200 500 180" fill="none" stroke="hsl(190 100% 50%)" strokeWidth="2.5" strokeDasharray="6 4" markerEnd="url(#arrow)" />

        {/* our players (cyan) */}
        {[
          [180, 360], [250, 140], [340, 250], [220, 220], [120, 250],
        ].map(([cx, cy], i) => (
          <g key={`us-${i}`}>
            <circle cx={cx} cy={cy} r="16" fill="hsl(190 100% 50%)" stroke="hsl(0 0% 100%)" strokeWidth="2" />
            <text x={cx} y={cy + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="hsl(215 40% 8%)">{i + 1}</text>
          </g>
        ))}
        {/* opponents (orange) */}
        {[
          [560, 180], [620, 320], [500, 280], [680, 250],
        ].map(([cx, cy], i) => (
          <g key={`op-${i}`}>
            <circle cx={cx} cy={cy} r="14" fill="hsl(12 80% 60%)" stroke="hsl(0 0% 100%)" strokeWidth="2" opacity="0.85" />
          </g>
        ))}
        {/* ball */}
        <circle cx="440" cy="220" r="6" fill="hsl(0 0% 100%)" stroke="hsl(190 100% 50%)" strokeWidth="2" />
      </svg>
    </div>
  );
}