import { useState, useEffect, useCallback } from 'react';
import { EnhancedGame, GameEvent, GameLine, Period, Team, EventType, TeamStats, LineStats, PeriodStats, PlayerGameStats } from '@/types/game';
import {
  getEnhancedGames,
  saveEnhancedGames,
  getEnhancedGame,
  addEnhancedGame as addGame,
  updateEnhancedGame as updateGame,
  deleteEnhancedGame as deleteGame,
  addGameEvent as addEvent,
  undoLastEvent,
  calculateTeamStats,
  calculatePeriodStats,
  calculateLineStats,
  updatePlayerStats as updatePlayerStatsStorage,
  assignBlockedShot as assignBlockedShotStorage,
  updatePeriodTeamStats,
} from '@/lib/gameStorage';

export function useEnhancedGames() {
  const [games, setGames] = useState<EnhancedGame[]>([]);

  useEffect(() => {
    setGames(getEnhancedGames());
  }, []);

  const refresh = useCallback(() => {
    setGames(getEnhancedGames());
  }, []);

  const addEnhancedGame = useCallback((game: EnhancedGame) => {
    addGame(game);
    refresh();
  }, [refresh]);

  const updateEnhancedGame = useCallback((id: string, updates: Partial<EnhancedGame>) => {
    updateGame(id, updates);
    refresh();
  }, [refresh]);

  const deleteEnhancedGame = useCallback((id: string) => {
    deleteGame(id);
    refresh();
  }, [refresh]);

  return {
    games,
    addEnhancedGame,
    updateEnhancedGame,
    deleteEnhancedGame,
    refresh,
  };
}

export function useGameDetail(gameId: string) {
  const [game, setGame] = useState<EnhancedGame | null>(null);

  const refresh = useCallback(() => {
    const g = getEnhancedGame(gameId);
    setGame(g || null);
  }, [gameId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Update game properties
  const updateGame = useCallback((updates: Partial<EnhancedGame>) => {
    if (!game) return;
    const games = getEnhancedGames();
    const index = games.findIndex(g => g.id === gameId);
    if (index !== -1) {
      games[index] = { ...games[index], ...updates };
      saveEnhancedGames(games);
      refresh();
    }
  }, [game, gameId, refresh]);

  // Squad management
  const updateSquad = useCallback((playerIds: string[]) => {
    updateGame({ squadPlayerIds: playerIds });
  }, [updateGame]);

  // Line management
  const updateLine = useCallback((lineId: string, updates: Partial<GameLine>) => {
    if (!game) return;
    const newLines = game.lines.map(l => 
      l.id === lineId ? { ...l, ...updates } : l
    );
    updateGame({ lines: newLines });
  }, [game, updateGame]);

  // Start game
  const startGame = useCallback(() => {
    updateGame({ status: 'Live', currentPeriod: '1' });
  }, [updateGame]);

  // End game
  const endGame = useCallback(() => {
    updateGame({ status: 'Finished' });
  }, [updateGame]);

  // Set active line
  const setActiveLine = useCallback((lineId: string) => {
    updateGame({ activeLineId: lineId });
  }, [updateGame]);

  // Set current period
  const setCurrentPeriod = useCallback((period: Period) => {
    updateGame({ currentPeriod: period });
  }, [updateGame]);

  // Record event
  const recordEvent = useCallback((type: EventType, team: Team) => {
    if (!game) return;
    addEvent(gameId, {
      type,
      team,
      period: game.currentPeriod,
      lineId: team === 'home' ? game.activeLineId : undefined,
    });
    refresh();
  }, [game, gameId, refresh]);

  // Undo last event
  const undoLast = useCallback(() => {
    undoLastEvent(gameId);
    refresh();
  }, [gameId, refresh]);

  // Get stats - total
  const getHomeStats = useCallback((period?: Period): TeamStats => {
    if (!game) return { shotsOnGoal: 0, shotsOffGoal: 0, shotsBlocked: 0, goals: 0 };
    return calculateTeamStats(game.events, 'home', period);
  }, [game]);

  const getOpponentStats = useCallback((period?: Period): TeamStats => {
    if (!game) return { shotsOnGoal: 0, shotsOffGoal: 0, shotsBlocked: 0, goals: 0 };
    return calculateTeamStats(game.events, 'opponent', period);
  }, [game]);

  // Get current period stats
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

  // Update post-game notes
  const updateNotes = useCallback((notes: EnhancedGame['notes']) => {
    updateGame({ notes });
  }, [updateGame]);

  // Post-game editing functions
  const updatePlayerStat = useCallback((playerId: string, field: keyof Omit<PlayerGameStats, 'playerId'>, value: number) => {
    updatePlayerStatsStorage(gameId, playerId, field, value);
    refresh();
  }, [gameId, refresh]);

  const assignBlockedShot = useCallback((eventId: string, playerId: string) => {
    assignBlockedShotStorage(gameId, eventId, playerId);
    refresh();
  }, [gameId, refresh]);

  const updateTeamPeriodStats = useCallback((team: Team, period: Period, stats: Partial<TeamStats>) => {
    Object.entries(stats).forEach(([key, value]) => {
      if (value !== undefined) {
        updatePeriodTeamStats(gameId, team, period, key as keyof TeamStats, value);
      }
    });
    refresh();
  }, [gameId, refresh]);

  return {
    game,
    refresh,
    updateGame,
    updateSquad,
    updateLine,
    startGame,
    endGame,
    setActiveLine,
    setCurrentPeriod,
    recordEvent,
    undoLast,
    getHomeStats,
    getOpponentStats,
    getPeriodHomeStats,
    getPeriodOpponentStats,
    getPeriodStats,
    getLineStats,
    updateNotes,
    updatePlayerStat,
    assignBlockedShot,
    updateTeamPeriodStats,
  };
}
