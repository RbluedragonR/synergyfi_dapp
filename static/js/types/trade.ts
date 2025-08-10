import { CHAIN_ID } from '@derivation-tech/context';
import { BatchOrderSizeDistribution, Side } from '@synfutures/sdks-perp';
import { BigNumber } from 'ethers';

import { FETCHING_STATUS } from '@/constants';
import { TRADE_LEVERAGE_THRESHOLDS } from '@/constants/global';
import { LEVERAGE_ADJUST_TYPE } from '@/constants/trade';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { WrappedPair } from '@/entities/WrappedPair';
import { WrappedPosition } from '@/entities/WrappedPosition';
import { ByBase, ByQuote, SimulateLimitOrderResult, SimulateTradeResult } from '@synfutures/sdks-perp';
export enum MarginAdjustMethod {
  Leverage = 'MarginAdjustMethod_Leverage',
  Amount = 'MarginAdjustMethod_Amount',
}

export type AdjustMarginByLeverageState = {
  leverageInput: string | null;
  isLeverageInputChanged: boolean;
  errMsg: JSX.Element | null;
};
interface IFormStateBase {
  chainId: CHAIN_ID;
}

export interface IOrderCancelStatus {
  [orderId: string]: FETCHING_STATUS;
}
export interface ISimulation {
  chainId?: number;
  data?: ISimulationData;
  positionData?: IPositionSimulationData;
  message?: string;
  errorData?: string;
}
export interface ISimulationData {
  origin: SimulateTradeResult;
  limitTick: number;
  tradePrice: WrappedBigNumber;
  estimatedTradeValue: WrappedBigNumber;
  tradingFee: WrappedBigNumber;
  margin: WrappedBigNumber;
  realized: WrappedBigNumber;
  leverage: WrappedBigNumber;
  minTradeValue: WrappedBigNumber;
  simulationMainPosition: WrappedPosition;
  limitPrice: WrappedBigNumber;
  priceChangeRate: WrappedBigNumber;
  marginToDeposit: WrappedBigNumber;
  additionalFee: WrappedBigNumber;
  exceedMaxLeverage: boolean;
}
export interface IPositionSimulationData {
  feeWad: BigNumber;
  marginWad: BigNumber;
  marginToDepositWad: BigNumber;
  leverageWad: BigNumber;
  liqPriceWad: BigNumber;
  pnlWad: BigNumber;
  avgPriceWad: BigNumber;
}
export interface IOrderSimulation {
  data?: IOrderSimulationData;
  message?: string;
  errorData?: string;
}
export interface IOrderSimulationData {
  origin: SimulateLimitOrderResult;
  size: ByBase & ByQuote;
  baseSize: BigNumber;
  // balance: BigNumber;
  tickNumber: number;
  leverage: BigNumber;
  minOrderValue: BigNumber;
  limitPrice: WrappedBigNumber;
  margin: WrappedBigNumber;
  marginToDeposit: WrappedBigNumber;
  minFeeRebate: WrappedBigNumber;
  estimatedTradeValue: WrappedBigNumber;
}

export interface IMarketFormState extends IFormStateBase {
  tradeSide: Side;
  baseAmount: string;
  quoteAmount?: string;
  marginAmount?: string;
  leverageAdjustType?: LEVERAGE_ADJUST_TYPE;
  // tradePrice?: string;
  // positionRatio?: number; // TODO: remove this?
  // marginAmount?: string;
  leverage?: string;
}

export interface ILimitFormState extends IFormStateBase {
  tradeSide: Side;
  baseAmount: string;
  quoteAmount?: string;
  limitPrice?: string;
  leverage?: string;
  alignedPrice?: string;
  isTurnOnCrossMarket?: boolean;
  // marginAmount?: string;
}

export interface IAdjustMarginFormState extends IFormStateBase {
  transferIn?: boolean;
  amount: string;
  leverage?: string;
  marginToDeposit?: string;
}

export interface IAdjustMarginSimulation {
  chainId: number;
  data?: IAdjustMarginSimulationData;
  message?: string;
}

export interface IAdjustMarginSimulationData {
  transferAmount: BigNumber;
  simulationMainPosition: WrappedPosition;
  marginToDepositWad: BigNumber;
  leverageWad: BigNumber;
}

export interface IClosePositionFormState extends IFormStateBase {
  amount: string;
}
export interface IPnlParams {
  averagePrice: WrappedBigNumber;
  pnl: WrappedBigNumber;
  pnlRatio: WrappedBigNumber;
  tradePrice: WrappedBigNumber;
  pair: WrappedPair;
  leverage: WrappedBigNumber;
  chainId: number;
  side: string;
  tx: string;
  size: WrappedBigNumber;
}

export interface ICancelFormState extends IFormStateBase {
  chainId: number;
  userAddr: string;
  ids: string[];
}

export const getDefaultMarketFormState = (chainId: CHAIN_ID, tradeSide?: Side): IMarketFormState => ({
  chainId,
  baseAmount: '',
  leverage: TRADE_LEVERAGE_THRESHOLDS.DEFAULT.toString(),
  tradeSide: tradeSide || Side.LONG,
});

export const getDefaultLimitFormState = (chainId: CHAIN_ID, tradeSide?: Side): ILimitFormState => ({
  chainId,
  baseAmount: '',
  tradeSide: tradeSide || Side.LONG,
  isTurnOnCrossMarket: false,
});
export const getDefaultScaleLimitFormState = (chainId: CHAIN_ID, tradeSide?: Side): ILimitFormState => ({
  chainId,
  baseAmount: '',
  tradeSide: tradeSide || Side.LONG,
});
export const getDefaultCloseFormState = (chainId: CHAIN_ID): IClosePositionFormState => ({
  chainId,
  amount: '',
});
export const getDefaultSimulation = (chainId: number): ISimulation => ({
  chainId,
});

export interface IScaleFormState extends IFormStateBase {
  tradeSide: Side;
  leverage?: string;
  lowerPrice: string;
  alignedLowerPrice: string;
  lowerTick: number;
  upperPrice: string;
  alignedUpperPrice: string;
  upperTick: number;
  baseAmount: string;
  quoteAmount?: string;
  stepRatio: number;
  orderCount: number;
  sizeDistribution: BatchOrderSizeDistribution;
}
export interface IScaledOrderSimulation {
  data?: IScaledOrderSimulationData;
  message?: string;
  errorData?: string;
}
export type ISimulationOrder = SimulateLimitOrderResult & {
  ratio: number;
  minOrderSize: BigNumber;
};
export interface IScaledOrderSimulationData {
  baseSize: BigNumber;
  // balance: BigNumber;
  lowerTick: number;
  upperTick: number;
  lowerPrice: string;
  upperPrice: string;
  leverageWad: BigNumber;
  orders: ISimulationOrder[];
  margin: WrappedBigNumber;
  sizeDistribution: BatchOrderSizeDistribution; // enum from sdk
  minOrderValue: WrappedBigNumber;
  marginToDeposit: WrappedBigNumber;
  minFeeRebate: BigNumber;
  totalMinSize: BigNumber;
  estimatedTradeValue: WrappedBigNumber;
}

export interface ICrossMarketOrderData {
  canPlaceOrder: boolean; // if user can place order, user size = trade size + order size
  tradeSize: WrappedBigNumber; // trade size. if user size < trade size + order size, user can't place order, return min trade size
  orderSize: WrappedBigNumber; // order size. if user size < trade size + order size, user can't place order, return min order size
  tradeSimulation: ISimulationData;
  orderSimulation: IOrderSimulationData;
  tickNumber: number;
  marginToDeposit: WrappedBigNumber;
  margin: WrappedBigNumber;
  totalMinSize: WrappedBigNumber;
}

export interface ICrossMarketOrderSimulation {
  data?: ICrossMarketOrderData;
  message?: string;
  errorData?: string;
}
