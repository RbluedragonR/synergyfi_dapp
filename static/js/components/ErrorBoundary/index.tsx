import { NetworkErrorSvg } from '@/assets/svg/icons/error';
import SentryService from '@/entities/SentryService';
import { Flex } from 'antd';
import React, { ErrorInfo, PropsWithChildren } from 'react';
import ReactGA from 'react-ga';
import './index.less';
type ErrorBoundaryState = {
  error: Error | null;
};

async function updateServiceWorker(): Promise<ServiceWorkerRegistration> {
  const ready = await navigator.serviceWorker.ready;
  // the return type of update is incorrectly typed as Promise<void>. See
  // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/update
  return ready.update() as unknown as Promise<ServiceWorkerRegistration>;
}

export default class ErrorBoundary extends React.Component<PropsWithChildren<unknown>, ErrorBoundaryState> {
  constructor(props: PropsWithChildren<unknown>) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    updateServiceWorker()
      .then(async (registration) => {
        // We want to refresh only if we detect a new service worker is waiting to be activated.
        // See details about it: https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle
        if (registration?.waiting) {
          await registration.unregister();

          // Makes Workbox call skipWaiting(). For more info on skipWaiting see: https://developer.chrome.com/docs/workbox/handling-service-worker-updates/
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });

          // Once the service worker is unregistered, we can reload the page to let
          // the browser download a fresh copy of our app (invalidating the cache)
          window.location.reload();
        }
      })
      .catch((error) => {
        console.error('Failed to update service worker', error);
        SentryService.captureException(error, { name: 'ErrorBoundary:getDerivedStateFromError' });
      });
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary:componentDidCatch', error, errorInfo);
    ReactGA.exception({
      description: error.toString() + errorInfo.toString(),
      fatal: true,
    });
    SentryService.captureException(error, { name: 'ErrorBoundary:componentDidCatch', errorInfo });
  }

  render(): string | number | boolean | JSX.Element | React.ReactFragment | null | undefined {
    const { error } = this.state;
    if (error !== null) {
      return (
        <Flex vertical justify="center" className="syn-network-error-wrap">
          <Flex className="syn-network-error" gap={24} vertical align="center">
            <NetworkErrorSvg />
            <Flex gap={8} vertical align="center">
              <span className="sentence1">Network Anomaly</span>
              <span className="sentence2">Something went wrong, please refresh the page.</span>
              {error && <span className="sentence2">Error Detail: {error?.message}</span>}
            </Flex>
          </Flex>
        </Flex>
      );
    }
    return this.props.children;
  }
}
