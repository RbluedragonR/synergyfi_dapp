import { BigNumber } from 'ethers';

import { OdysseyRewardId } from '@/configs/odysseyReward';

export enum ODYSSEY_TABS {
  // REWARDS = 'rewards',
  EARN_POINTS = 'earn_points',
  LEADER_BOARD = 'leader_board',
}
export enum USER_STATUS {
  DEFAULT = 0,
  TWITTER_CONNECTED = 1,
  DISCORD_CONNECTED = 2,
  EMAIL_CONNECTED = 3,
  FIRST_BOX_OPENED = 4,
  EXTRA_POINTS_CLAIMED = 5,
}
export interface IUserProfile {
  twitter: {
    id: string;
    username: string;
    profileImgUrl: string;
  };
  isKol: boolean;
  twitterId: string;
  profileImgUrl: string;
  inviterUsername?: string;
  username: string;
  referralCode: string;
  createdTime: number;
  status: USER_STATUS;
}

export interface IOdysseySignature {
  nonce: number;
  inviteCode?: string;
  address: string;
  signature?: string;
  jwtToken?: string;
}

export interface IOdysseySignatureStorage {
  [userAddr: string]: IOdysseySignature;
}

export enum ODYSSEY_STEP {
  INIT,
  CONNECTED_WALLET,
  LINKED_TWITTER,
  FOLLOWED_DISCORD,
  FILLED_EMAIL,
  DONE,
}

export interface IOdysseyRenzoPointsQuoteConfig {
  symbol: string;
  ezPoints?: number;
  eigenLayerPoints?: number;
}

export interface IOdysseyChainConfig {
  earnOoPointPairs?: { pairSymbol: string; boost: number }[];
  earnBlastPointQuotes: string[];
  defaultPair: string;
  showLiquidityPoints: boolean;
  showTradePoints: boolean;
  showEarnBanner: boolean;
  nonBlastAndOoPointReward?: {
    [id in OdysseyRewardId]?: {
      quotes: {
        symbol: string;
        multiplier: number;
      }[];
    };
  };
  lastEpoch?: number;
  showLastEpochPointsModal?: boolean;
  twitter: {
    // client_ids: string[];
    callbackUrl: string;
    scope: string;
    code_challenge: string;
    kol: string[];
    open: string[];
    code_challenge_method: string;
    claimPointsTwitter: string;
  };
}

export interface IOdysseyDappConfig {
  docsLink: string;
  earnPoints: {
    updateInterval: number; // in minutes
    earnLink: string;
    trade: {
      defaultPair: string;
      defaultChainId: number; // no pair will redirect to this chain
    };
    extraPointsRatio: number;
    spinDistributionIntervalType: 0 | 1 | 2; // 0: every hour, 1: every day, 2: every week;
  };
  squadConfig: {
    level1: {
      tvl: number;
      boost: number;
    };
    level2: {
      tvl: number;
      boost: number;
    };
  };
  supportChains: number[];
  chainConfig: {
    [chainId: string]: IOdysseyChainConfig;
  };
  sign: {
    agreement: string;
  };
  showOOTokenComingSoon: boolean;
}

export interface ISquadMember {
  username: string;
  profileImgUrl: string;
  contributedPoints: number;
  contributedTVL: number;
}
export interface IOdysseyDashboard {
  epoch: number;
  points: number;
  boost: number;
  spins: number;
  boxes: number;
  luck: number;
  estimatedPointsPerDay: number;
  referralBoost: number;
  referralBoostExpiry: number;
  estimatedSpinsPerWeek: number;
  nextSpinChance: number;
  squadTVL: number;
  squadCount: number;
  squadMembers: ISquadMember[];
  squadVolume: number;
  volumePoints: number;
  volumePointsUpdatedAt: number;
}

export interface IRanking {
  rank: number;
  username: string;
  profileImgUrl: string;
  inviterUsername: string;
  points: number;
  tokens?: number;
  tokenHistory: { [epoch: number]: number };
}
export interface ITokenRanking {
  rank: number;
  username: string;
  profileImgUrl: string;
  inviterUsername: string;
  amount: number;
  tokenHistory: { [epoch: number]: number };
}

export interface ILeaderBoard {
  tvl: number;
  users: number;
  epoch: number;
  rankings: IRanking[];
  page: number;
  totals: number;
  tokenRankings: IRanking[];
}
export interface ITokenLeaderBoard {
  ranking: ITokenRanking[];
}

export interface IUserPoints {
  blastPoints: number;
  blastGold: number;
  odysseyPoints: number;
  ooToken: number;
}
export interface ITokenProof {
  epoch: number;
  index: number;
  amount: string;
  proof: string[];
}
export interface IEpoch {
  epoch: number;
  startTs: number;
  endTs: number;
}
export interface IEpochDetail {
  epoch: number;
  lastRunAt: string;
  points: number;
  rank: number;
  squadVolume: number;
  userId: string;
  volumePoints: string;
}
export interface IRecentJoin {
  username: string;
  inviterUsername: string | null;
  profileImgUrl: string;
  timestamp: number;
}

export interface IResponse<T> {
  code: number;
  msg: string;
  data: T;
}

export enum CAMPAIGN_TYPE {
  TGP = 'tgp',
  ODYSSEY = 'odyssey',
}

export interface ISpinResult {
  points: number;
  superSpins: number;
}

export interface IInfoOverview {
  '7dActiveUsers': number;
  totalTradingVolume: number;
  totalTransactions: number;
  totalUsers: number;
  tvl: number;
  updateAt: number;
}

export interface InstrumentPointConfigParam {
  isStable: boolean;
  quotePriceWad: BigNumber;
  poolFactorMap: Map<number, number>;
}
