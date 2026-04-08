import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeam, Team } from '@/contexts/TeamContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LogOut } from 'lucide-react';
import { DrillCatalogPicker } from '@/components/team/DrillCatalogPicker';

export default function TeamSetup() {
  const { teams, createTeam, setActiveTeam } = useTeam();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'choose' | 'create' | 'pick-drills'>(teams.length > 0 ? 'choose' : 'create');
  const [newTeamId, setNewTeamId] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    setLoading(true);
    const result = await createTeam(teamName.trim());
    setLoading(false);
    if (result.error) {
      toast({ title: 'Fel', description: result.error.message, variant: 'destructive' });
    } else if (result.teamId) {
      setNewTeamId(result.teamId);
      setMode('pick-drills');
    }
  };

  const handleDrillsComplete = () => {
    const team = teams.find(t => t.id === newTeamId);
    if (team) {
      setActiveTeam(team);
      navigate('/');
    }
    setMode('choose');
    setNewTeamId(null);
  };

  const handleSelectTeam = (team: Team) => {
    setActiveTeam(team);
    navigate('/');
  };

  if (mode === 'pick-drills' && newTeamId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <DrillCatalogPicker teamId={newTeamId} onComplete={handleDrillsComplete} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4">
            <span className="text-primary-foreground font-bold text-xl">C</span>
          </div>
          <CardTitle className="text-xl">
            {mode === 'create' ? 'Skapa ditt lag' : 'Välj ett lag'}
          </CardTitle>
          <CardDescription>
            {mode === 'create'
              ? 'Ge ditt lag ett namn för att komma igång'
              : 'Välj vilket lag du vill hantera'}
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
                + Skapa nytt lag
              </Button>
            </>
          )}

          {mode === 'create' && (
            <>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teamName">Lagnamn</Label>
                  <Input
                    id="teamName"
                    value={teamName}
                    onChange={e => setTeamName(e.target.value)}
                    placeholder="t.ex. Thunderbolts FC"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Skapar…' : 'Skapa lag'}
                </Button>
              </form>
              {teams.length > 0 && (
                <Button variant="ghost" className="w-full" onClick={() => setMode('choose')}>
                  ← Tillbaka till laglistan
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
            <LogOut className="h-4 w-4 mr-2" /> Logga ut
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
