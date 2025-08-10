import '@/utils/log';

import spindl from '@spindl-xyz/attribution';
import { notification } from 'antd';
import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import { enableMapSet } from 'immer';
import VConsole from 'vconsole';

import { registerWorkers } from '@/worker/factory';

import { isMobile } from 'react-device-detect';
import { initReactGA } from './utils/analytics';
import { initSentry } from './utils/sentry';
enableMapSet();

initSentry();
initReactGA();

registerWorkers();

notification.config({
  duration: 9,
  placement: 'topRight',
  top: 70,
});

// bigNumber decimal config
BigNumber.config({ DECIMAL_PLACES: 18 });

dayjs.extend(utc);
dayjs.extend(duration);
dayjs.extend(relativeTime);

if (process.env.REACT_APP_APP_ENABLE_VCONSOLE === 'true' && isMobile) {
  new VConsole();
}

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

BigInt.prototype.toJSON = function () {
  return this.toString();
};

if (process.env.REACT_APP_SPINDL_KEY) {
  spindl.configure({
    sdkKey: process.env.REACT_APP_SPINDL_KEY || '',
    debugMode: false, // we recommend only to have debugMode=true when testing.
    // you will see console.logs of emitted events in browser
  });

  spindl.enableAutoPageViews();
}
