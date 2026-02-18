import { useState, useEffect, useCallback } from 'react';
import { 
  EnhancedGame, 
  GameEvent, 
  GameLine, 
  Period, 
  Team, 
  EventType, 
  TeamStats, 
  LineStats, 
  PeriodStats, 
  PlayerGameStats,
  GameSituation,
  PenaltyEvent,
  SpecialTeamsStats,
  createEmptyPlayerStats,
} from '@/types/game';
import {
  calculateTeamStats,
  calculatePeriodStats,
  calculateLineStats,
  calculateSpecialTeamsStats,
  calculatePlayerStatsFromEvents,
  dbToEnhancedGame,
  enhancedGameToDb,
  enhancedGameUpdatesToDb,
} from '@/lib/gameStorage';
import { supabase } from '@/integrations/supabase/client';
import { useTeam } from '@/contexts/TeamContext';

export function useEnhancedGames() {
  const [games, setGames] = useState<EnhancedGame[]>([]);
  const { activeTeam } = useTeam();

  const refresh = useCallback(async () => {
    if (!activeTeam) { setGames([]); return; }
    const { data } = await supabase.from('games').select('*').eq('team_id', activeTeam.id);
    setGames((data ?? []).map(dbToEnhancedGame));
  }, [activeTeam]);

  useEffect(() => { refresh(); }, [refresh]);

  const addEnhancedGame = useCallback(async (game: EnhancedGame) => {
    if (!activeTeam) return;
    await supabase.from('games').insert(enhancedGameToDb(game, activeTeam.id));
    refresh();
  }, [activeTeam, refresh]);

  const updateEnhancedGame = useCallback(async (id: string, updates: Partial<EnhancedGame>) => {
    await supabase.from('games').update(enhancedGameUpdatesToDb(updates)).eq('id', id);
    refresh();
  }, [refresh]);

  const deleteEnhancedGame = useCallback(async (id: string) => {
    await supabase.from('games').delete().eq('id', id);
    refresh();
  }, [refresh]);

  return { games, addEnhancedGame, updateEnhancedGame, deleteEnhancedGame, refresh };
}

export function useGameDetail(gameId: string) {
  const [game, setGame] = useState<EnhancedGame | null>(null);

  const refresh = useCallback(async () => {
    const { data } = await supabase.from('games').select('*').eq('id', gameId).single();
    setGame(data ? dbToEnhancedGame(data) : null);
  }, [gameId]);

  useEffect(() => { refresh(); }, [refresh]);

  // Save full game state helper
  const saveGame = useCallback(async (updates: Partial<EnhancedGame>) => {
    await supabase.from('games').update(enhancedGameUpdatesToDb(updates)).eq('id', gameId);
    refresh();
  }, [gameId, refresh]);

  const updateGame = useCallback((updates: Partial<EnhancedGame>) => {
    if (!game) return;
    saveGame(updates);
  }, [game, saveGame]);

  const updateSquad = useCallback((playerIds: string[]) => saveGame({ squadPlayerIds: playerIds }), [saveGame]);

  const updateLine = useCallback((lineId: string, updates: Partial<GameLine>) => {
    if (!game) return;
    const newLines = game.lines.map(l => l.id === lineId ? { ...l, ...updates } : l);
    saveGame({ lines: newLines });
  }, [game, saveGame]);

  const startGame = useCallback(() => {
    if (!game) return;
    saveGame({ status: 'Live', currentPeriod: '1', activeGoalieId: game.startingGoalieId });
  }, [game, saveGame]);

  const endGame = useCallback(() => saveGame({ status: 'Finished' }), [saveGame]);

  const setStartingGoalie = useCallback((goalieId: string | undefined) => saveGame({ startingGoalieId: goalieId }), [saveGame]);
  const setActiveGoalie = useCallback((goalieId: string | undefined) => saveGame({ activeGoalieId: goalieId }), [saveGame]);
  const setActiveLine = useCallback((lineId: string) => saveGame({ activeLineId: lineId }), [saveGame]);
  const setCurrentPeriod = useCallback((period: Period) => saveGame({ currentPeriod: period }), [saveGame]);

  const nextPeriod = useCallback(() => {
    if (!game) return;
    const order: Period[] = ['1', '2', '3', 'OT'];
    const idx = order.indexOf(game.currentPeriod);
    if (idx < order.length - 1) saveGame({ currentPeriod: order[idx + 1] });
  }, [game, saveGame]);

  const setCurrentSituation = useCallback((situation: GameSituation) => saveGame({ currentSituation: situation }), [saveGame]);

  const recordEvent = useCallback((
    type: EventType, team: Team,
    goalDetails?: { scorerId?: string; assistPlayerIds?: string[]; lineId?: string }
  ) => {
    if (!game) return;
    const newEvent: GameEvent = {
      id: crypto.randomUUID(),
      gameId,
      type,
      team,
      period: game.currentPeriod,
      situation: game.currentSituation || '5v5',
      lineId: goalDetails?.lineId || game.activeLineId,
      playerId: goalDetails?.scorerId,
      assistPlayerIds: goalDetails?.assistPlayerIds,
      timestamp: Date.now(),
    };
    const newEvents = [...game.events, newEvent];
    const updates: Partial<EnhancedGame> = { events: newEvents };
    if (type === 'goal') {
      if (team === 'home') updates.ourScore = game.ourScore + 1;
      else updates.opponentScore = game.opponentScore + 1;
    }
    saveGame(updates);
  }, [game, gameId, saveGame]);

  const undoLast = useCallback(() => {
    if (!game || game.events.length === 0) return;
    const removed = game.events[game.events.length - 1];
    const newEvents = game.events.slice(0, -1);
    const updates: Partial<EnhancedGame> = { events: newEvents };
    if (removed.type === 'goal') {
      if (removed.team === 'home') updates.ourScore = Math.max(0, game.ourScore - 1);
      else updates.opponentScore = Math.max(0, game.opponentScore - 1);
    }
    saveGame(updates);
  }, [game, saveGame]);

  const recordPenalty = useCallback((team: Team, playerId?: string) => {
    if (!game) return;
    const newPenalty: PenaltyEvent = {
      id: crypto.randomUUID(),
      gameId,
      team,
      period: game.currentPeriod,
      duration: 2,
      playerId,
      timestamp: Date.now(),
    };
    const newPenalties = [...(game.penalties || []), newPenalty];
    const newSituation: GameSituation = team === 'home' ? '4v5' : '5v4';
    saveGame({ penalties: newPenalties, currentSituation: newSituation });
  }, [game, gameId, saveGame]);

  const getHomeStats = useCallback((period?: Period): TeamStats => {
    if (!game) return { shotsOnGoal: 0, shotsOffGoal: 0, shotsBlocked: 0, goals: 0 };
    return calculateTeamStats(game.events, 'home', period);
  }, [game]);

  const getOpponentStats = useCallback((period?: Period): TeamStats => {
    if (!game) return { shotsOnGoal: 0, shotsOffGoal: 0, shotsBlocked: 0, goals: 0 };
    return calculateTeamStats(game.events, 'opponent', period);
  }, [game]);

  const getPeriodHomeStats = useCallback((): TeamStats => {
    if (!game) return { shotsOnGoal: 0, shotsOffGoal: 0, shotsBlocked: 0, goals: 0 };
    return calculateTeamStats(game.events, 'home', game.currentPeriod);
  }, [game]);

  const getPeriodOpponentStats = useCallback((): TeamStats => {
    if (!game) return { shotsOnGoal: 0, shotsOffGoal: 0, shotsBlocked: 0, goals: 0 };
    return calculateTeamStats(game.events, 'opponent', game.currentPeriod);
  }, [game]);

  const getPeriodStats = useCallback((): PeriodStats[] => {
    if (!game) return [];
    return calculatePeriodStats(game.events);
  }, [game]);

  const getLineStats = useCallback((): LineStats[] => {
    if (!game) return [];
    return calculateLineStats(game.events, game.lines);
  }, [game]);

  const getSpecialTeamsStats = useCallback(() => {
    if (!game) return { powerPlay: null, boxPlay: null };
    return calculateSpecialTeamsStats(game.events, game.penalties || [], 'home');
  }, [game]);

  const updateNotes = useCallback((notes: EnhancedGame['notes']) => saveGame({ notes }), [saveGame]);

  const updatePlayerStat = useCallback((playerId: string, field: keyof Omit<PlayerGameStats, 'playerId'>, value: number) => {
    if (!game) return;
    const stats = [...(game.playerStats || [])];
    const idx = stats.findIndex(s => s.playerId === playerId);
    if (idx !== -1) {
      stats[idx] = { ...stats[idx], [field]: value };
    } else {
      const newStat = createEmptyPlayerStats(playerId);
      (newStat as any)[field] = value;
      stats.push(newStat);
    }
    saveGame({ playerStats: stats });
  }, [game, saveGame]);

  const assignBlockedShot = useCallback((eventId: string, playerId: string) => {
    if (!game) return;
    const events = game.events.map(e => e.id === eventId ? { ...e, blockedByPlayerId: playerId } : e);
    saveGame({ events });
  }, [game, saveGame]);

  const updateGoalDetails = useCallback((eventId: string, scorerId?: string, assistPlayerIds?: string[]) => {
    if (!game) return;
    const events = game.events.map(e => {
      if (e.id !== eventId) return e;
      return {
        ...e,
        ...(scorerId !== undefined ? { playerId: scorerId } : {}),
        ...(assistPlayerIds !== undefined ? { assistPlayerIds: assistPlayerIds.slice(0, 2) } : {}),
      };
    });
    saveGame({ events });
  }, [game, saveGame]);

  const assignPenaltyPlayer = useCallback((penaltyId: string, playerId: string) => {
    if (!game) return;
    const penalties = (game.penalties || []).map(p => p.id === penaltyId ? { ...p, playerId } : p);
    saveGame({ penalties });
  }, [game, saveGame]);

  const updateTeamPeriodStats = useCallback((team: Team, period: Period, stats: Partial<TeamStats>) => {
    if (!game) return;
    // Add/remove events to match target stats
    let events = [...game.events];
    let ourScore = game.ourScore;
    let opponentScore = game.opponentScore;

    const eventTypeMap: Record<keyof TeamStats, EventType> = {
      goals: 'goal', shotsOnGoal: 'shot_on_goal', shotsOffGoal: 'shot_off_goal', shotsBlocked: 'shot_blocked',
    };

    Object.entries(stats).forEach(([key, value]) => {
      if (value === undefined) return;
      const statKey = key as keyof TeamStats;
      const eventType = eventTypeMap[statKey];
      const current = calculateTeamStats(events, team, period)[statKey];
      const diff = value - current;

      if (diff > 0) {
        for (let i = 0; i < diff; i++) {
          events.push({
            id: crypto.randomUUID(), gameId, type: eventType, team, period,
            situation: '5v5', timestamp: Date.now(),
          });
          if (eventType === 'goal') {
            if (team === 'home') ourScore++; else opponentScore++;
          }
        }
      } else if (diff < 0) {
        let toRemove = Math.abs(diff);
        events = events.filter(e => {
          if (toRemove > 0 && e.type === eventType && e.team === team && e.period === period) {
            toRemove--;
            if (eventType === 'goal') {
              if (team === 'home') ourScore--; else opponentScore--;
            }
            return false;
          }
          return true;
        });
      }
    });

    saveGame({ events, ourScore, opponentScore });
  }, [game, gameId, saveGame]);

  return {
    game, refresh, updateGame, updateSquad, updateLine,
    startGame, endGame, setStartingGoalie, setActiveGoalie,
    setActiveLine, setCurrentPeriod, nextPeriod, setCurrentSituation,
    recordEvent, recordPenalty, undoLast,
    getHomeStats, getOpponentStats, getPeriodHomeStats, getPeriodOpponentStats,
    getPeriodStats, getLineStats, getSpecialTeamsStats,
    updateNotes, updatePlayerStat, assignBlockedShot,
    updateGoalDetails, assignPenaltyPlayer, updateTeamPeriodStats,
  };
}
