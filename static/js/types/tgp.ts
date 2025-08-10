export enum TGP_WEEKS {
  WEEK1 = 'week1',
  WEEK2 = 'week2',
  WEEK3 = 'week3',
  WEEK4 = 'week4',
  WEEK5 = 'week5',
  WEEK6 = 'week6',
  WEEK7 = 'week7',
  WEEK8 = 'week8',
}
export interface ITradingWeek {
  week: number;
  startTs: string;
  endTs: string;
}
export interface ITGPTrader {
  username: string;
  profileImgUrl: string;
  userId?: string;
  ticket: string;
}
export interface ITGPLuckyDrawWinners {
  week: number;
  winners: ITGPTrader[];
}

export interface IMasterWeek {
  scores: number;
  PnL: number;
}
export interface ITGPDashboardMasterRanking extends ITGPMaster {
  totalScores: number;
  prize: number;
  week1: IMasterWeek | undefined;
  week2: IMasterWeek | undefined;
  week3: IMasterWeek | undefined;
  week4: IMasterWeek | undefined;
  week5: IMasterWeek | undefined;
  week6: IMasterWeek | undefined;
  week7: IMasterWeek | undefined;
  week8: IMasterWeek | undefined;
}

export interface ITGPDashboardBase {
  page: number;
  totals: number;
  totalParticipants: number;
  totalUsers: number;
  updateAt: string;
}
export interface ITGPMaster {
  userId: string;
  username: string;
  twitterUsername: string;
  profileImgUrl: string;
}
export interface ITGPMasterLeaderBoard extends ITGPDashboardBase {
  list: ITGPDashboardMasterRanking[];
}
export interface IOpenWeek {
  userId: string;
  profileImgUrl: string;
  PnL?: number;
  volume?: number;
}
export interface ITGPDashboardOpenRanking {
  prize: number;
  week1: IOpenWeek | undefined;
  week2: IOpenWeek | undefined;
  week3: IOpenWeek | undefined;
  week4: IOpenWeek | undefined;
  week5: IOpenWeek | undefined;
  week6: IOpenWeek | undefined;
  week7: IOpenWeek | undefined;
  week8: IOpenWeek | undefined;
}
export interface ITGPOpenLeaderBoard extends ITGPDashboardBase {
  list: ITGPDashboardOpenRanking[];
}

export interface ITGPWeekConfig {
  rank: {
    claimMaster: string;
    claimOpen: string;
  };
  luckyDraw: {
    claim: string;
    shareToGetTicket: string;
  };
}

export interface ITGPDappConfig {
  isShowComingSoon: boolean;
  isShowSeasonTwoComingSoon: boolean;
  isShowSeasonOneComingSoon: boolean;
  tnc: string;
  currentSeason: number;
  openDocsLink: string;
  masterDocsLink: string;
  twitter: {
    // client_ids: string[];
    callbackUrl: string;
    scope: string;
    code_challenge: string;
    code_challenge_method: string;
  };
  trade: {
    defaultPair: string;
    supportPairs: string[];
    defaultChainId: number;
    isShowTrade: boolean;
  };
  updateInterval: number;
  prize: string;
  telegramGroup: string;
  weeks: ITradingWeek[];
  defaultWeek: number;
  masterToken: string;
  prizeCurrency: string;
  sign: {
    agreement: {
      open: string;
      master: string;
    };
  };
  twitterShare: {
    currentWeek: {
      luckyDraw: {
        shareToGetTicket: string;
      };
    };

    [TGP_WEEKS.WEEK1]: ITGPWeekConfig;
    [TGP_WEEKS.WEEK2]: ITGPWeekConfig;
    [TGP_WEEKS.WEEK3]: ITGPWeekConfig;
    [TGP_WEEKS.WEEK4]: ITGPWeekConfig;
  };
}

export interface ITGPBannerScore {
  week: number;
  rank?: number;
  score?: number;
  pnl?: number;
  volume?: undefined;
  prize?: number;
  claimed?: boolean;
}

export interface ITGPSignature {
  nonce: number;
  address: string;
  signature?: string;
  // jwtToken?: string;
}

export enum TGP_USER_STATUS {
  DEFAULT = 0,
  TWITTER_CONNECTED = 1,
  DISCORD_CONNECTED = 2,
  EMAIL_CONNECTED = 3,
}

export enum TGP_LUCK_DRAW_USER_STATUS {
  NOT_OPEN = 0,
  OPEN_LOSER = 1,
  OPEN_WINNER = 2,
  CLAIMED = 3,
  NOT_JOINED = 4,
}

export interface IUserLuckyDrawUserState {
  week: number;
  ticket: string;
  prize: number;
  status: TGP_LUCK_DRAW_USER_STATUS;
}

export type WeekWithLuckyDrawState = ITradingWeek & IUserLuckyDrawUserState;

export interface ITGPUserOpenRank {
  claimed: boolean;
  rank: number;
  PnL: number;
  volume?: number;
  prize: number;
}

export interface ITGPUserMasterRank {
  rank: number;
  PnL: number;
  scores: number;
}

export interface ITGPUser {
  userId: string;
  status: TGP_USER_STATUS;
  luckyDraws: IUserLuckyDrawUserState[];
  rankings: {
    open: { [week in TGP_WEEKS]?: ITGPUserOpenRank };
    master: {
      claimed: boolean;
      rank: number;
      totalScores: number;
      prize: number;
      [TGP_WEEKS.WEEK1]?: ITGPUserMasterRank;
      [TGP_WEEKS.WEEK2]?: ITGPUserMasterRank;
      [TGP_WEEKS.WEEK3]?: ITGPUserMasterRank;
      [TGP_WEEKS.WEEK4]?: ITGPUserMasterRank;
    };
  };
}
export interface ITGPStat {
  totalUsers: string;
  tvl: string;
  last24hVolume: string;
  totalBlastGoldDistributed: string;
  totalBlastPointsDistributed: string;
}

export interface IUserCheck {
  isMaster: boolean;
  isRegistered: boolean;
}
