export interface ITokenPrice {
  high24h: number;
  low24h: number;
  current: number;
  priceChangePercentage24h: number;
  chainId: number;
  address: string;
  symbol: string;
  lastUpdated: number;
  decimals: number;
}

export type ITokenPriceMap = {
  [tokenAddress in string]: ITokenPrice;
};
export enum PollingHistoryId {
  trade = 'trade',
  order = 'order',
  liquidity = 'liquidity',
  transfer = 'transfer',
}
