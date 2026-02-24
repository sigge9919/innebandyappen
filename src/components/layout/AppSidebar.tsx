import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Trophy,
  BarChart3,
  Calendar,
  BookOpen,
  TrendingUp,
  PenTool,
  Menu,
  Settings,
  LogOut,
  ChevronDown,
  Check,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { useTeam, Team } from '@/contexts/TeamContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/team', icon: Users, label: 'Team' },
  { to: '/games', icon: Trophy, label: 'Games' },
  { to: '/stats', icon: BarChart3, label: 'Stats' },
  { to: '/training', icon: Calendar, label: 'Training' },
  { to: '/playbook', icon: BookOpen, label: 'Playbook' },
  { to: '/development', icon: TrendingUp, label: 'Development' },
  { to: '/tactics', icon: PenTool, label: 'Tactics Board' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

function NavItem({ to, icon: Icon, label, onClick }: { to: string; icon: React.ElementType; label: string; onClick?: () => void }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={cn(
        'nav-item',
        isActive && 'nav-item-active'
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="text-sm">{label}</span>
    </NavLink>
  );
}

function TeamSwitcher() {
  const { teams, activeTeam, setActiveTeam } = useTeam();
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-sidebar-accent transition-colors text-left">
          <span className="text-sm font-semibold text-sidebar-foreground truncate flex-1">
            {activeTeam?.name ?? 'No team'}
          </span>
          <ChevronDown className="h-3 w-3 text-sidebar-foreground/50 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        align="start"
        className="w-56 bg-popover border border-border z-[200]"
      >
        {teams.map((team: Team) => (
          <DropdownMenuItem
            key={team.id}
            onClick={() => setActiveTeam(team)}
            className="flex items-center gap-2 cursor-pointer text-sm"
          >
            <span className="flex-1 truncate">{team.name}</span>
            {activeTeam?.id === team.id && (
              <Check className="h-3 w-3 text-primary shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => navigate('/team-setup')}
          className="flex items-center gap-2 cursor-pointer text-muted-foreground text-sm"
        >
          <Plus className="h-3 w-3" />
          <span>Create new team</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { activeTeam } = useTeam();
  const { signOut } = useAuth();

  const SidebarContent = ({ onItemClick }: { onItemClick?: () => void }) => (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Team name */}
      <div className="px-4 py-3 border-b border-sidebar-border">
        <p className="text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider mb-1">Coach OS</p>
        <TeamSwitcher />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2">
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} onClick={onItemClick} />
        ))}
      </nav>

      {/* Sign out */}
      <div className="border-t border-sidebar-border py-2">
        <button
          onClick={signOut}
          className="nav-item w-full text-sidebar-foreground/50 hover:text-sidebar-foreground"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-56 flex-col border-r border-sidebar-border bg-sidebar shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Header & Sidebar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar border-b border-sidebar-border">
        <div className="flex items-center justify-between px-4 h-12">
          <span className="text-sm font-semibold text-sidebar-foreground">
            {activeTeam?.name ?? 'Coach OS'}
          </span>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-sidebar-foreground h-8 w-8">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-56 bg-sidebar border-sidebar-border">
              <SidebarContent onItemClick={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
}
