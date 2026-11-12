/// <reference types="jest" />

import { getNextDropTarget, getTimeLeft } from './useCountdown';

describe('getTimeLeft', () => {
  it('computes days, hours, minutes and seconds for a future target', () => {
    const now = new Date(Date.UTC(2026, 0, 1, 12, 0, 0));
    const target = new Date(Date.UTC(2026, 1, 23, 18, 0, 0));
    expect(getTimeLeft(now, target)).toEqual({
      days: 53,
      hours: 6,
      minutes: 0,
      seconds: 0,
    });
  });

  it('clamps to zero when the target is in the past', () => {
    const now = new Date(Date.UTC(2026, 2, 1, 0, 0, 0));
    const target = new Date(Date.UTC(2026, 1, 23, 18, 0, 0));
    expect(getTimeLeft(now, target)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });

  it('truncates sub-second remainders to whole seconds', () => {
    const now = new Date(Date.UTC(2026, 0, 1, 0, 0, 0, 500));
    const target = new Date(Date.UTC(2026, 0, 1, 0, 0, 5, 0));
    expect(getTimeLeft(now, target)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 4,
    });
  });

  it('returns zeros when now equals target', () => {
    const now = new Date(Date.UTC(2026, 1, 23, 18, 0, 0));
    const target = new Date(Date.UTC(2026, 1, 23, 18, 0, 0));
    expect(getTimeLeft(now, target)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });
});

describe('getNextDropTarget', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(Date.UTC(2026, 10, 5, 10, 30, 0)));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns the 23rd of the current month at 18:00 UTC when not yet passed', () => {
    const target = getNextDropTarget();
    expect(target.getUTCFullYear()).toBe(2026);
    expect(target.getUTCMonth()).toBe(10);
    expect(target.getUTCDate()).toBe(23);
    expect(target.getUTCHours()).toBe(18);
    expect(target.getUTCMinutes()).toBe(0);
    expect(target.getUTCSeconds()).toBe(0);
  });

  it('rolls into the next year from December', () => {
    jest.useFakeTimers().setSystemTime(new Date(Date.UTC(2026, 11, 30, 12, 0, 0)));
    const target = getNextDropTarget();
    expect(target.getUTCFullYear()).toBe(2027);
    expect(target.getUTCMonth()).toBe(0);
    expect(target.getUTCDate()).toBe(23);
    expect(target.getUTCHours()).toBe(18);
  });

  it('rolls to next month when the 23rd has already passed', () => {
    jest.useFakeTimers().setSystemTime(new Date(Date.UTC(2026, 10, 24, 12, 0, 0)));
    const target = getNextDropTarget();
    expect(target.getUTCFullYear()).toBe(2026);
    expect(target.getUTCMonth()).toBe(11);
    expect(target.getUTCDate()).toBe(23);
  });
});
