import { FeederType, PERP_EXPIRY, Side, Status } from '@synfutures/sdks-perp';
import { BigNumber } from 'ethers';
import moment from 'moment';

import { PERP } from '@/constants';
import { WrappedBigNumber, WrappedBigNumberLike } from '@/entities/WrappedBigNumber';
import { WrappedPair } from '@/entities/WrappedPair';
import { MARGIN_TYPE } from '@/types/global';

import { VirtualTradeType } from '@synfutures/sdks-perp-datasource';
import { showProperDateString } from './timeUtils';

export function pairExpiring(expiry: number): boolean {
  const expiryDate = moment(expiry * 1000).utc();
  const today = moment(new Date()).utc();
  return expiry !== 0 && expiryDate < today;
}
export function isPairExpiredToday(expiry: number): boolean {
  const expiryDate = moment(expiry * 1000).utc();
  const today = moment(new Date()).utc();
  return expiry !== 0 && expiryDate.format('YYYY-MM-DD') === today.format('YYYY-MM-DD');
}

export function getDisplayExpiry(expiry: number, format = 'MMDD'): string {
  return expiry === PERP_EXPIRY ? PERP : showProperDateString({ expiry, format });
}
export function getExpiryNumberFromString(expiry: string): number {
  return expiry === 'PERP' ? PERP_EXPIRY : moment.utc(expiry).hour(8).unix();
}

/**
 * disable pair if pair expired or
 * in pool check today's liquidity
 * @param pair
 * @param tabType
 * @param disableExpiringPair
 * @returns
 */
export function isDisableExpiredPair(pair: WrappedPair, disableExpiringPair = true): boolean {
  if (disableExpiringPair) {
    if (pair.status === Status.SETTLED) {
      return true;
    }
    if (pairExpiring(pair.expiry)) {
      return true;
    }
    return false;
  }
  return false;
}

export function isInverseType(feederType: FeederType | undefined): boolean {
  return !!feederType && [FeederType.BASE_STABLE].includes(feederType);
}

export function getMarginTypeByFeeder(feederType: FeederType): MARGIN_TYPE {
  if ([FeederType.BOTH_STABLE, FeederType.QUOTE_STABLE].includes(feederType)) return MARGIN_TYPE.USD;
  return MARGIN_TYPE.COIN;
}

/**
 * to Reciprocal Number: 1/x
 * @param num
 * @returns
 */
export function toReciprocalNumber(num: WrappedBigNumberLike): WrappedBigNumber {
  const bn = WrappedBigNumber.from(num);
  if (bn.eq(0)) {
    return bn;
  }
  return WrappedBigNumber.from(1).div(bn);
}

export function getAdjustTradeSide(
  tradeSide: Side,
  isInverse: boolean,
  considerSweepInTradeHistoryProps?: {
    type: VirtualTradeType;
    fee: BigNumber;
  },
): Side {
  if (tradeSide === Side.FLAT) {
    return tradeSide;
  }
  const side = isInverse ? (tradeSide === Side.LONG ? Side.SHORT : Side.LONG) : tradeSide;
  if (considerSweepInTradeHistoryProps) {
    const { type, fee } = considerSweepInTradeHistoryProps;
    if (type === VirtualTradeType.LIQUIDATION && fee.isZero()) {
      return side === Side.LONG ? Side.SHORT : Side.LONG;
    }
  }
  return side;
}

export function getAdjustTradePrice(price: WrappedBigNumberLike, isInverse: boolean): WrappedBigNumber {
  const bn = WrappedBigNumber.from(price);
  if (bn.isZero()) return bn;
  return isInverse ? WrappedBigNumber.from(1).div(bn) : bn;
}

export function getAdjustTradeSize(size: WrappedBigNumberLike, isInverse: boolean): WrappedBigNumber {
  const bn = WrappedBigNumber.from(size);
  return isInverse ? bn.mul(-1) : bn;
}
