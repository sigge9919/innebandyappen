import { describe, it, expect } from 'vitest';
import { getIDPStatus, getIDPStatusVariant, isIDPActive } from './idpUtils';
import { IndividualDevelopmentPlan } from '@/types';

function makeIDP(overrides: Partial<IndividualDevelopmentPlan>): IndividualDevelopmentPlan {
  return {
    id: 'idp-1',
    playerId: 'p1',
    goal: 'Improve shot accuracy',
    startDate: '2026-01-01',
    endDate: '2026-06-01',
    focusAreas: [],
    shortTermGoals: [],
    coachNotes: '',
    lastUpdated: '2026-01-01',
    ...overrides,
  };
}

describe('getIDPStatus', () => {
  it('is Slutförd when marked completed, regardless of dates', () => {
    const idp = makeIDP({ completed: true, endDate: '2020-01-01' });
    expect(getIDPStatus(idp)).toBe('Slutförd');
  });

  it('is Aktiv when there is no end date', () => {
    const idp = makeIDP({ endDate: '' });
    expect(getIDPStatus(idp)).toBe('Aktiv');
  });

  it('is Försenad once the end date has passed and it is not completed', () => {
    const idp = makeIDP({ endDate: '2000-01-01' });
    expect(getIDPStatus(idp)).toBe('Försenad');
  });

  it('is Aktiv while the end date is still in the future', () => {
    const idp = makeIDP({ endDate: '2999-01-01' });
    expect(getIDPStatus(idp)).toBe('Aktiv');
  });
});

describe('getIDPStatusVariant', () => {
  it('maps each status to its badge variant', () => {
    expect(getIDPStatusVariant('Aktiv')).toBe('default');
    expect(getIDPStatusVariant('Slutförd')).toBe('secondary');
    expect(getIDPStatusVariant('Försenad')).toBe('destructive');
  });
});

describe('isIDPActive', () => {
  it('is true for anything other than Slutförd', () => {
    expect(isIDPActive(makeIDP({ endDate: '2999-01-01' }))).toBe(true);
    expect(isIDPActive(makeIDP({ endDate: '2000-01-01' }))).toBe(true);
  });

  it('is false once completed', () => {
    expect(isIDPActive(makeIDP({ completed: true }))).toBe(false);
  });
});
