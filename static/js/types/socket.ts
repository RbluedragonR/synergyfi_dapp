export enum SUBSCRIBE_TYPE {
  MARKET = 'sub_market',
  VAULT = 'sub_vault',
  EVENT = 'sub_event',
  PAIR_INFO = 'sub_pair_info',
  PORTFOLIO = 'sub_portfolio',
}

export enum UNSUBSCRIBE_TYPE {
  MARKET = 'un_sub_market',
  VAULT = 'un_sub_vault',
  EVENT = 'un_sub_event',
  PAIR_INFO = 'un_sub_pair_info',
  PORTFOLIO = 'un_sub_portfolio',
}

export enum MESSAGE_TYPE {
  //default
  sdkConfigChanged = 'sdkConfigChanged',
  dappConfigChanged = 'dappConfigChanged',
  blockNumberChanged = 'blockNumberChanged',
  //MARKET
  marketListChanged = 'marketListChanged',
  vaultChanged = 'vaultChanged',
  marketFeaturePairsUpdated = 'marketFeaturePairsUpdated',
  //EVENT with chainId
  perpEvent = 'perpEvent',
  //pair info with chainId+address
  pairInfo = 'pairInfo',
  //PORTFOLIO
  portfolio = 'portfolio',
}

export interface ISocketBlockInfo {
  chainId: number;
  blockNum: number;
  blockTime: number;
}

export type ISocketPerpEventResult = {
  chainId: number;
  event: ISocketPerpEvent[];
};

export interface ISocketPerpEvent {
  chainId: number;
  txHash: string;
  txIndex: number;
  logIndex: number;
  contractAddress: string;
  contractType: 'instrument' | 'gate';
  eventName: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  eventArgs: any;
  blockNum?: number;
}

export interface ISocketPortfolioEvent {
  chainId: number;
  userAddr: string;
  instrumentAddr: string;
  expiry: number;
}
