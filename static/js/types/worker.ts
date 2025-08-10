import { TokenInfo as Token } from '@derivation-tech/context';
import type { BigNumber } from 'ethers';

import { Amm, Instrument } from '@synfutures/sdks-perp';
import type { IAccountRecords } from './account';
import { IInstrumentRecord, IMarketPair } from './pair';
import { ISpotState } from './spot';

export enum WorkerEventNames {
  NativeBalanceEvent = 'NativeBalanceEvent',
  BalanceEvent = 'BalanceEvent',
  ApprovalEvent = 'ApprovalEvent',
  MulticallTokensAllowance = 'MulticallTokensAllowance',
  MulticallBalance = 'MulticallBalance',
  FetchPair = 'FetchPair',
  BatchPairs = 'BatchPairs',
  FetchPortfolio = 'FetchPortfolio',
  FetchPortfolioList = 'FetchPortfolioList',
  FetchGateBalance = 'FetchGateBalance',
  CallFuturesList = 'CallFuturesList',
  CallGateBalance = 'CallGateBalance',
  WatchGateEvent = 'GateBalanceEvent',
  UpdateFuturesEvent = 'UpdateFuturesEvent',
  InstrumentUpdateEvent = 'InstrumentUpdateEvent',
  RemoveAllInstrumentEventListener = 'RemoveAllEventListener',
  RemoveAllGateEventListener = 'RemoveAllGateEventListener',
  OnInstrumentOrderUpdateEvent = 'OnInstrumentOrderUpdateEvent',
  FetchInstrumentSpotState = 'FetchInstrumentSpotState',
  PollingFetchInstrument = 'PollingFetchInstrument',
  UpdateSpotStateEvent = 'UpdateSpotStateEvent',
  UpdateRawSpotPriceEvent = 'UpdateRawSpotPriceEvent',
  UpdatePortfolioEvent = 'UpdatePortfolioEvent',
  UpdateGateBalanceEvent = 'UpdateGateBalanceEvent',
  UpdateTokenAllowanceEvent = 'UpdateTokenAllowanceEvent',
  RemoveAllSocketEventListener = 'RemoveAllSocketEventListener',
  UpdateMarketPairInfoEvent = 'UpdateMarketPairInfoEvent',
  DispatchInstrumentUpdateEvent = 'DispatchInstrumentUpdateEvent',
  DispatchPortfolioUpdateEvent = 'DispatchPortfolioUpdateEvent',
  DispatchGateUpdateEvent = 'DispatchGateUpdateEvent',
}

export type BlockyResult<T> = {
  block: number;
  data: T;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WorkerEvent = { eventName: WorkerEventNames; data: any };

export type WorkerResultBase = {
  chainId: number;
  userAddr: string;
  block: number;
};

export type WorkerBalanceEventResult = WorkerResultBase & {
  balanceInfo: {
    balance: BigNumber;
    block: number;
  };
  token: Token;
};

export type WorkerMulticallBalanceResult = WorkerResultBase & {
  balanceInfos: {
    token: Token;
    balance: BigNumber;
    block: number;
  }[];
};

export type WorkerAllowanceResult = WorkerResultBase & {
  allowanceInfo: {
    spender: string;
    allowance: BigNumber;
  };
  token: Token;
};

export type WorkerPairResult = Omit<WorkerResultBase, 'userAddr'> & {
  pairInfo: {
    pair: Amm;
  };
};

export type WorkerPairListResult = Omit<WorkerResultBase, 'userAddr'> & {
  pairList: Amm[];
};

export type WorkerFuturesListResult = Omit<WorkerResultBase, 'userAddr'> & {
  futuresMap: Record<string, Instrument>;
};

export type WorkerGateBalanceResult = WorkerResultBase & {
  gateBalance: BigNumber;
  token: Token;
};

export type WorkerFuturesResult = Omit<WorkerResultBase, 'userAddr'> & {
  futures: Instrument;
  pairList: Amm[];
  futuresRecord: IInstrumentRecord;
};

export type WorkerPortfolioResult = WorkerResultBase & {
  reducedPortfolio: IAccountRecords;
  instrumentAddr: string;
  expiry: number;
};

export type WorkerOnInstrumentOrderUpdateResult = WorkerResultBase & {
  eventName: string;
  instrumentAddr: string;
  expiry: number;
  transactionHash: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  eventArgs: any;
};

export type WorkerInstrumentSpotStateMapResult = Omit<WorkerResultBase, 'userAddr'> & {
  instrumentSpotStateMap: { [instrumentAddr: string]: BlockyResult<ISpotState> }; // instrument address => spot state
};

export type WorkerInstrumentSpotRawPriceMapResult = Omit<WorkerResultBase, 'userAddr'> & {
  instrumentSpotRawPriceMap: { [instrumentAddr: string]: BlockyResult<BigNumber> }; // instrument address => spot raw price
};

export type WorkerMarketPairInfoResult = Omit<WorkerResultBase, 'userAddr' | 'block'> & {
  pairInfo: IMarketPair;
};

export type WorkerDispatchInstrumentEventResult = Omit<WorkerResultBase, 'userAddr' | 'block'> & {
  eventName: string;
  instrumentAddr: string;
  expiry?: number;
  transactionHash: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  eventArgs: any;
  trader?: string;
};

export type WorkerDispatchPortfolioEventResult = Omit<WorkerResultBase, 'userAddr' | 'block'> & {
  eventName: string;
  instrumentAddr: string;
  expiry?: number;
  transactionHash: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  eventArgs: any;
  trader?: string;
};

export type WorkerDispatchGateEventResult = WorkerResultBase & {
  eventName: string;
  transactionHash: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  eventArgs: any;
};
