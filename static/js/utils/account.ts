import _ from 'lodash';

import { IAccountRecords } from '@/types/account';

import { Order, Portfolio, Position, Range } from '@synfutures/sdks-perp';
import { bigNumberObjectCheck } from '.';
import { reducePortfolio } from './portfolio';
import { transformMetaAccount } from './transform/account';
import { getAccountId } from './transform/transformId';
import { transferToWrappedPortfolio } from './transform/transformWrappedEntities';

export function reduceAccounts(chainId: number, userAddr: string, portfolios: Portfolio[]): IAccountRecords {
  if (!portfolios?.length) return {} as IAccountRecords;
  const metaAccountMap = transformMetaAccount(portfolios);
  const accountRecords = _.reduce(
    portfolios,
    (res, portfolio) => {
      const instrumentAddr = portfolio.instrumentAddr;
      const userAddr = portfolio.traderAddr;
      if (!res.accountMap) res.accountMap = {};
      if (!res.positionMap) res.positionMap = {};
      if (!res.portfolioMap) res.portfolioMap = {};
      if (!res.orderMap) res.orderMap = {};
      const blockInfo = portfolio.blockInfo || {
        height: 0,
        timestamp: 0,
      };
      const accountId = getAccountId(userAddr, instrumentAddr);
      const metaAccount = metaAccountMap[accountId];
      if (accountId && metaAccount) transferToWrappedPortfolio(portfolio, chainId, metaAccount);
      if (!res?.blockInfo?.height) res.blockInfo = blockInfo;
      reducePortfolio(chainId, userAddr, instrumentAddr, portfolio, res);

      res.chainId = chainId;
      res.accountMap = metaAccountMap;

      return bigNumberObjectCheck(res);
    },
    {} as IAccountRecords,
  );
  return accountRecords;
}

export function checkAccountIsInPair({
  position: position,
  orders,
  ranges,
}: {
  position?: Position;
  orders?: Order[];
  ranges?: Range[];
}): boolean {
  if (position) return position.size && !position.size.eq(0) && !position.balance.eq(0);
  if (orders) return orders.length > 0;
  if (ranges) return ranges.length > 0;
  // return (p.size && !p.size.eq(0) && !p.balance.eq(0)) || orders.length > 0 || ranges.length > 0;
  return false;
}
