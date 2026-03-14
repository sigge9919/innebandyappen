import { AppSidebar } from './AppSidebar';
import { usePendingRPE } from '@/hooks/usePendingRPE';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { pendingCount, isPlayer } = usePendingRPE();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <main className="flex-1 lg:ml-0 pt-12 lg:pt-0 overflow-auto relative">
        {isPlayer && pendingCount > 0 && (
          <button
            onClick={() => navigate('/player-portal')}
            className="fixed top-3 right-4 z-50 flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-3 py-1.5 shadow-lg hover:opacity-90 transition-opacity text-sm font-medium"
          >
            <Bell className="h-4 w-4" />
            <span>{pendingCount}</span>
          </button>
        )}
        {children}
      </main>
    </div>
  );
}
