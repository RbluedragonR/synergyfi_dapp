import { BlockInfo } from '@derivation-tech/context';

import { IMetaAccount, IMetaOrder, IMetaPortfolio, IMetaPosition, IMetaRange } from '@/types/account';

import { Order, Portfolio, Position, Range } from '@synfutures/sdks-perp';
import { getAccountId, getOrderId, getPairId, getPortfolioId, getRangeId } from './transformId';

export function transformMetaAccount(portfolios: Portfolio[], blockInfo?: BlockInfo): Record<string, IMetaAccount> {
  return portfolios.reduce((res, portfolio) => {
    const instrumentAddr = portfolio.instrumentAddr.toLowerCase();
    const accountId = getAccountId(portfolio.traderAddr, instrumentAddr);
    if (!res[accountId]) {
      res[accountId] = {
        id: accountId,
        userAddr: portfolio.traderAddr,
        instrumentId: instrumentAddr,
        portfolioIds: [],
        blockInfo: portfolio.blockInfo || blockInfo,
      };
    }
    res[accountId].portfolioIds.push(getPortfolioId(accountId, portfolio.expiry));
    return res;
  }, {} as Record<string, IMetaAccount>);
}

export function transformMetaPortfolio(
  userAddr: string,
  instrumentAddr: string,
  portfolio: Portfolio,
  blockInfo?: BlockInfo,
): IMetaPortfolio {
  const accountId = getAccountId(userAddr, instrumentAddr);
  const id = getPortfolioId(accountId, portfolio.expiry);
  const pairId = getPairId(instrumentAddr, portfolio.expiry);

  return {
    id: id,
    instrumentId: instrumentAddr.toLowerCase(),
    pairId: pairId,
    accountId: accountId,
    blockInfo: blockInfo,
    ...portfolio,
  };
}

export function transformToMetaPosition({
  portfolio,
  position,
  userAddr,
  instrumentAddr,
  blockInfo,
}: {
  userAddr: string;
  instrumentAddr: string;
  portfolio: Portfolio;
  position: Position;
  blockInfo?: BlockInfo;
}): IMetaPosition {
  const accountId = getAccountId(userAddr, instrumentAddr);
  const portfolioId = getPortfolioId(accountId, portfolio.expiry);
  const positionId = portfolioId;
  const pairId = getPairId(instrumentAddr, portfolio.expiry);

  return {
    id: positionId,
    instrumentId: instrumentAddr.toLowerCase(),
    accountId: accountId,
    portfolioId: portfolioId,
    pairId,
    blockInfo: position.blockInfo || blockInfo,
    ...position,
  };
}

export function transformToMetaOrder({
  userAddr,
  instrumentAddr,
  portfolio,
  order,
  blockInfo,
}: {
  userAddr: string;
  instrumentAddr: string;
  portfolio: Portfolio;
  order: Order;
  blockInfo?: BlockInfo;
}): IMetaOrder {
  const accountId = getAccountId(userAddr, instrumentAddr);
  const portfolioId = getPortfolioId(accountId, portfolio.expiry);
  const orderId = getOrderId(portfolioId, order.oid);
  const pairId = getPairId(instrumentAddr, portfolio.expiry);

  return {
    id: orderId,
    instrumentId: instrumentAddr.toLowerCase(),
    accountId: accountId,
    portfolioId: portfolioId,
    pairId,
    blockInfo: order.blockInfo || blockInfo,
    ...order,
  };
}

export function transformToMetaRange({
  userAddr,
  instrumentAddr,
  portfolio,
  range,
  blockInfo,
}: {
  userAddr: string;
  instrumentAddr: string;
  portfolio: Portfolio;
  range: Range;
  blockInfo?: BlockInfo;
}): IMetaRange {
  const accountId = getAccountId(userAddr, instrumentAddr);
  const portfolioId = getPortfolioId(accountId, portfolio.expiry);
  const rangeId = getRangeId(portfolioId, range.rid);
  const pairId = getPairId(instrumentAddr, portfolio.expiry);

  return {
    id: rangeId,
    instrumentId: instrumentAddr.toLowerCase(),
    accountId: accountId,
    portfolioId: portfolioId,
    pairId,
    blockInfo: range.blockInfo || blockInfo,
    ...range,
  };
}

function asUint24(x: number): number {
  const MAX_UINT_24 = (1 << 24) - 1;
  if (x < 0) {
    x += MAX_UINT_24;
  }
  return x;
}

export function rangeKey(tickLower: number, tickUpper: number): number {
  return shiftLeft(asUint24(tickLower), 24) + asUint24(tickUpper);
}

export function orderKey(tick: number, nonce: number): number {
  return shiftLeft(asUint24(tick), 24) + nonce;
}

function shiftLeft(x: number, n: number): number {
  return x * Math.pow(2, n);
}
