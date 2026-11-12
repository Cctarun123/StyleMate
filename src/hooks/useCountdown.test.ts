/// <reference types="jest" />

import { calculateTimeRemaining, getNextDropTarget } from './useCountdown';

describe('calculateTimeRemaining', () => {
  it('computes days, hours, minutes and seconds for a future target', () => {
    const now = new Date(2026, 0, 1, 12, 0, 0, 0);
    const target = new Date(2026, 1, 23, 18, 0, 0, 0);
    expect(calculateTimeRemaining(target, now)).toEqual({
      days: 53,
      hours: 6,
      minutes: 0,
      seconds: 0,
    });
  });

  it('clamps to zero when the target is in the past', () => {
    const now = new Date(2026, 2, 1, 0, 0, 0, 0);
    const target = new Date(2026, 1, 23, 18, 0, 0, 0);
    expect(calculateTimeRemaining(target, now)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });

  it('truncates sub-second remainders to whole seconds', () => {
    const now = new Date(2026, 0, 1, 0, 0, 0, 500);
    const target = new Date(2026, 0, 1, 0, 0, 5, 0);
    expect(calculateTimeRemaining(target, now)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 4,
    });
  });
});

describe('getNextDropTarget', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 10, 5, 10, 30, 0, 0));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns the 23rd of next month at 18:00', () => {
    const target = getNextDropTarget();
    expect(target.getFullYear()).toBe(2026);
    expect(target.getMonth()).toBe(11);
    expect(target.getDate()).toBe(23);
    expect(target.getHours()).toBe(18);
    expect(target.getMinutes()).toBe(0);
    expect(target.getSeconds()).toBe(0);
  });

  it('rolls into the next year from December', () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 11, 30, 12, 0, 0, 0));
    const target = getNextDropTarget();
    expect(target.getFullYear()).toBe(2027);
    expect(target.getMonth()).toBe(0);
    expect(target.getDate()).toBe(23);
    expect(target.getHours()).toBe(18);
  });
});
