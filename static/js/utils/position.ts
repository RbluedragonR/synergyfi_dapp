import { WrappedBigNumber, WrappedBigNumberLike } from '@/entities/WrappedBigNumber';
import { RawAmm, RawPosition, ZERO, utils } from '@synfutures/sdks-perp';

export function calcPositionLiquidationPrice(amm: RawAmm, position: RawPosition, maintenanceMarginRatio?: number) {
  if (position.size.isZero() || position.balance.isZero()) return ZERO;
  return utils.positionLiquidationPrice(position, amm, maintenanceMarginRatio);
}

export function calcEquity(position: RawPosition, amm: RawAmm) {
  const equity = utils.positionEquity(position, amm);
  return WrappedBigNumber.from(equity);
}

export function calcMarginToDeposit(margin: WrappedBigNumberLike, gateBalance: WrappedBigNumberLike) {
  const marginW = WrappedBigNumber.from(margin);
  const gateBalanceW = WrappedBigNumber.from(gateBalance);
  if (marginW.lte(0) || gateBalanceW.gte(marginW)) {
    return WrappedBigNumber.ZERO;
  }
  return marginW.min(gateBalanceW);
}
