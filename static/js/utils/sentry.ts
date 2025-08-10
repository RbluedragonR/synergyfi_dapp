import * as Sentry from '@sentry/react';
import { deviceType, isMobile } from 'react-device-detect';

export function initSentry(environment?: string): void {
  if (process.env.NODE_ENV !== 'development' && process.env.REACT_APP_AWS_ENV !== 'dev') {
    Sentry.init({
      dsn: 'https://84530055c61db7706210ac305ab9d9c4@o4508755617382400.ingest.us.sentry.io/4508755622100992',
      // integrations: [Sentry.replayIntegration()],
      // // Session Replay
      // replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
      // replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
      release: '1.0',
      // We recommend adjusting this value in production, or using tracesSampler
      // for finer control
      tracesSampleRate: 1.0,
      environment,
      defaultIntegrations: false,
    });

    Sentry.setContext('env', {
      NODE_ENV: process?.env?.NODE_ENV,
      PUBLIC_URL: process?.env?.PUBLIC_URL,
      PUBLISH_TIME: process?.env?.PUBLISH_TIME,
      REACT_APP_API_ENV: process?.env?.REACT_APP_API_ENV,
      REACT_APP_APP_DOMAIN: process?.env?.REACT_APP_APP_DOMAIN,
      REACT_APP_AWS_ENV: process?.env?.REACT_APP_AWS_ENV,
      REACT_APP_CHAIN_ID: process?.env?.REACT_APP_CHAIN_ID,
      SITE_VERSION: process?.env?.SITE_VERSION,
    });

    const deviceInfo = {
      userAgent: navigator?.userAgent,
      platform: navigator?.platform,
      language: navigator?.language,
      screenResolution: `${window?.screen?.width}x${window?.screen?.height}`,
      isMobile,
      deviceType,
      href: window?.location?.href,
    };

    Sentry.setContext('device', deviceInfo);

    if (window?.ethereum) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ethereum = window.ethereum as any;

      Sentry.setContext('ethereum', {
        isMetaMask: ethereum?.isMetaMask,
        isRabby: ethereum?.isRabby,
        isTrust: ethereum?.isTrust,
        chainId: ethereum?.chainId,
      });
    }
  }
}

export {};
