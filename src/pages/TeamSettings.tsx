import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useTeam, TeamRole } from '@/contexts/TeamContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Trash2 } from 'lucide-react';

const ROLE_LABELS: Record<TeamRole, string> = {
  head_coach: 'Huvudtränare',
  assistant_coach: 'Assisterande tränare',
  stats_coach: 'Statistikansvarig',
  viewer: 'Åskådare',
  player: 'Spelare',
};

export default function TeamSettings() {
  const { activeTeam, activeRole, members, inviteCoach, removeMember } = useTeam();
  const { user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<TeamRole>('assistant_coach');
  const [loading, setLoading] = useState(false);
  const isHeadCoach = activeRole === 'head_coach';

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
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
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

        <div className="grid gap-6 max-w-2xl">
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
                      {m.user_id === user?.id ? 'You' : m.invite_email || 'Linked user'}
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
        </div>
      </div>
    </AppLayout>
  );
}
