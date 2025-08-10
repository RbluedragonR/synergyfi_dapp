export interface IRetryOptions {
  n: number;
  minWait: number;
  maxWait: number;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitRandom(min: number, max: number): Promise<void> {
  return wait(min + Math.round(Math.random() * Math.max(0, max - min)));
}

export type RetryError = {
  code: number;
  message: string;
};
export type ShouldTryFn = (error: RetryError) => boolean;
/**
 * This error is thrown if the function is cancelled before completing
 */
export class CancelledError extends Error {
  public isCancelledError: true = true as const;
  constructor() {
    super('Cancelled');
  }
}

/**
 * Throw this error if the function should retry
 */
export class RetryableError extends Error {
  code!: number;
  public isRetryableError: true = true as const;
}

export const shouldRetryFunction = (err: RetryError): boolean => {
  return [-32015].includes(err?.code) || err.message.indexOf('-32005') > -1 || err.message.includes('header not found');
};

/**
 * Retries the function that returns the promise until the promise successfully resolves up to n retries
 * @param fn function to retry
 * @param n how many times to retry
 * @param minWait min wait between retries in ms
 * @param maxWait max wait between retries in ms
 * @param shouldRetryFn, if presents, determines whether fn should be retried
 */
export function retry<T>(
  fn: Promise<T>,
  { n, minWait, maxWait }: IRetryOptions,
  shouldRetryFn?: ShouldTryFn,
): { promise: Promise<T>; cancel: () => void } {
  let completed = false;
  let rejectCancelled: (error: Error) => void;
  const promise = new Promise<T>(async (resolve, reject) => {
    rejectCancelled = reject;
    while (true) {
      let result: T;
      try {
        result = await fn;
        if (!completed) {
          resolve(result);
          completed = true;
        }
        break;
      } catch (error) {
        const err = error as RetryableError;

        if (completed) {
          break;
        }
        n--;
        // Stop trying if one of the conditions meets
        // 1: Tried 3 times already
        // 2: When there is shouldTryFun and the shouldTryFun returns false
        if (n <= 0 || !err.isRetryableError || (shouldRetryFn && !shouldRetryFn(err))) {
          reject(error);
          completed = true;
          break;
        }
      }
      await waitRandom(minWait, maxWait);
    }
  });
  return {
    promise,
    cancel: () => {
      if (completed) return;
      completed = true;
      rejectCancelled(new CancelledError());
    },
  };
}

export function retryWeb3<T>(
  fn: Promise<T>,
  shouldTryFn: ShouldTryFn = shouldRetryFunction,
): { promise: Promise<T>; cancel: () => void } {
  return retry(
    fn,
    {
      n: 3,
      minWait: 100,
      maxWait: 500,
    },
    shouldTryFn,
  );
}

export function retryWeb3Promise<T>(fn: Promise<T>, shouldTryFn?: ShouldTryFn): Promise<T> {
  return retryWeb3(fn, shouldTryFn).promise;
}

export function retryGeneralPromise<T>(fn: Promise<T>, times = 3): Promise<T> {
  return retry(fn, {
    n: times,
    minWait: 300,
    maxWait: 1000,
  }).promise;
}

export function retryWhenTimeout<T>(fn: Promise<T>, timeout = 5000, retry = 3): Promise<T> {
  const timer = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new RetryableError('Time out'));
    }, timeout);
  });

  return retryGeneralPromise(Promise.race([fn, timer]) as Promise<T>, retry);
}
