import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { usePlayers, useTrainingSessions, useWeeklyFocus, useCoachNotes } from '@/hooks/useLocalStorage';
import { useEnhancedGames } from '@/hooks/useEnhancedGames';
import { format } from 'date-fns';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const navigate = useNavigate();
  const { players } = usePlayers();
  const { games } = useEnhancedGames();
  const { sessions } = useTrainingSessions();
  const { focus, saveFocus } = useWeeklyFocus();
  const { notes, saveNotes } = useCoachNotes();

  const upcomingGame = games.find(g => g.status === 'Not Started');
  const liveGame = games.find(g => g.status === 'Live');
  const lastPlayedGame = games
    .filter(g => g.status === 'Finished')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  const nextGame = liveGame || upcomingGame;

  const injuredPlayers = players.filter(p => p.status === 'Injured');
  const focusPlayers = players.filter(p => p.focusFlag && p.status === 'Active');
  const hasAlerts = injuredPlayers.length > 0 || focusPlayers.length > 0;

  const activePlayers = players.filter(p => p.status === 'Active').length;
  const finishedGames = games.filter(g => g.status === 'Finished');
  const gamesPlayed = finishedGames.length;
  const gamesWon = finishedGames.filter(g => g.ourScore > g.opponentScore).length;
  const winRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : null;

  // Coaching focus editing
  const [editing, setEditing] = useState(false);
  const [focusValue, setFocusValue] = useState(focus);
  const [notesValue, setNotesValue] = useState(notes);

  const handleSave = () => {
    saveFocus(focusValue);
    saveNotes(notesValue);
    setEditing(false);
  };

  const handleCancel = () => {
    setFocusValue(focus);
    setNotesValue(notes);
    setEditing(false);
  };

  const hasFocusContent = focus || notes;

  return (
    <AppLayout>
      <div className="page-container">
        {/* Header */}
        <h1 className="section-title mb-6">Dashboard</h1>

        {/* 1. Next Game — Primary */}
        <section className="border-t border-border pt-4 pb-4">
          <h2 className="text-xs font-medium text-muted-foreground tracking-wide mb-3">Next Game</h2>
          {nextGame ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-semibold text-foreground">{nextGame.opponent}</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {format(new Date(nextGame.date), 'EEE, MMM d')} · {nextGame.location}
                </p>
              </div>
              <button
                onClick={() => navigate(`/games/${nextGame.id}`)}
                className="text-sm font-medium text-primary hover:underline shrink-0 ml-4"
              >
                {nextGame.status === 'Live' ? 'Open Game' : 'Prepare Game'}
              </button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No upcoming games</p>
          )}
        </section>

        {/* 2. Coaching Focus — Combined */}
        <section className="border-t border-border pt-4 pb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-medium text-muted-foreground tracking-wide">Coaching Focus</h2>
            {!editing && (
              <button onClick={() => setEditing(true)} className="text-xs text-primary hover:underline">
                Edit
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-3 max-w-lg">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Weekly Focus</label>
                <Input
                  value={focusValue}
                  onChange={(e) => setFocusValue(e.target.value)}
                  className="h-8 text-sm"
                  placeholder="e.g. Defensive transitions"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
                <Textarea
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  rows={3}
                  className="text-sm"
                  placeholder="Additional coaching notes..."
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="h-7 text-xs" onClick={handleSave}>Save</Button>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleCancel}>Cancel</Button>
              </div>
            </div>
          ) : hasFocusContent ? (
            <div className="space-y-1">
              {focus && <p className="text-sm font-medium text-foreground">{focus}</p>}
              {notes && <p className="text-sm text-muted-foreground">{notes}</p>}
            </div>
          ) : null}
        </section>

        {/* 3. Player Alerts — Conditional */}
        {hasAlerts && (
          <section className="border-t border-border pt-4 pb-4">
            <h2 className="text-xs font-medium text-muted-foreground tracking-wide mb-3">Player Alerts</h2>
            <div className="space-y-1">
              {injuredPlayers.map(p => (
                <div
                  key={p.id}
                  className="flex items-center justify-between py-1 cursor-pointer hover:bg-muted/50 -mx-1 px-1"
                  onClick={() => navigate(`/team/${p.id}`)}
                >
                  <span className="text-sm text-foreground">{p.name}</span>
                  <span className="text-xs text-destructive font-medium">Injured</span>
                </div>
              ))}
              {focusPlayers.map(p => (
                <div
                  key={p.id}
                  className="flex items-center justify-between py-1 cursor-pointer hover:bg-muted/50 -mx-1 px-1"
                  onClick={() => navigate(`/team/${p.id}`)}
                >
                  <span className="text-sm text-foreground">{p.name}</span>
                  <span className="text-xs text-warning font-medium">Focus</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. Season Overview — Demoted */}
        <section className="border-t border-border pt-4 mt-2">
          <h2 className="text-xs font-medium text-muted-foreground tracking-wide mb-3">Season Overview</h2>
          <div className="flex gap-8 text-sm text-muted-foreground">
            <span>
              Players <strong className="text-foreground font-semibold">{activePlayers}</strong>/{players.length}
            </span>
            <span>
              Games <strong className="text-foreground font-semibold">{gamesPlayed}</strong>
            </span>
            <span>
              Record <strong className="text-foreground font-semibold">{gamesWon}W {gamesPlayed - gamesWon}L</strong>
              {winRate !== null && <span className="ml-1">({winRate}%)</span>}
            </span>
            <span>
              Sessions <strong className="text-foreground font-semibold">{sessions.length}</strong>
            </span>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
