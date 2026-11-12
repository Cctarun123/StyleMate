import { Clothing, Gender, TemperatureBand } from '../types';

const BAND_RANGES: Record<TemperatureBand, { min: number; max: number }> = {
  'below-10': { min: -Infinity, max: 9 },
  '10-15': { min: 10, max: 14 },
  '15-20': { min: 15, max: 19 },
  '20-26': { min: 20, max: 25 },
  '26-32': { min: 26, max: 32 },
  'above-32': { min: 33, max: Infinity },
};

export function getTempBand(temp: number): TemperatureBand {
  for (const [band, range] of Object.entries(BAND_RANGES)) {
    if (temp >= range.min && temp <= range.max) {
      return band as TemperatureBand;
    }
  }
  return temp <= 9 ? 'below-10' : 'above-32';
}

interface GetPicksOptions {
  rain?: boolean;
  gender?: Gender;
  limit?: number;
}

function inRange(temp: number, min: number, max: number): boolean {
  return temp >= min && temp <= max;
}

export function getPicks(
  clothes: Clothing[],
  temp: number,
  { rain, gender, limit }: GetPicksOptions = {},
): Clothing[] {
  let candidates = clothes.filter((item) => inRange(temp, item.minTemp, item.maxTemp));

  if (gender) {
    candidates = candidates.filter((item) => item.gender === gender || item.gender === 'unisex');
  }

  if (candidates.length < 6) {
    const widened = clothes.filter((item) => inRange(temp, item.minTemp - 3, item.maxTemp + 3));
    const widenedGender = gender
      ? widened.filter((item) => item.gender === gender || item.gender === 'unisex')
      : widened;
    if (widenedGender.length > candidates.length) {
      candidates = widenedGender;
    }
  }

  const middle = (item: Clothing) => (item.minTemp + item.maxTemp) / 2;

  const rainOk = candidates.filter((item) => item.rainOk).sort((a, b) => Math.abs(temp - middle(a)) - Math.abs(temp - middle(b)));
  const rest = candidates.filter((item) => !item.rainOk).sort((a, b) => Math.abs(temp - middle(a)) - Math.abs(temp - middle(b)));

  const sorted = rain ? [...rainOk, ...rest] : [...rest, ...rainOk];

  if (limit != null) {
    return sorted.slice(0, limit);
  }
  return sorted;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
}
