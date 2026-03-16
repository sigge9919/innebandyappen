import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useTeam, TeamRole } from '@/contexts/TeamContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePlayers } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Trash2, Shield, CalendarDays, Plus } from 'lucide-react';
import {
  usePermissions,
  APP_SECTIONS,
  CONFIGURABLE_ROLES,
  AccessLevel,
  PermissionsMap,
  AppSection,
} from '@/hooks/usePermissions';

const ROLE_LABELS: Record<TeamRole, string> = {
  head_coach: 'Huvudtränare',
  assistant_coach: 'Assisterande tränare',
  stats_coach: 'Statistikansvarig',
  viewer: 'Åskådare',
  player: 'Spelare',
};

const ACCESS_LABELS: Record<AccessLevel, string> = {
  none: 'Ingen åtkomst',
  view: 'Visa',
  edit: 'Redigera',
};

export default function TeamSettings() {
  const { activeTeam, activeRole, members, inviteCoach, removeMember, seasons, startNewSeason } = useTeam();
  const { user } = useAuth();
  const { toast } = useToast();
  const { permissions, savePermissions } = usePermissions();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<TeamRole>('assistant_coach');
  const [loading, setLoading] = useState(false);
  const [newSeasonName, setNewSeasonName] = useState('');
  const [seasonLoading, setSeasonLoading] = useState(false);
  const [seasonConfirmOpen, setSeasonConfirmOpen] = useState(false);
  const isHeadCoach = activeRole === 'head_coach';
  const currentActiveSeason = seasons.find(s => s.isActive);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await inviteCoach(email.trim(), role);
    setLoading(false);
    if (error) {
      toast({ title: 'Fel', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Inbjudan skickad', description: `${email} inbjuden som ${ROLE_LABELS[role]}` });
      setEmail('');
    }
  };

  const handleRemove = async (memberId: string) => {
    const { error } = await removeMember(memberId);
    if (error) {
      toast({ title: 'Fel', description: error.message, variant: 'destructive' });
    }
  };

  const handlePermissionChange = async (roleKey: string, section: AppSection, level: AccessLevel) => {
    const updated: PermissionsMap = {
      ...permissions,
      [roleKey]: {
        ...permissions[roleKey],
        [section]: level,
      },
    };
    await savePermissions(updated);
    toast({ title: 'Behörigheter uppdaterade' });
  };

  return (
    <AppLayout>
      <div className="page-container">
        <div className="section-header">
          <div>
            <h1 className="section-title">Laginställningar</h1>
            <p className="text-muted-foreground mt-1">{activeTeam?.name}</p>
          </div>
        </div>

        <div className="grid gap-6 max-w-4xl">
          {/* Members */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lagmedlemmar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {members.map(m => (
                <div key={m.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium text-sm">
                      {m.user_id === user?.id ? 'Du' : m.invite_email || 'Länkad användare'}
                    </p>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {ROLE_LABELS[m.role]}
                    </Badge>
                  </div>
                  {isHeadCoach && m.user_id !== user?.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(m.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
              {members.length === 0 && (
                <p className="text-sm text-muted-foreground">Inga medlemmar ännu.</p>
              )}
            </CardContent>
          </Card>

          {/* Invite */}
          {isHeadCoach && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserPlus className="h-5 w-5" /> Bjud in tränare
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleInvite} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="inviteEmail">E-post</Label>
                    <Input
                      id="inviteEmail"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="coach@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Roll</Label>
                    <Select value={role} onValueChange={v => setRole(v as TeamRole)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="assistant_coach">Assisterande tränare</SelectItem>
                        <SelectItem value="stats_coach">Statistikansvarig</SelectItem>
                        <SelectItem value="viewer">Åskådare</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Bjuder in…' : 'Skicka inbjudan'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Permissions matrix */}
          {isHeadCoach && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5" /> Behörigheter per roll
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Sektion</th>
                        {CONFIGURABLE_ROLES.map(r => (
                          <th key={r.key} className="text-left py-2 px-2 font-medium text-muted-foreground min-w-[140px]">
                            {r.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {APP_SECTIONS.map(section => (
                        <tr key={section.key} className="border-b border-border last:border-0">
                          <td className="py-3 pr-4 font-medium">{section.label}</td>
                          {CONFIGURABLE_ROLES.map(r => (
                            <td key={r.key} className="py-3 px-2">
                              <Select
                                value={permissions[r.key]?.[section.key] ?? 'none'}
                                onValueChange={(v) => handlePermissionChange(r.key, section.key, v as AccessLevel)}
                              >
                                <SelectTrigger className="h-8 text-xs w-[130px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">{ACCESS_LABELS.none}</SelectItem>
                                  <SelectItem value="view">{ACCESS_LABELS.view}</SelectItem>
                                  <SelectItem value="edit">{ACCESS_LABELS.edit}</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Season Management */}
          {isHeadCoach && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" /> Säsongshantering
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {seasons.map(s => (
                    <div key={s.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{s.name}</p>
                        {s.isActive && <Badge variant="default" className="text-xs">Aktiv</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {s.startDate}{s.endDate ? ` — ${s.endDate}` : ''}
                      </p>
                    </div>
                  ))}
                  {seasons.length === 0 && (
                    <p className="text-sm text-muted-foreground">Inga säsonger ännu.</p>
                  )}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newSeasonName.trim()) return;
                    setSeasonConfirmOpen(true);
                  }}
                  className="flex items-end gap-3"
                >
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="seasonName">Ny säsong</Label>
                    <Input
                      id="seasonName"
                      value={newSeasonName}
                      onChange={e => setNewSeasonName(e.target.value)}
                      placeholder="t.ex. 2026/2027"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={seasonLoading} className="gap-1">
                    <Plus className="h-4 w-4" />
                    {seasonLoading ? 'Startar…' : 'Starta'}
                  </Button>
                </form>

                <AlertDialog open={seasonConfirmOpen} onOpenChange={setSeasonConfirmOpen}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Starta ny säsong?</AlertDialogTitle>
                      <AlertDialogDescription className="space-y-2">
                        <p>
                          Du är på väg att starta säsongen <strong>"{newSeasonName}"</strong>.
                        </p>
                        {currentActiveSeason && (
                          <p>
                            Den nuvarande säsongen <strong>"{currentActiveSeason.name}"</strong> kommer att stängas. All befintlig statistik, matcher och träningar förblir sparade och kan fortfarande visas via säsongsväljaren.
                          </p>
                        )}
                        <p>Ny data (matcher, träningar, RPE) kopplas automatiskt till den nya säsongen.</p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Avbryt</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={async () => {
                          setSeasonLoading(true);
                          const { error } = await startNewSeason(newSeasonName.trim());
                          setSeasonLoading(false);
                          if (error) {
                            toast({ title: 'Fel', description: error.message, variant: 'destructive' });
                          } else {
                            toast({ title: 'Ny säsong startad', description: `${newSeasonName} är nu aktiv.` });
                            setNewSeasonName('');
                          }
                        }}
                      >
                        Starta ny säsong
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
