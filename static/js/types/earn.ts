import { CHAIN_ID } from '@derivation-tech/context';
import { BigNumber } from 'ethers';

import { DEFAULT_ALPHA } from '@/constants/earn';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { WrappedPosition } from '@/entities/WrappedPosition';
import {
  Position,
  SimulateAddLiquidityResult,
  SimulateImpermenantLossParams,
  SimulateRemoveLiquidityResult,
} from '@synfutures/sdks-perp';

export interface IAddLiquiditySimulation {
  chainId: CHAIN_ID;
  data?: IAddLiquiditySimulationData;
  message?: string;
  errorData?: string;
}
export interface IAddLiquiditySimulationData extends SimulateAddLiquidityResult {
  equivalentAlpha: BigNumber;
  equivalentAlphaUpper: number;
  equivalentAlphaLower: number;
  tickDelta: number;
  tickDeltaUpper: number;
  tickDeltaLower: number;
  // upperPrice: WrappedBigNumber;
  // lowerPrice: WrappedBigNumber;
  lowerPosition: Position;
  // lowerLeverage: WrappedBigNumber;
  upperPosition: Position;
  // upperLeverage: WrappedBigNumber;
  // sqrtStrikeLowerPX96: BigNumber;
  // sqrtStrikeUpperPX96: BigNumber;
  marginToDeposit: WrappedBigNumber;
  margin: WrappedBigNumber;
  // minMargin: WrappedBigNumber;

  lowerLiqPrice: WrappedBigNumber;
  upperLiqPrice: WrappedBigNumber;
  // minEffectiveQuoteAmount: WrappedBigNumber;
}
export interface IRemoveLiquiditySimulation {
  chainId: CHAIN_ID;
  data?: IRemoveLiquiditySimulationData;
  message?: string;
  errorData?: string;
}
export interface IRemoveLiquiditySimulationData extends SimulateRemoveLiquidityResult {
  simulationMainPosition: WrappedPosition;
  simulatePositionRemoved: Position;
  // sqrtStrikeLowerPX96: BigNumber;
  // sqrtStrikeUpperPX96: BigNumber;
  margin?: WrappedBigNumber; // only size = 0 & balance >0 has margin
}

export interface IAddLiquidityFormState {
  chainId: CHAIN_ID;
  amount: string;
  alpha: number;
  asymmetric: boolean;
  lowerUpperTicks?: number[];
}
export interface IRemoveLiquidityFormState {
  chainId: CHAIN_ID;
  id: string;
}

export const getDefaultAddLiquidityFormState = (chainId: CHAIN_ID): IAddLiquidityFormState => ({
  chainId,
  amount: '',
  alpha: DEFAULT_ALPHA,
  asymmetric: false,
});
export type ILDataParams = SimulateImpermenantLossParams & { symbol: string; isInverse: boolean };
