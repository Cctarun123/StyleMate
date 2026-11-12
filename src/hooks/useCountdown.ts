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

/** The drop lands on the 23rd of the month at 18:00 UTC. If already passed
 *  this month, roll to the next month. */
export function getNextDropTarget(): Date {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  let target = new Date(Date.UTC(year, month, 23, 18, 0, 0));
  if (target.getTime() <= now.getTime()) {
    target = new Date(Date.UTC(year, month + 1, 23, 18, 0, 0));
  }
  return target;
}

/** Pure time-difference calculation — easy to unit test deterministically. */
export function getTimeLeft(now: Date, target: Date): Countdown {
  const totalSeconds = Math.max(0, Math.floor((target.getTime() - now.getTime()) / MS_PER_SECOND));
  const days = Math.floor(totalSeconds / SECONDS_PER_DAY);
  const hours = Math.floor((totalSeconds % SECONDS_PER_DAY) / SECONDS_PER_HOUR);
  const minutes = Math.floor((totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;
  return { days, hours, minutes, seconds };
}

/** Live countdown that ticks every second and clears its interval on unmount. */
export function useCountdown(): Countdown {
  const targetRef = useRef(getNextDropTarget());
  const [countdown, setCountdown] = useState<Countdown>(() =>
    getTimeLeft(new Date(), targetRef.current)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        const next = getTimeLeft(new Date(), targetRef.current);
        // Only trigger a re-render when something actually changed.
        if (
          prev.days === next.days &&
          prev.hours === next.hours &&
          prev.minutes === next.minutes &&
          prev.seconds === next.seconds
        ) {
          return prev;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return countdown;
}
