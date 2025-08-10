import _ from 'lodash';

import { DynamicLeverage, TRADE_LEVERAGE_THRESHOLDS } from '@/constants/global';
import { WrappedBigNumber, WrappedBigNumberLike } from '@/entities/WrappedBigNumber';
import BN from 'bignumber.js';
import { toBN } from './numberUtil';

import { WrappedPortfolio } from '@/entities/WrappedPortfolio';
import { WrappedPosition } from '@/entities/WrappedPosition';
import { Context } from '@derivation-tech/context';
import { Side, sqrt, sqrtX96ToWad, utils, wdiv, wmul } from '@synfutures/sdks-perp';
import { BigNumber } from 'ethers';
import { formatEther } from 'ethers/lib/utils';
import { getAdjustTradePrice } from './pairs';

export function perToTenThousands(value: number): number {
  return Math.round(value * 100);
}

export function addedDeadline(deadline: number): number {
  return Math.round(
    Number(
      WrappedBigNumber.from(_.now())
        .div(1000)
        .add(deadline * 60).stringValue,
    ),
  );
}

export function getLimitedLeverage(tradeSide: Side, leverage?: string, size?: WrappedBigNumber): string | undefined {
  if (!leverage) {
    return leverage;
  }

  return size &&
    ((size.gte(0) && tradeSide === Side.LONG) || (size.lte(0) && tradeSide === Side.SHORT)) &&
    Number(leverage) > TRADE_LEVERAGE_THRESHOLDS.ACTUAL_MAX
    ? TRADE_LEVERAGE_THRESHOLDS.ACTUAL_MAX.toString()
    : leverage;
}

export function isLeverageOk(leverage: string | undefined): boolean {
  if (leverage === DynamicLeverage) {
    return true;
  }
  const leverageBN = toBN(leverage || '');
  return leverageBN.gte(TRADE_LEVERAGE_THRESHOLDS.MIN) && leverageBN.lte(TRADE_LEVERAGE_THRESHOLDS.MAX);
}

export function isUsePlaceCrossMarketOrder(
  fairPrice: WrappedBigNumber,
  limitPrice: WrappedBigNumber,
  size: Side,
  isTurnOnCrossMarket: boolean,
): boolean {
  if (!isTurnOnCrossMarket) {
    return false;
  }
  if (size === Side.LONG) {
    return limitPrice.gt(fairPrice);
  }
  return limitPrice.lt(fairPrice);
}

export function getPnl(
  tradePrice: WrappedBigNumber,
  averagePrice: WrappedBigNumber,
  tradeSize: number | string,
): WrappedBigNumber {
  return tradePrice.min(averagePrice).mul(tradeSize);
}

export const getMinMaxLeverageInAdjustMargin = ({
  sdkContext,
  portfolio,
  availableBalance,
  position,
}: {
  chainId: number;
  portfolio: WrappedPortfolio | undefined;
  sdkContext: Context | undefined;
  availableBalance: BigNumber | undefined;
  position: WrappedPosition | undefined;
}) => {
  const ans: {
    minLeverage?: number;
    maxLeverage?: number;
  } = {
    minLeverage: undefined,
    maxLeverage: undefined,
  };
  if (portfolio && position && availableBalance && sdkContext) {
    const maxWithdrawableMargin = utils.positionMaxWithdrawableMargin(
      position,
      position.rootPair,
      position.rootInstrument.setting.initialMarginRatio,
    );
    const minLeverage = getAdjustMarginLeverageByMargin(availableBalance, position);
    const maxLeverage = getAdjustMarginLeverageByMargin(maxWithdrawableMargin, position);
    console.log('🚀 ~ maxLeverage:', {
      maxLeverage: WrappedBigNumber.from(maxLeverage),
      minLeverage: WrappedBigNumber.from(minLeverage),
      maxWithdrawableMargin: WrappedBigNumber.from(maxWithdrawableMargin),
    });
    const minBN = new BN(formatEther(minLeverage));
    const maxBN = new BN(formatEther(maxLeverage));
    ans.minLeverage = minBN.dp(1, BN.ROUND_UP).toNumber();
    ans.maxLeverage = maxBN.dp(1, BN.ROUND_DOWN).toNumber();
  }
  return ans;
};

export function getAdjustMarginLeverageByMargin(amount: BigNumber, position: WrappedPosition) {
  const value = wmul(
    getAdjustTradePrice(position.rootPair.markPrice, position.isInverse).wadValue,
    position.size.abs(),
  );
  const equity = position.equity.min(amount);
  const leverage = wdiv(value, equity.wadValue);
  return leverage;
}

/**
 * Calculates the quote size based on the base size and price.
 *
 * @param baseSize - The size of the base asset, wrapped in a `WrappedBigNumberLike`.
 * @param price - The price of the asset, wrapped in a `WrappedBigNumberLike`.
 * @param isInverse - A boolean indicating if the price is inverse.
 * @returns The calculated quote size as a `WrappedBigNumber`.
 */
export function calcQuoteSizeByBase(
  baseSize: WrappedBigNumberLike,
  price: WrappedBigNumberLike,
  isInverse: boolean,
): WrappedBigNumber {
  // now price is same as display, so we need inverse it to calc
  return WrappedBigNumber.from(baseSize).mul(getAdjustTradePrice(price, isInverse));
}

/**
 * Calculates the base size given a quote size and price.
 *
 * @param quoteSize - The size of the quote in a wrapped big number format.
 * @param price - The price in a wrapped big number format.
 * @param isInverse - A boolean indicating if the price is inverse.
 * @returns The calculated base size as a wrapped big number.
 */
export function calcBaseSizeByQuote(
  quoteSize: WrappedBigNumberLike,
  price: WrappedBigNumberLike,
  isInverse: boolean,
): WrappedBigNumber {
  // now price is same as display, so we need inverse it to calc
  return WrappedBigNumber.from(quoteSize).div(getAdjustTradePrice(price, isInverse));
}

export function calcTradeValue(
  baseSize: WrappedBigNumberLike,
  price: WrappedBigNumberLike,
  isInverse: boolean,
): WrappedBigNumber {
  return WrappedBigNumber.from(baseSize).mul(getAdjustTradePrice(price, isInverse));
}

export function calcRemovedPositionEntryPrice(
  ammSqrtPX96: BigNumber,
  rangeSqrtEntryPX96: BigNumber,
  isInverse: boolean,
): WrappedBigNumber {
  const originPrice = sqrt(sqrtX96ToWad(ammSqrtPX96).mul(sqrtX96ToWad(rangeSqrtEntryPX96)));
  return getAdjustTradePrice(WrappedBigNumber.from(originPrice), isInverse);
}
