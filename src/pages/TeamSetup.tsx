import { useState } from 'react';
import { useTeam, Team } from '@/contexts/TeamContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LogOut } from 'lucide-react';

export default function TeamSetup() {
  const { teams, createTeam, setActiveTeam } = useTeam();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'choose' | 'create'>(teams.length > 0 ? 'choose' : 'create');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    setLoading(true);
    const { error } = await createTeam(teamName.trim());
    setLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4">
            <span className="text-primary-foreground font-bold text-xl">C</span>
          </div>
          <CardTitle className="text-xl">
            {mode === 'create' ? 'Create Your Team' : 'Select a Team'}
          </CardTitle>
          <CardDescription>
            {mode === 'create'
              ? 'Give your team a name to get started'
              : 'Choose which team to manage'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mode === 'choose' && (
            <>
              <div className="space-y-2">
                {teams.map((team: Team) => (
                  <Button
                    key={team.id}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3"
                    onClick={() => setActiveTeam(team)}
                  >
                    <div>
                      <div className="font-medium">{team.name}</div>
                    </div>
                  </Button>
                ))}
              </div>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setMode('create')}
              >
                + Create new team
              </Button>
            </>
          )}

          {mode === 'create' && (
            <>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teamName">Team Name</Label>
                  <Input
                    id="teamName"
                    value={teamName}
                    onChange={e => setTeamName(e.target.value)}
                    placeholder="e.g. Thunderbolts FC"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating…' : 'Create Team'}
                </Button>
              </form>
              {teams.length > 0 && (
                <Button variant="ghost" className="w-full" onClick={() => setMode('choose')}>
                  ← Back to team list
                </Button>
              )}
            </>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
