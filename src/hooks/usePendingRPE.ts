import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTeam } from '@/contexts/TeamContext';
import { usePlayers, useRPERatings, useTrainingSessions } from '@/hooks/useLocalStorage';
import { useEnhancedGames } from '@/hooks/useEnhancedGames';

export interface PendingSession {
  type: 'game' | 'training';
  id: string;
  label: string;
}

export function usePendingRPE() {
  const { user } = useAuth();
  const { activeRole } = useTeam();
  const { players } = usePlayers();
  const { games } = useEnhancedGames();
  const { sessions } = useTrainingSessions();

  const myPlayer = players.find(p => p.userId === user?.id);
  const { ratings } = useRPERatings(myPlayer?.id);

  const [pendingSessions, setPendingSessions] = useState<PendingSession[]>([]);

  useEffect(() => {
    if (!myPlayer || !ratings) { setPendingSessions([]); return; }

    const ratedSessionIds = new Set(ratings.map(r => `${r.sessionType}-${r.sessionId}`));
    const pending: PendingSession[] = [];

    games.forEach(game => {
      if (game.status === 'Finished' && game.squadPlayerIds?.includes(myPlayer.id)) {
        const key = `game-${game.id}`;
        if (!ratedSessionIds.has(key)) {
          pending.push({ type: 'game', id: game.id, label: `Match mot ${game.opponent} (${game.date})` });
        }
      }
    });

    sessions.forEach(session => {
      if (session.playerIds.includes(myPlayer.id)) {
        const key = `training-${session.id}`;
        if (!ratedSessionIds.has(key)) {
          pending.push({ type: 'training', id: session.id, label: `Träning: ${session.theme} (${session.date})` });
        }
      }
    });

    setPendingSessions(pending);
  }, [myPlayer, ratings, games, sessions]);

  const isPlayer = activeRole === 'player';

  return {
    pendingSessions,
    pendingCount: pendingSessions.length,
    myPlayer,
    isPlayer,
  };
}
