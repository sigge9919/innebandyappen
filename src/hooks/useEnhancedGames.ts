import { useState, useEffect, useCallback, useRef } from 'react';
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

export function useEnhancedGames(seasonId?: string | null) {
  const [games, setGames] = useState<EnhancedGame[]>([]);
  const { activeTeam, selectedSeasonId: ctxSeasonId } = useTeam();
  const effectiveSeasonId = seasonId !== undefined ? seasonId : ctxSeasonId;

  const refresh = useCallback(async () => {
    if (!activeTeam) { setGames([]); return; }
    let query = supabase.from('games').select('*').eq('team_id', activeTeam.id);
    if (effectiveSeasonId) query = query.eq('season_id', effectiveSeasonId);
    const { data } = await query;
    setGames((data ?? []).map(dbToEnhancedGame));
  }, [activeTeam, effectiveSeasonId]);

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
  const gameRef = useRef<EnhancedGame | null>(null);

  // Keep ref in sync
  useEffect(() => { gameRef.current = game; }, [game]);

  const refresh = useCallback(async () => {
    const { data } = await supabase.from('games').select('*').eq('id', gameId).single();
    const g = data ? dbToEnhancedGame(data) : null;
    setGame(g);
    gameRef.current = g;
  }, [gameId]);

  useEffect(() => { refresh(); }, [refresh]);

  // Save full game state helper — optimistically merges into local state via ref
  const saveGame = useCallback(async (updates: Partial<EnhancedGame>) => {
    // Merge into ref so rapid sequential calls see each other's changes
    if (gameRef.current) {
      const merged = { ...gameRef.current, ...updates };
      gameRef.current = merged;
      setGame(merged);
    }
    await supabase.from('games').update(enhancedGameUpdatesToDb(updates)).eq('id', gameId);
  }, [gameId]);

  const updateGame = useCallback((updates: Partial<EnhancedGame>) => {
    if (!gameRef.current) return;
    saveGame(updates);
  }, [saveGame]);

  const updateSquad = useCallback((playerIds: string[]) => saveGame({ squadPlayerIds: playerIds }), [saveGame]);

  const updateLine = useCallback((lineId: string, updates: Partial<GameLine>) => {
    const g = gameRef.current;
    if (!g) return;
    const newLines = g.lines.map(l => l.id === lineId ? { ...l, ...updates } : l);
    saveGame({ lines: newLines });
  }, [saveGame]);

  const startGame = useCallback(() => {
    const g = gameRef.current;
    if (!g) return;
    saveGame({ status: 'Live', currentPeriod: '1', activeGoalieId: g.startingGoalieId });
  }, [saveGame]);

  const endGame = useCallback(() => saveGame({ status: 'Finished' }), [saveGame]);

  const setStartingGoalie = useCallback((goalieId: string | undefined) => saveGame({ startingGoalieId: goalieId }), [saveGame]);
  const setActiveGoalie = useCallback((goalieId: string | undefined) => saveGame({ activeGoalieId: goalieId }), [saveGame]);
  const setActiveLine = useCallback((lineId: string) => saveGame({ activeLineId: lineId }), [saveGame]);
  const setCurrentPeriod = useCallback((period: Period) => saveGame({ currentPeriod: period }), [saveGame]);

  const nextPeriod = useCallback(() => {
    const g = gameRef.current;
    if (!g) return;
    const order: Period[] = ['1', '2', '3', 'OT'];
    const idx = order.indexOf(g.currentPeriod);
    if (idx < order.length - 1) saveGame({ currentPeriod: order[idx + 1] });
  }, [saveGame]);

  const setCurrentSituation = useCallback((situation: GameSituation) => saveGame({ currentSituation: situation }), [saveGame]);

  const recordEvent = useCallback((
    type: EventType, team: Team,
    goalDetails?: { scorerId?: string; assistPlayerIds?: string[]; lineId?: string; situationOverride?: GameSituation }
  ) => {
    const g = gameRef.current;
    if (!g) return;
    const eventLineId = goalDetails?.lineId || g.activeLineId;
    const activeLine = g.lines.find(l => l.id === eventLineId);
    const newEvent: GameEvent = {
      id: crypto.randomUUID(),
      gameId,
      type,
      team,
      period: g.currentPeriod,
      situation: goalDetails?.situationOverride || g.currentSituation || '5v5',
      lineId: goalDetails?.situationOverride === 'PS' ? undefined : eventLineId,
      playerId: goalDetails?.scorerId,
      assistPlayerIds: goalDetails?.assistPlayerIds,
      onIcePlayerIds: goalDetails?.situationOverride === 'PS' ? undefined : (activeLine?.playerIds ? [...activeLine.playerIds] : undefined),
      goalieId: g.activeGoalieId || g.startingGoalieId,
      timestamp: Date.now(),
    };
    const newEvents = [...g.events, newEvent];
    const updates: Partial<EnhancedGame> = { events: newEvents };
    if (type === 'goal') {
      if (team === 'home') updates.ourScore = g.ourScore + 1;
      else updates.opponentScore = g.opponentScore + 1;
    }
    saveGame(updates);
  }, [gameId, saveGame]);

  const undoLast = useCallback(() => {
    const g = gameRef.current;
    if (!g || g.events.length === 0) return;
    const removed = g.events[g.events.length - 1];
    const newEvents = g.events.slice(0, -1);
    const updates: Partial<EnhancedGame> = { events: newEvents };
    if (removed.type === 'goal') {
      if (removed.team === 'home') updates.ourScore = Math.max(0, g.ourScore - 1);
      else updates.opponentScore = Math.max(0, g.opponentScore - 1);
    }
    saveGame(updates);
  }, [saveGame]);

  const recordPenalty = useCallback((team: Team, playerId?: string) => {
    const g = gameRef.current;
    if (!g) return;
    const newPenalty: PenaltyEvent = {
      id: crypto.randomUUID(),
      gameId,
      team,
      period: g.currentPeriod,
      duration: 2,
      playerId,
      timestamp: Date.now(),
    };
    const newPenalties = [...(g.penalties || []), newPenalty];
    const newSituation: GameSituation = team === 'home' ? '4v5' : '5v4';
    saveGame({ penalties: newPenalties, currentSituation: newSituation });
  }, [gameId, saveGame]);

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
    const g = gameRef.current;
    if (!g) return;
    const stats = [...(g.playerStats || [])];
    const idx = stats.findIndex(s => s.playerId === playerId);
    if (idx !== -1) {
      stats[idx] = { ...stats[idx], [field]: value };
    } else {
      const newStat = createEmptyPlayerStats(playerId);
      (newStat as any)[field] = value;
      stats.push(newStat);
    }
    saveGame({ playerStats: stats });
  }, [saveGame]);

  const assignBlockedShot = useCallback((eventId: string, playerId: string) => {
    const g = gameRef.current;
    if (!g) return;
    const events = g.events.map(e => e.id === eventId ? { ...e, blockedByPlayerId: playerId } : e);
    saveGame({ events });
  }, [saveGame]);

  const updateGoalDetails = useCallback((eventId: string, scorerId?: string, assistPlayerIds?: string[]) => {
    const g = gameRef.current;
    if (!g) return;
    const events = g.events.map(e => {
      if (e.id !== eventId) return e;
      return {
        ...e,
        ...(scorerId !== undefined ? { playerId: scorerId } : {}),
        ...(assistPlayerIds !== undefined ? { assistPlayerIds: assistPlayerIds.slice(0, 2) } : {}),
      };
    });
    saveGame({ events });
  }, [saveGame]);

  const assignPenaltyPlayer = useCallback((penaltyId: string, playerId: string) => {
    const g = gameRef.current;
    if (!g) return;
    const penalties = (g.penalties || []).map(p => p.id === penaltyId ? { ...p, playerId } : p);
    saveGame({ penalties });
  }, [saveGame]);

  const updateTeamPeriodStats = useCallback((team: Team, period: Period, stats: Partial<TeamStats>) => {
    const g = gameRef.current;
    if (!g) return;
    let events = [...g.events];
    let ourScore = g.ourScore;
    let opponentScore = g.opponentScore;

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
  }, [gameId, saveGame]);

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
