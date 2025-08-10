export function getSynWorker(): Worker {
  return new Worker(new URL('@/worker/SynWorker.ts', import.meta.url));
}

export function getUserWorker(): Worker {
  return new Worker(new URL('@/worker/UserWorker.ts', import.meta.url));
}

export function registerWorkers(): void {
  try {
    window.userWorker = getUserWorker();
    window.synWorker = getSynWorker();
  } catch (error) {
    console.error('registerWorkers error:', error);
  }
}
