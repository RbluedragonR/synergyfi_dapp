import { CHAIN_ID } from '@derivation-tech/context';

import { WorkerEvent, WorkerEventNames } from '@/types/worker';
import { bigNumberObjectCheck } from '@/utils';

export function emitWorkerEvent<T>(eventName: WorkerEventNames, data: T): void {
  self && self.postMessage({ eventName, data });
}

export function requestFromWorker<T>({
  worker,
  eventName,
  requestParams,
}: {
  worker: Worker;
  eventName: WorkerEventNames;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  requestParams: any;
}): Promise<T> {
  return new Promise((resolve) => {
    worker.postMessage({
      eventName: eventName,
      data: requestParams,
    });
    worker.addEventListener('message', (e) => {
      const event = e.data as WorkerEvent;
      if (event.eventName === eventName) {
        resolve(parsingWorkerData(event.data) as T);
      }
    });
  });
}

// check BigNumber object
export function parsingWorkerData<T>(data: T): T {
  return bigNumberObjectCheck(data);
}

export const getWatchWorkerEventCallback = <T>(
  e: MessageEvent,
  worker: Worker,
  eventName: WorkerEventNames,
  callback: (data: T) => void,
  deps?: { chainId?: CHAIN_ID; userAddr?: string },
) => {
  const event = e.data as WorkerEvent;
  if (event.eventName === eventName) {
    // check for right result from worker event
    if (deps) {
      if (deps.chainId && event.data.chainId && deps.chainId !== event.data.chainId) return;
      if (deps.userAddr && event.data.userAddr && deps.userAddr !== event.data.userAddr) return;
    }
    console.record('event', `Trigger [Worker] [${eventName}] event listener`, event.data);

    callback(parsingWorkerData(event.data));
    //
  }
};

export function watchWorkerEvent<T>(
  worker: Worker,
  eventName: WorkerEventNames,
  callback: (data: T) => void,
  deps?: { chainId?: CHAIN_ID; userAddr?: string },
): void {
  worker.addEventListener('message', (e) => {
    const event = e.data as WorkerEvent;
    if (event.eventName === eventName) {
      // check for right result from worker event
      if (deps) {
        if (deps.chainId && event.data.chainId && deps.chainId !== event.data.chainId) return;
        if (deps.userAddr && event.data.userAddr && deps.userAddr !== event.data.userAddr) return;
      }
      console.record('event', `Trigger [Worker] [${eventName}] event listener`, event.data);

      callback(parsingWorkerData(event.data));
      //
    }
  });
}
