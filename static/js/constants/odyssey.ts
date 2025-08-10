import { CHAIN_ID } from './chain';

export enum MYSTERY_STAGES {
  INIT = 'init',
  OPEN = 'open',
  CLAIM = 'claim',
}
export enum EARN_POINTS_TYPE {
  BOX = 1,
  SPIN = 2,
}
export enum ODYSSEY_LEADERBOARD_TYPES {
  POINTS = 'points',
  TOKENS = 'tokens',
}

export const TWITTER_SHARE_LINK = 'https://twitter.com/intent/tweet?text=';
export const ODYSSEY_SHARED_ON_TWITTER = 'odyssey_shared_on_twitter';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getOdysseyApiPrefix = (chainId: CHAIN_ID, url: string) =>
  `/v3/${CHAIN_ID.BASE === chainId ? 'base/' : ''}odyssey/${
    // process.env.REACT_APP_ODYSSEY_ENV?.trim() ?? 'prod'
    'prod'
  }${url}`;
export const ODYSSEY_POLLING_INTERVAL = 5 * 1000 * 60;
export const ODYSSEY_POINTS_INTERVAL = 10 * 1000;

export const LAST_EPOCH_LINK = 'https://synfutures.medium.com/oyster-odyssey-o-o-official-rules-2e591eacfde0';
