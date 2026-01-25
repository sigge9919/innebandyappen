import { useState, useEffect, useCallback } from 'react';
import { Player, Game, TrainingSession, Drill, Play } from '@/types';
import * as storage from '@/lib/storage';

// Initialize storage on first import
storage.initializeStorage();

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setPlayers(storage.getPlayers());
    setIsLoading(false);
  }, []);

  const addPlayer = useCallback((player: Player) => {
    storage.addPlayer(player);
    setPlayers(storage.getPlayers());
  }, []);

  const updatePlayer = useCallback((id: string, updates: Partial<Player>) => {
    storage.updatePlayer(id, updates);
    setPlayers(storage.getPlayers());
  }, []);

  const deletePlayer = useCallback((id: string) => {
    storage.deletePlayer(id);
    setPlayers(storage.getPlayers());
  }, []);

  const refresh = useCallback(() => {
    setPlayers(storage.getPlayers());
  }, []);

  return { players, isLoading, addPlayer, updatePlayer, deletePlayer, refresh };
}

export function useGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setGames(storage.getGames());
    setIsLoading(false);
  }, []);

  const addGame = useCallback((game: Game) => {
    storage.addGame(game);
    setGames(storage.getGames());
  }, []);

  const updateGame = useCallback((id: string, updates: Partial<Game>) => {
    storage.updateGame(id, updates);
    setGames(storage.getGames());
  }, []);

  const deleteGame = useCallback((id: string) => {
    storage.deleteGame(id);
    setGames(storage.getGames());
  }, []);

  const refresh = useCallback(() => {
    setGames(storage.getGames());
  }, []);

  return { games, isLoading, addGame, updateGame, deleteGame, refresh };
}

export function useTrainingSessions() {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setSessions(storage.getTrainingSessions());
    setIsLoading(false);
  }, []);

  const addSession = useCallback((session: TrainingSession) => {
    storage.addTrainingSession(session);
    setSessions(storage.getTrainingSessions());
  }, []);

  const updateSession = useCallback((id: string, updates: Partial<TrainingSession>) => {
    storage.updateTrainingSession(id, updates);
    setSessions(storage.getTrainingSessions());
  }, []);

  const deleteSession = useCallback((id: string) => {
    storage.deleteTrainingSession(id);
    setSessions(storage.getTrainingSessions());
  }, []);

  const refresh = useCallback(() => {
    setSessions(storage.getTrainingSessions());
  }, []);

  return { sessions, isLoading, addSession, updateSession, deleteSession, refresh };
}

export function useDrills() {
  const [drills, setDrills] = useState<Drill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setDrills(storage.getDrills());
    setIsLoading(false);
  }, []);

  const addDrill = useCallback((drill: Drill) => {
    storage.addDrill(drill);
    setDrills(storage.getDrills());
  }, []);

  const refresh = useCallback(() => {
    setDrills(storage.getDrills());
  }, []);

  return { drills, isLoading, addDrill, refresh };
}

export function usePlays() {
  const [plays, setPlays] = useState<Play[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setPlays(storage.getPlays());
    setIsLoading(false);
  }, []);

  const addPlay = useCallback((play: Play) => {
    storage.addPlay(play);
    setPlays(storage.getPlays());
  }, []);

  const refresh = useCallback(() => {
    setPlays(storage.getPlays());
  }, []);

  return { plays, isLoading, addPlay, refresh };
}

export function useWeeklyFocus() {
  const [focus, setFocus] = useState('');

  useEffect(() => {
    setFocus(storage.getWeeklyFocus());
  }, []);

  const saveFocus = useCallback((newFocus: string) => {
    storage.saveWeeklyFocus(newFocus);
    setFocus(newFocus);
  }, []);

  return { focus, saveFocus };
}

export function useCoachNotes() {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setNotes(storage.getCoachNotes());
  }, []);

  const saveNotes = useCallback((newNotes: string) => {
    storage.saveCoachNotes(newNotes);
    setNotes(newNotes);
  }, []);

  return { notes, saveNotes };
}
