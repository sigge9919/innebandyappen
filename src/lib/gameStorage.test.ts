import { describe, it, expect } from 'vitest';
import {
  calculateTeamStats,
  calculatePeriodStats,
  calculateLineStats,
  calculateSpecialTeamsStats,
  calculatePlayerStatsFromEvents,
} from './gameStorage';
import { GameEvent, GameLine, PenaltyEvent } from '@/types/game';

function makeEvent(overrides: Partial<GameEvent>): GameEvent {
  return {
    id: crypto.randomUUID(),
    gameId: 'game-1',
    type: 'shot_on_goal',
    team: 'home',
    period: '1',
    situation: '5v5',
    timestamp: Date.now(),
    ...overrides,
  };
}

function makePenalty(overrides: Partial<PenaltyEvent>): PenaltyEvent {
  return {
    id: crypto.randomUUID(),
    gameId: 'game-1',
    team: 'home',
    period: '1',
    duration: 2,
    timestamp: Date.now(),
    ...overrides,
  };
}

describe('calculateTeamStats', () => {
  it('counts goals as shots on goal in addition to explicit shots on goal', () => {
    const events = [
      makeEvent({ type: 'goal', team: 'home' }),
      makeEvent({ type: 'shot_on_goal', team: 'home' }),
      makeEvent({ type: 'shot_off_goal', team: 'home' }),
      makeEvent({ type: 'shot_blocked', team: 'home' }),
    ];
    const stats = calculateTeamStats(events, 'home');
    expect(stats).toEqual({ shotsOnGoal: 2, shotsOffGoal: 1, shotsBlocked: 1, goals: 1 });
  });

  it('ignores events from the other team', () => {
    const events = [makeEvent({ type: 'goal', team: 'opponent' })];
    expect(calculateTeamStats(events, 'home').goals).toBe(0);
  });

  it('filters by period and situation when provided', () => {
    const events = [
      makeEvent({ type: 'goal', team: 'home', period: '1', situation: '5v5' }),
      makeEvent({ type: 'goal', team: 'home', period: '2', situation: '5v5' }),
      makeEvent({ type: 'goal', team: 'home', period: '1', situation: '5v4' }),
    ];
    expect(calculateTeamStats(events, 'home', '1').goals).toBe(2);
    expect(calculateTeamStats(events, 'home', '1', '5v5').goals).toBe(1);
  });

  it('excludes penalty events from shot/goal counts', () => {
    const events = [makeEvent({ type: 'penalty', team: 'home' })];
    const stats = calculateTeamStats(events, 'home');
    expect(stats).toEqual({ shotsOnGoal: 0, shotsOffGoal: 0, shotsBlocked: 0, goals: 0 });
  });
});

describe('calculatePeriodStats', () => {
  it('only includes periods with recorded activity', () => {
    const events = [
      makeEvent({ type: 'goal', team: 'home', period: '1' }),
      makeEvent({ type: 'shot_on_goal', team: 'opponent', period: '3' }),
    ];
    const periods = calculatePeriodStats(events);
    expect(periods.map(p => p.period)).toEqual(['1', '3']);
  });

  it('returns an empty list when nothing happened', () => {
    expect(calculatePeriodStats([])).toEqual([]);
  });
});

describe('calculateLineStats', () => {
  const lines: GameLine[] = [
    { id: 'line-1', name: 'Line 1', type: '5v5', playerIds: [] },
    { id: 'line-2', name: 'Line 2', type: '5v5', playerIds: [] },
  ];

  it('computes plus/minus per line from goals scored while that line was on', () => {
    const events = [
      makeEvent({ type: 'goal', team: 'home', lineId: 'line-1' }),
      makeEvent({ type: 'goal', team: 'home', lineId: 'line-1' }),
      makeEvent({ type: 'goal', team: 'opponent', lineId: 'line-1' }),
    ];
    const stats = calculateLineStats(events, lines);
    expect(stats).toEqual([
      { lineId: 'line-1', lineName: 'Line 1', goalsFor: 2, goalsAgainst: 1, plusMinus: 1 },
    ]);
  });

  it('omits lines with no recorded goals either way', () => {
    expect(calculateLineStats([], lines)).toEqual([]);
  });
});

describe('calculateSpecialTeamsStats', () => {
  it('attributes power-play opportunities to opponent penalties and box-play to our own', () => {
    const events = [
      makeEvent({ type: 'goal', team: 'home', situation: '5v4' }),
      makeEvent({ type: 'goal', team: 'opponent', situation: '4v5' }),
    ];
    const penalties = [
      makePenalty({ team: 'opponent' }), // gives us a power play
      makePenalty({ team: 'home' }), // puts us on the box play (penalty kill)
      makePenalty({ team: 'home' }),
    ];
    const { powerPlay, boxPlay } = calculateSpecialTeamsStats(events, penalties, 'home');

    expect(powerPlay.opportunities).toBe(1);
    expect(powerPlay.goalsFor).toBe(1);
    expect(boxPlay.opportunities).toBe(2);
    expect(boxPlay.goalsAgainst).toBe(1);
  });
});

describe('calculatePlayerStatsFromEvents', () => {
  const lines: GameLine[] = [{ id: 'line-1', name: 'Line 1', type: '5v5', playerIds: ['p1', 'p2'] }];

  it('credits the scorer and assisters for a goal', () => {
    const events = [
      makeEvent({ type: 'goal', team: 'home', playerId: 'p1', assistPlayerIds: ['p2'] }),
    ];
    const stats = calculatePlayerStatsFromEvents(events, [], lines, ['p1', 'p2']);
    const p1 = stats.find(s => s.playerId === 'p1')!;
    const p2 = stats.find(s => s.playerId === 'p2')!;
    expect(p1.goals).toBe(1);
    expect(p2.assists).toBe(1);
  });

  it('tracks penalty minutes for the penalized player only', () => {
    const stats = calculatePlayerStatsFromEvents(
      [],
      [makePenalty({ team: 'home', playerId: 'p1', duration: 2 })],
      lines,
      ['p1', 'p2']
    );
    expect(stats.find(s => s.playerId === 'p1')!.penaltyMinutes).toBe(2);
    expect(stats.find(s => s.playerId === 'p2')!.penaltyMinutes).toBe(0);
  });

  it('applies 5v5 plus/minus to the on-ice snapshot when present, falling back to the line roster', () => {
    const withSnapshot = calculatePlayerStatsFromEvents(
      [makeEvent({ type: 'goal', team: 'home', situation: '5v5', lineId: 'line-1', onIcePlayerIds: ['p1'] })],
      [],
      lines,
      ['p1', 'p2']
    );
    expect(withSnapshot.find(s => s.playerId === 'p1')!.plusMinus5v5).toBe(1);
    expect(withSnapshot.find(s => s.playerId === 'p2')!.plusMinus5v5).toBe(0);

    const withoutSnapshot = calculatePlayerStatsFromEvents(
      [makeEvent({ type: 'goal', team: 'opponent', situation: '5v5', lineId: 'line-1' })],
      [],
      lines,
      ['p1', 'p2']
    );
    expect(withoutSnapshot.find(s => s.playerId === 'p1')!.plusMinus5v5).toBe(-1);
    expect(withoutSnapshot.find(s => s.playerId === 'p2')!.plusMinus5v5).toBe(-1);
  });

  it('ignores goals outside 5v5 for plus/minus purposes', () => {
    const stats = calculatePlayerStatsFromEvents(
      [makeEvent({ type: 'goal', team: 'home', situation: '5v4', lineId: 'line-1', onIcePlayerIds: ['p1'] })],
      [],
      lines,
      ['p1']
    );
    expect(stats.find(s => s.playerId === 'p1')!.plusMinus5v5).toBe(0);
  });
});
