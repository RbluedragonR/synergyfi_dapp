import { CHAIN_ID } from './chain';

export enum TGP_SEASON {
  FIRST = 1,
  SECOND = 2,
}
export enum TGP_TYPE {
  MASTER = 'master',
  OPEN_1 = 's1',
  OPEN_2 = 's2',
}
export const TGP_PAGE_SIZE = 10;
export const TGP_MASTER_PAGE_SIZE = 50;
export enum TGP_LUCK_STATUS {
  NOT_STARTED = 'not_started',
  ON_GOING = 'on_going',
  ENDED = 'ended',
}
export enum TGP_LUCK_USER_STATUS {
  INIT = 1,
  SHARED = 2,
  CONFIRMED = 3,
  JOINED = 4,
  DISCORD_CONFIRMED = 5,
}

export const getTgpApiPrefix = (url: string, chainId?: number): string =>
  `/v3/${CHAIN_ID.BASE === chainId ? 'base/' : ''}odyssey/prod${url}`;

export const TGP_POLLING_INTERVAL = 1000 * 30;
export const TGP_WAIT_TIME = 1000 * 5;
export const TGP_POLLING_INTERVAL_LONG = 1000 * 60 * 60 * 20;
