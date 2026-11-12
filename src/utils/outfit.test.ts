import { getTempBand, getPicks } from './outfit';
import { CLOTHES } from '../data/clothes';
import { TemperatureBand } from '../types';

describe('getTempBand', () => {
  it.each([
    [9, 'below-10' as TemperatureBand],
    [10, '10-15' as TemperatureBand],
    [15, '15-20' as TemperatureBand],
    [20, '20-26' as TemperatureBand],
    [26, '26-32' as TemperatureBand],
    [32, '26-32' as TemperatureBand],
    [33, 'above-32' as TemperatureBand],
  ])('at %i°C returns %s', (temp: number, expected: TemperatureBand) => {
    expect(getTempBand(temp)).toBe(expected);
  });
});

describe('getPicks', () => {
  it('returns only items valid for the temp', () => {
    const picks = getPicks(CLOTHES, 23);
    expect(picks.length).toBeGreaterThan(0);
    for (const p of picks) {
      expect(p.minTemp).toBeLessThanOrEqual(23);
      expect(p.maxTemp).toBeGreaterThanOrEqual(23);
    }
  });

  it('puts rain items first when rain is true', () => {
    const picks = getPicks(CLOTHES, 20, { rain: true });
    let seenNonRain = false;
    for (const p of picks) {
      if (!p.rainOk) seenNonRain = true;
      expect(!p.rainOk || !seenNonRain).toBe(true);
    }
  });

  it('every band has at least 5 items', () => {
    const reps: [TemperatureBand, number][] = [
      ['below-10', 5],
      ['10-15', 12],
      ['15-20', 17],
      ['20-26', 23],
      ['26-32', 29],
      ['above-32', 35],
    ];
    for (const [, temp] of reps) {
      const count = CLOTHES.filter((p) => p.minTemp <= temp && p.maxTemp >= temp).length;
      expect(count).toBeGreaterThanOrEqual(5);
    }
  });

  it('returns at least 4 picks for every integer temp 0-40', () => {
    for (let t = 0; t <= 40; t++) {
      expect(getPicks(CLOTHES, t).length).toBeGreaterThanOrEqual(4);
    }
  });
});
