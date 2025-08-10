export interface IChainLiquidityState {
  isOperating?: boolean;
  inputAmountStr: string;
  shareRatio: number;
  chainId: number;
  pairId?: string;
}

export interface ILiquidityFilters {
  // TODO: use BigNumber to save number
  searchString?: string;
  filterMargins?: string;
  sorter?: LIQUIDITY_SORTER;
  chainId: number;
  searchStr?: string;
}

export enum LIQUIDITY_DIRECTION {
  ADD = 'ADD',
  REMOVE = 'REMOVE',
}
export enum LIQUIDITY_SORTER {
  APY = 'APY',
  VOLUME = 'VOLUME',
  TVL = 'TVL',
}

export const getDefaultLiquiditySate = (chainId: number): IChainLiquidityState => ({
  isOperating: false,
  inputAmountStr: '',
  shareRatio: 0,
  chainId,
});
