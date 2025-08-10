import { useEffect, useRef } from 'react';

/** Source: https://github.com/austintgriffith/eth-hooks/blob/master/src/Poller.ts */

export const usePoller = (
  fn: () => void,
  // eslint-disable-next-line
  deps: any[] = [],
  interval = 5000,
  delayAtFirstTime: number | null = null,
): void => {
  const savedCallback = useRef<() => void>();
  // Remember the latest fn.
  useEffect((): void => {
    savedCallback.current = () => {
      // add fn required online
      if (navigator.onLine) {
        fn();
      }
    };
  }, [fn]);

  // Set up the interval.
  useEffect((): void | (() => void) => {
    function tick() {
      if (savedCallback.current) savedCallback.current();
    }
    if (interval !== null) {
      const id = setInterval(tick, interval);
      return () => clearInterval(id);
    }
    // eslint-disable-next-line
  }, [interval, ...deps]);

  // run at start too
  useEffect(() => {
    // add fn required online
    if (navigator.onLine) {
      if (delayAtFirstTime) {
        const timeoutId = setTimeout(() => {
          fn();
        }, delayAtFirstTime);
        return () => clearTimeout(timeoutId);
      } else {
        fn();
      }
    }
    // eslint-disable-next-line
  }, [...deps]);
};
