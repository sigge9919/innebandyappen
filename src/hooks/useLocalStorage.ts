import { useState, useEffect, useCallback } from 'react';
import { Player, TrainingSession, Drill, Play, IndividualDevelopmentPlan, TestResult } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useTeam } from '@/contexts/TeamContext';

// Initialize storage - no-op for cloud
export function initializeStorage() {}

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { activeTeam } = useTeam();

  const refresh = useCallback(async () => {
    if (!activeTeam) { setPlayers([]); setIsLoading(false); return; }
    const { data } = await supabase
      .from('players')
      .select('*')
      .eq('team_id', activeTeam.id);
    setPlayers((data ?? []).map(dbToPlayer));
    setIsLoading(false);
  }, [activeTeam]);

  useEffect(() => { refresh(); }, [refresh]);

  const addPlayer = useCallback(async (player: Player) => {
    if (!activeTeam) return;
    await supabase.from('players').insert(playerToDb(player, activeTeam.id));
    refresh();
  }, [activeTeam, refresh]);

  const updatePlayer = useCallback(async (id: string, updates: Partial<Player>) => {
    await supabase.from('players').update(playerUpdatesToDb(updates)).eq('id', id);
    refresh();
  }, [refresh]);

  const deletePlayer = useCallback(async (id: string) => {
    await supabase.from('players').delete().eq('id', id);
    refresh();
  }, [refresh]);

  return { players, isLoading, addPlayer, updatePlayer, deletePlayer, refresh };
}

export function useGames() {
  const [games, setGames] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { activeTeam } = useTeam();

  const refresh = useCallback(async () => {
    if (!activeTeam) { setGames([]); setIsLoading(false); return; }
    const { data } = await supabase.from('games').select('*').eq('team_id', activeTeam.id);
    setGames(data ?? []);
    setIsLoading(false);
  }, [activeTeam]);

  useEffect(() => { refresh(); }, [refresh]);

  const addGame = useCallback(async (game: any) => {
    if (!activeTeam) return;
    await supabase.from('games').insert({ ...game, team_id: activeTeam.id });
    refresh();
  }, [activeTeam, refresh]);

  const updateGame = useCallback(async (id: string, updates: any) => {
    await supabase.from('games').update(updates).eq('id', id);
    refresh();
  }, [refresh]);

  const deleteGame = useCallback(async (id: string) => {
    await supabase.from('games').delete().eq('id', id);
    refresh();
  }, [refresh]);

  return { games, isLoading, addGame, updateGame, deleteGame, refresh };
}

export function useTrainingSessions() {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { activeTeam } = useTeam();

  const refresh = useCallback(async () => {
    if (!activeTeam) { setSessions([]); setIsLoading(false); return; }
    const { data } = await supabase.from('training_sessions').select('*').eq('team_id', activeTeam.id);
    setSessions((data ?? []).map(dbToTraining));
    setIsLoading(false);
  }, [activeTeam]);

  useEffect(() => { refresh(); }, [refresh]);

  const addSession = useCallback(async (session: TrainingSession) => {
    if (!activeTeam) return;
    await supabase.from('training_sessions').insert(trainingToDb(session, activeTeam.id));
    refresh();
  }, [activeTeam, refresh]);

  const updateSession = useCallback(async (id: string, updates: Partial<TrainingSession>) => {
    await supabase.from('training_sessions').update(trainingUpdatesToDb(updates)).eq('id', id);
    refresh();
  }, [refresh]);

  const deleteSession = useCallback(async (id: string) => {
    await supabase.from('training_sessions').delete().eq('id', id);
    refresh();
  }, [refresh]);

  return { sessions, isLoading, addSession, updateSession, deleteSession, refresh };
}

export function useDrills() {
  const [drills, setDrills] = useState<Drill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { activeTeam } = useTeam();

  const refresh = useCallback(async () => {
    if (!activeTeam) { setDrills([]); setIsLoading(false); return; }
    const { data } = await supabase.from('drills').select('*').eq('team_id', activeTeam.id);
    setDrills((data ?? []).map(dbToDrill));
    setIsLoading(false);
  }, [activeTeam]);

  useEffect(() => { refresh(); }, [refresh]);

  const addDrill = useCallback(async (drill: Drill) => {
    if (!activeTeam) return;
    await supabase.from('drills').insert(drillToDb(drill, activeTeam.id));
    refresh();
  }, [activeTeam, refresh]);

  const updateDrill = useCallback(async (id: string, updates: Partial<Drill>) => {
    await supabase.from('drills').update(drillUpdatesToDb(updates)).eq('id', id);
    refresh();
  }, [refresh]);

  const deleteDrill = useCallback(async (id: string) => {
    await supabase.from('drills').delete().eq('id', id);
    refresh();
  }, [refresh]);

  return { drills, isLoading, addDrill, updateDrill, deleteDrill, refresh };
}

export function usePlays() {
  const [plays, setPlays] = useState<Play[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { activeTeam } = useTeam();

  const refresh = useCallback(async () => {
    if (!activeTeam) { setPlays([]); setIsLoading(false); return; }
    const { data } = await supabase.from('plays').select('*').eq('team_id', activeTeam.id);
    setPlays((data ?? []).map(dbToPlay));
    setIsLoading(false);
  }, [activeTeam]);

  useEffect(() => { refresh(); }, [refresh]);

  const addPlay = useCallback(async (play: Play) => {
    if (!activeTeam) return;
    await supabase.from('plays').insert(playToDb(play, activeTeam.id));
    refresh();
  }, [activeTeam, refresh]);

  const updatePlay = useCallback(async (id: string, updates: Partial<Play>) => {
    await supabase.from('plays').update(playUpdatesToDb(updates)).eq('id', id);
    refresh();
  }, [refresh]);

  const deletePlay = useCallback(async (id: string) => {
    await supabase.from('plays').delete().eq('id', id);
    refresh();
  }, [refresh]);

  return { plays, isLoading, addPlay, updatePlay, deletePlay, refresh };
}

export function useIDPs() {
  const [idps, setIdps] = useState<IndividualDevelopmentPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { activeTeam } = useTeam();

  const refresh = useCallback(async () => {
    if (!activeTeam) { setIdps([]); setIsLoading(false); return; }
    const { data } = await supabase.from('idps').select('*').eq('team_id', activeTeam.id);
    setIdps((data ?? []).map(dbToIDP));
    setIsLoading(false);
  }, [activeTeam]);

  useEffect(() => { refresh(); }, [refresh]);

  const addIDP = useCallback(async (idp: IndividualDevelopmentPlan) => {
    if (!activeTeam) return;
    await supabase.from('idps').insert(idpToDb(idp, activeTeam.id));
    refresh();
  }, [activeTeam, refresh]);

  const updateIDP = useCallback(async (id: string, updates: Partial<IndividualDevelopmentPlan>) => {
    await supabase.from('idps').update(idpUpdatesToDb(updates)).eq('id', id);
    refresh();
  }, [refresh]);

  const deleteIDP = useCallback(async (id: string) => {
    await supabase.from('idps').delete().eq('id', id);
    refresh();
  }, [refresh]);

  return { idps, isLoading, addIDP, updateIDP, deleteIDP, refresh };
}

export function useTestResults() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { activeTeam } = useTeam();

  const refresh = useCallback(async () => {
    if (!activeTeam) { setTests([]); setIsLoading(false); return; }
    const { data } = await supabase.from('test_results').select('*').eq('team_id', activeTeam.id);
    setTests((data ?? []).map(dbToTestResult));
    setIsLoading(false);
  }, [activeTeam]);

  useEffect(() => { refresh(); }, [refresh]);

  const addTest = useCallback(async (test: TestResult) => {
    if (!activeTeam) return;
    await supabase.from('test_results').insert(testResultToDb(test, activeTeam.id));
    refresh();
  }, [activeTeam, refresh]);

  const updateTest = useCallback(async (id: string, updates: Partial<TestResult>) => {
    await supabase.from('test_results').update(testResultUpdatesToDb(updates)).eq('id', id);
    refresh();
  }, [refresh]);

  const deleteTest = useCallback(async (id: string) => {
    await supabase.from('test_results').delete().eq('id', id);
    refresh();
  }, [refresh]);

  return { tests, isLoading, addTest, updateTest, deleteTest, refresh };
}

export function useWeeklyFocus() {
  const [focus, setFocus] = useState('');
  const { activeTeam } = useTeam();

  useEffect(() => {
    if (!activeTeam) return;
    supabase.from('team_settings').select('weekly_focus').eq('team_id', activeTeam.id).single()
      .then(({ data }) => setFocus(data?.weekly_focus ?? ''));
  }, [activeTeam]);

  const saveFocus = useCallback(async (newFocus: string) => {
    if (!activeTeam) return;
    await supabase.from('team_settings').update({ weekly_focus: newFocus, updated_at: new Date().toISOString() })
      .eq('team_id', activeTeam.id);
    setFocus(newFocus);
  }, [activeTeam]);

  return { focus, saveFocus };
}

export function useCoachNotes() {
  const [notes, setNotes] = useState('');
  const { activeTeam } = useTeam();

  useEffect(() => {
    if (!activeTeam) return;
    supabase.from('team_settings').select('coach_notes').eq('team_id', activeTeam.id).single()
      .then(({ data }) => setNotes(data?.coach_notes ?? ''));
  }, [activeTeam]);

  const saveNotes = useCallback(async (newNotes: string) => {
    if (!activeTeam) return;
    await supabase.from('team_settings').update({ coach_notes: newNotes, updated_at: new Date().toISOString() })
      .eq('team_id', activeTeam.id);
    setNotes(newNotes);
  }, [activeTeam]);

  return { notes, saveNotes };
}

export function usePlayCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const { activeTeam } = useTeam();

  useEffect(() => {
    if (!activeTeam) return;
    supabase.from('team_settings').select('play_categories').eq('team_id', activeTeam.id).single()
      .then(({ data }) => setCategories(data?.play_categories ?? ['System', 'Set Play', 'Special Teams']));
  }, [activeTeam]);

  const addCategory = useCallback(async (category: string) => {
    if (!activeTeam) return;
    const updated = [...categories, category];
    await supabase.from('team_settings').update({ play_categories: updated }).eq('team_id', activeTeam.id);
    setCategories(updated);
  }, [activeTeam, categories]);

  const deleteCategory = useCallback(async (category: string) => {
    if (!activeTeam) return;
    const updated = categories.filter(c => c !== category);
    await supabase.from('team_settings').update({ play_categories: updated }).eq('team_id', activeTeam.id);
    setCategories(updated);
  }, [activeTeam, categories]);

  return { categories, addCategory, deleteCategory };
}

export function useTestTypes() {
  const DEFAULT_TYPES = ['Fitness', 'Skill'];
  const [testTypes, setTestTypes] = useState<string[]>(DEFAULT_TYPES);
  const { activeTeam } = useTeam();

  useEffect(() => {
    if (!activeTeam) return;
    supabase.from('team_settings').select('test_types').eq('team_id', activeTeam.id).single()
      .then(({ data }) => setTestTypes((data as any)?.test_types ?? DEFAULT_TYPES));
  }, [activeTeam]);

  const addTestType = useCallback(async (type: string) => {
    if (!activeTeam) return;
    const updated = [...testTypes, type];
    await supabase.from('team_settings').update({ test_types: updated } as any).eq('team_id', activeTeam.id);
    setTestTypes(updated);
  }, [activeTeam, testTypes]);

  const deleteTestType = useCallback(async (type: string) => {
    if (!activeTeam) return;
    const updated = testTypes.filter(t => t !== type);
    await supabase.from('team_settings').update({ test_types: updated } as any).eq('team_id', activeTeam.id);
    setTestTypes(updated);
  }, [activeTeam, testTypes]);

  return { testTypes, addTestType, deleteTestType };
}

// --- DB mapping helpers ---

function dbToPlayer(row: any): Player {
  return {
    id: row.id,
    name: row.name,
    positions: row.positions ?? [],
    stickSide: row.stick_side ?? 'Left',
    jerseyNumber: row.jersey_number ?? 0,
    status: row.status ?? 'Active',
    notes: row.notes ?? '',
    focusFlag: row.focus_flag ?? false,
  };
}

function playerToDb(p: Player, teamId: string) {
  return {
    id: p.id,
    team_id: teamId,
    name: p.name,
    positions: p.positions,
    stick_side: p.stickSide,
    jersey_number: p.jerseyNumber,
    status: p.status,
    notes: p.notes,
    focus_flag: p.focusFlag,
  };
}

function playerUpdatesToDb(u: Partial<Player>) {
  const r: any = {};
  if (u.name !== undefined) r.name = u.name;
  if (u.positions !== undefined) r.positions = u.positions;
  if (u.stickSide !== undefined) r.stick_side = u.stickSide;
  if (u.jerseyNumber !== undefined) r.jersey_number = u.jerseyNumber;
  if (u.status !== undefined) r.status = u.status;
  if (u.notes !== undefined) r.notes = u.notes;
  if (u.focusFlag !== undefined) r.focus_flag = u.focusFlag;
  return r;
}

function dbToTraining(row: any): TrainingSession {
  return {
    id: row.id,
    date: row.date,
    theme: row.theme,
    duration: row.duration,
    playerIds: row.player_ids ?? [],
    sections: row.sections ?? [],
  };
}

function trainingToDb(s: TrainingSession, teamId: string) {
  return {
    id: s.id,
    team_id: teamId,
    date: s.date,
    theme: s.theme,
    duration: s.duration,
    player_ids: s.playerIds,
    sections: s.sections as any,
  };
}

function trainingUpdatesToDb(u: Partial<TrainingSession>) {
  const r: any = {};
  if (u.date !== undefined) r.date = u.date;
  if (u.theme !== undefined) r.theme = u.theme;
  if (u.duration !== undefined) r.duration = u.duration;
  if (u.playerIds !== undefined) r.player_ids = u.playerIds;
  if (u.sections !== undefined) r.sections = u.sections;
  return r;
}

function dbToDrill(row: any): Drill {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    categories: row.categories ?? [],
    videoUrl: row.video_url,
    linkedLayoutIds: row.linked_layout_ids ?? [],
    mediaFiles: row.media_files ?? [],
  };
}

function drillToDb(d: Drill, teamId: string) {
  return {
    id: d.id,
    team_id: teamId,
    name: d.name,
    description: d.description,
    categories: d.categories,
    video_url: d.videoUrl,
    linked_layout_ids: d.linkedLayoutIds,
    media_files: d.mediaFiles as any,
  };
}

function drillUpdatesToDb(u: Partial<Drill>) {
  const r: any = {};
  if (u.name !== undefined) r.name = u.name;
  if (u.description !== undefined) r.description = u.description;
  if (u.categories !== undefined) r.categories = u.categories;
  if (u.videoUrl !== undefined) r.video_url = u.videoUrl;
  if (u.linkedLayoutIds !== undefined) r.linked_layout_ids = u.linkedLayoutIds;
  if (u.mediaFiles !== undefined) r.media_files = u.mediaFiles;
  return r;
}

function dbToPlay(row: any): Play {
  return {
    id: row.id,
    name: row.name,
    category: row.category ?? 'System',
    diagramUrl: row.diagram_url,
    keyPoints: row.key_points ?? [],
    videoUrl: row.video_url,
    tags: row.tags ?? [],
    linkedLayoutIds: row.linked_layout_ids ?? [],
    mediaFiles: row.media_files ?? [],
  };
}

function playToDb(p: Play, teamId: string) {
  return {
    id: p.id,
    team_id: teamId,
    name: p.name,
    category: p.category,
    diagram_url: p.diagramUrl,
    key_points: p.keyPoints,
    video_url: p.videoUrl,
    tags: p.tags,
    linked_layout_ids: p.linkedLayoutIds,
    media_files: p.mediaFiles as any,
  };
}

function playUpdatesToDb(u: Partial<Play>) {
  const r: any = {};
  if (u.name !== undefined) r.name = u.name;
  if (u.category !== undefined) r.category = u.category;
  if (u.diagramUrl !== undefined) r.diagram_url = u.diagramUrl;
  if (u.keyPoints !== undefined) r.key_points = u.keyPoints;
  if (u.videoUrl !== undefined) r.video_url = u.videoUrl;
  if (u.tags !== undefined) r.tags = u.tags;
  if (u.linkedLayoutIds !== undefined) r.linked_layout_ids = u.linkedLayoutIds;
  if (u.mediaFiles !== undefined) r.media_files = u.mediaFiles;
  return r;
}

function dbToIDP(row: any): IndividualDevelopmentPlan {
  return {
    id: row.id,
    playerId: row.player_id,
    goal: row.goal,
    startDate: row.start_date,
    endDate: row.end_date,
    focusAreas: row.focus_areas ?? [],
    shortTermGoals: row.short_term_goals ?? [],
    coachNotes: row.coach_notes ?? '',
    completed: row.completed ?? false,
    lastUpdated: row.last_updated ?? '',
  };
}

function idpToDb(i: IndividualDevelopmentPlan, teamId: string) {
  return {
    id: i.id,
    team_id: teamId,
    player_id: i.playerId,
    goal: i.goal,
    start_date: i.startDate,
    end_date: i.endDate,
    focus_areas: i.focusAreas,
    short_term_goals: i.shortTermGoals,
    coach_notes: i.coachNotes,
    completed: i.completed,
    last_updated: i.lastUpdated,
  };
}

function idpUpdatesToDb(u: Partial<IndividualDevelopmentPlan>) {
  const r: any = {};
  if (u.playerId !== undefined) r.player_id = u.playerId;
  if (u.goal !== undefined) r.goal = u.goal;
  if (u.startDate !== undefined) r.start_date = u.startDate;
  if (u.endDate !== undefined) r.end_date = u.endDate;
  if (u.focusAreas !== undefined) r.focus_areas = u.focusAreas;
  if (u.shortTermGoals !== undefined) r.short_term_goals = u.shortTermGoals;
  if (u.coachNotes !== undefined) r.coach_notes = u.coachNotes;
  if (u.completed !== undefined) r.completed = u.completed;
  if (u.lastUpdated !== undefined) r.last_updated = u.lastUpdated;
  return r;
}

function dbToTestResult(row: any): TestResult {
  return {
    id: row.id,
    playerId: row.player_id,
    testType: row.test_type as 'Fitness' | 'Skill',
    testName: row.test_name,
    date: row.date,
    result: row.result,
    previousResult: row.previous_result,
    trend: row.trend as 'up' | 'down' | 'same',
  };
}

function testResultToDb(t: TestResult, teamId: string) {
  return {
    id: t.id,
    team_id: teamId,
    player_id: t.playerId,
    test_type: t.testType,
    test_name: t.testName,
    date: t.date,
    result: t.result,
    previous_result: t.previousResult,
    trend: t.trend,
  };
}

function testResultUpdatesToDb(u: Partial<TestResult>) {
  const r: any = {};
  if (u.playerId !== undefined) r.player_id = u.playerId;
  if (u.testType !== undefined) r.test_type = u.testType;
  if (u.testName !== undefined) r.test_name = u.testName;
  if (u.date !== undefined) r.date = u.date;
  if (u.result !== undefined) r.result = u.result;
  if (u.previousResult !== undefined) r.previous_result = u.previousResult;
  if (u.trend !== undefined) r.trend = u.trend;
  return r;
}
