import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Landing() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-10"
      style={{ backgroundColor: '#0b1829', color: '#f0f6ff' }}
    >
      <main className="flex flex-col items-center text-center gap-8 flex-1 justify-center">
        {/* Logo: crossed floorball sticks with ball */}
        <svg
          viewBox="0 0 280 280"
          className="w-56 h-56 sm:w-72 sm:h-72"
          role="img"
          aria-label="Floorball Tactix logotyp"
        >
          <defs>
            <filter id="ftGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Stick 1 (top-left to bottom-right) */}
          <g transform="rotate(45 140 140)" filter="url(#ftGlow)">
            <rect x="40" y="130" width="200" height="20" rx="6" fill="#1a3a6b" />
            <path
              d="M40 130 Q22 130 22 150 L22 168 Q22 178 32 178 L60 178 L60 150 Q60 130 40 130 Z"
              fill="#1a3a6b"
            />
            <rect x="40" y="130" width="200" height="3" fill="#00d9f5" opacity="0.85" />
          </g>

          {/* Stick 2 (top-right to bottom-left) */}
          <g transform="rotate(-45 140 140)" filter="url(#ftGlow)">
            <rect x="40" y="130" width="200" height="20" rx="6" fill="#1a3a6b" />
            <path
              d="M40 130 Q22 130 22 150 L22 168 Q22 178 32 178 L60 178 L60 150 Q60 130 40 130 Z"
              fill="#1a3a6b"
            />
            <rect x="40" y="147" width="200" height="3" fill="#00d9f5" opacity="0.85" />
          </g>

          {/* Ball */}
          <circle cx="140" cy="140" r="26" fill="#0b1829" stroke="#00d9f5" strokeWidth="3" filter="url(#ftGlow)" />
          <circle cx="140" cy="140" r="18" fill="#1a3a6b" />
          <circle cx="134" cy="134" r="2.5" fill="#00d9f5" opacity="0.9" />
          <circle cx="146" cy="138" r="2.5" fill="#00d9f5" opacity="0.7" />
          <circle cx="138" cy="146" r="2.5" fill="#00d9f5" opacity="0.7" />
        </svg>

        <div className="space-y-3">
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold"
            style={{ letterSpacing: '0.25em', color: '#f0f6ff' }}
          >
            FLOORBALL TACTIX
          </h1>
          <p className="text-sm sm:text-base" style={{ color: '#9ab0c8' }}>
            Digital taktikplattform för innebandy
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
          <Link to="/login" className="flex-1">
            <Button
              size="lg"
              className="w-full font-semibold"
              style={{
                backgroundColor: '#00d9f5',
                color: '#0b1829',
                boxShadow: '0 0 24px rgba(0, 217, 245, 0.45)',
              }}
            >
              Kom igång
            </Button>
          </Link>
          <Link to="/login" className="flex-1">
            <Button
              size="lg"
              variant="outline"
              className="w-full font-semibold bg-transparent hover:bg-white/5"
              style={{ borderColor: '#1a3a6b', color: '#f0f6ff' }}
            >
              Logga in
            </Button>
          </Link>
        </div>
      </main>

      <footer className="pt-10 text-xs" style={{ color: '#5d7896' }}>
        © {new Date().getFullYear()} Floorball Tactix
      </footer>
    </div>
  );
}