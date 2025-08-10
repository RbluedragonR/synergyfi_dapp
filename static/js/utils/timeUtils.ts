import { PERP_EXPIRY } from '@synfutures/sdks-perp';
import moment from 'moment';

import { PERP } from '@/constants';
import { KlineInterval } from '@synfutures/sdks-perp-datasource';

export function currentUTCTime(): number {
  return moment.utc().valueOf();
}

export function currentUnixTime(): number {
  return moment.utc().unix();
}

export function currentUTCExpiryTime(): number {
  const utcNow = moment.utc();
  let expiryTime = utcNow.hour(8).minute(0).second(0).millisecond(0);
  if (utcNow.hour() >= 8) {
    expiryTime = expiryTime.day(utcNow.day() + 1);
  }

  return expiryTime.valueOf();
}

export function formatDate(timestamps: number, formatter = 'MM-DD HH:mm:ss'): string {
  return moment(timestamps).format(formatter);
}

export function showProperDateString({
  expiry,
  format,
  showShortPerp,
}: {
  expiry: number;
  format: string;
  showShortPerp?: boolean;
}): string {
  if (expiry === PERP_EXPIRY) {
    return showShortPerp ? 'PERP' : PERP;
  }
  return formatDate(expiry * 1000, format);
}

export function getKlineTimeDuration(chartDuration: KlineInterval): number {
  switch (chartDuration) {
    case KlineInterval.DAY:
      return 24 * 60 * 60;
      break;
    case KlineInterval.WEEK:
      return 7 * 24 * 60 * 60;
      break;
    case KlineInterval.HOUR:
      return 60 * 60;
      break;
    case KlineInterval.THIRTY_MINUTE:
      return 30 * 60;
      break;
    case KlineInterval.FIFTEEN_MINUTE:
      return 15 * 60;
      break;
    case KlineInterval.FIVE_MINUTE:
      return 5 * 60;
      break;
    case KlineInterval.MINUTE:
      return 60;

    default:
      break;
  }
  return 0;
}
