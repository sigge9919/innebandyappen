import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const { signIn, signUp, resetPassword } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isForgot) {
      const { error } = await resetPassword(email);
      setLoading(false);
      if (error) {
        toast({ title: 'Fel', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Kolla din e-post', description: 'Vi har skickat en länk för att återställa ditt lösenord.' });
        setIsForgot(false);
      }
      return;
    }

    const { error } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);
    setLoading(false);

    if (error) {
      toast({ title: 'Fel', description: error.message, variant: 'destructive' });
    } else if (isSignUp) {
      toast({ title: 'Kolla din e-post', description: 'Vi har skickat en bekräftelselänk.' });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <img src="/logo.png" alt="Floorball Tactix" className="mx-auto w-16 h-16 mb-4" />
          <CardTitle className="text-xl">Floorball Tactix</CardTitle>
          <CardDescription>
            {isForgot
              ? 'Ange din e-post för att återställa lösenordet'
              : isSignUp
                ? 'Skapa ditt konto'
                : 'Logga in för att fortsätta'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-post</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="coach@team.com"
              />
            </div>
            {!isForgot && (
              <div className="space-y-2">
                <Label htmlFor="password">Lösenord</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? 'Vänta…'
                : isForgot
                  ? 'Skicka återställningslänk'
                  : isSignUp
                    ? 'Skapa konto'
                    : 'Logga in'}
            </Button>
          </form>
          <div className="mt-4 text-center space-y-2">
            {!isForgot && !isSignUp && (
              <button
                type="button"
                onClick={() => setIsForgot(true)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors block w-full"
              >
                Glömt lösenord?
              </button>
            )}
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setIsForgot(false); }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors block w-full"
            >
              {isForgot
                ? 'Tillbaka till inloggning'
                : isSignUp
                  ? 'Har du redan ett konto? Logga in'
                  : 'Har du inget konto? Skapa ett'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
