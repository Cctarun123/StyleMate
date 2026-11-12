import { useEffect, useRef, useState } from 'react';

export type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE;
const SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR;

/** The drop lands on the 23rd of next month at 18:00. */
export function getNextDropTarget(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 23, 18, 0, 0);
}

/** Pure time-difference calculation — easy to unit test deterministically. */
export function calculateTimeRemaining(target: Date, now: Date): Countdown {
  const totalSeconds = Math.max(0, Math.floor((target.getTime() - now.getTime()) / MS_PER_SECOND));
  const days = Math.floor(totalSeconds / SECONDS_PER_DAY);
  const hours = Math.floor((totalSeconds % SECONDS_PER_DAY) / SECONDS_PER_HOUR);
  const minutes = Math.floor((totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;
  return { days, hours, minutes, seconds };
}

/** Live countdown that ticks every second and clears its interval on unmount. */
export function useCountdown(): Countdown {
  const [countdown, setCountdown] = useState<Countdown>(() =>
    calculateTimeRemaining(getNextDropTarget(), new Date())
  );
  const targetRef = useRef(getNextDropTarget());

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(() => calculateTimeRemaining(targetRef.current, new Date()));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return countdown;
}
