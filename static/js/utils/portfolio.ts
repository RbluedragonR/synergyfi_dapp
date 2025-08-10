import { IAccountRecords } from '@/types/account';

import { TWrappedVolume } from '@/components/TableCard/tableConfigs/WrappedVolume';
import { ZERO } from '@/constants';
import { WrappedPair } from '@/entities/WrappedPair';
import { Portfolio, Position, Side } from '@synfutures/sdks-perp';
import {
  transformMetaPortfolio,
  transformToMetaOrder,
  transformToMetaPosition,
  transformToMetaRange,
} from './transform/account';
export function reducePortfolio(
  chainId: number,
  userAddr: string,
  instrumentAddr: string,
  portfolio: Portfolio,
  accountRecords?: IAccountRecords,
): IAccountRecords {
  instrumentAddr = instrumentAddr.toLowerCase();
  if (!accountRecords) {
    accountRecords = {} as IAccountRecords;
  }
  if (!accountRecords.accountMap) accountRecords.accountMap = {};
  if (!accountRecords.positionMap) accountRecords.positionMap = {};
  if (!accountRecords.portfolioMap) accountRecords.portfolioMap = {};
  if (!accountRecords.orderMap) accountRecords.orderMap = {};
  if (!accountRecords.rangeMap) accountRecords.rangeMap = {};
  if (portfolio) {
    const blockInfo = portfolio.blockInfo || {
      height: 0,
      timestamp: 0,
    };
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    accountRecords!.blockInfo = blockInfo;
    const metaPortfolio = transformMetaPortfolio(userAddr, instrumentAddr, portfolio, blockInfo);
    accountRecords.portfolioMap[metaPortfolio.id] = metaPortfolio;
    const position = portfolio.position;
    const metaPosition = transformToMetaPosition({ userAddr, instrumentAddr, portfolio, position, blockInfo });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    accountRecords!.positionMap[metaPosition.id] = metaPosition;
    if (portfolio.orders)
      portfolio.orders.forEach((order) => {
        const metaOrder = transformToMetaOrder({ userAddr, instrumentAddr, portfolio, order, blockInfo });
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        accountRecords!.orderMap[metaOrder.id] = metaOrder;
      });
    if (portfolio.ranges)
      portfolio.ranges.forEach((range) => {
        const metaRange = transformToMetaRange({ userAddr, instrumentAddr, portfolio, range, blockInfo });
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        accountRecords!.rangeMap[metaRange.id] = metaRange;
      });
  }
  accountRecords.chainId = chainId;
  return accountRecords;
}
export const transformVolumeDataToCsvData = (volumeData: TWrappedVolume[]): object[] => {
  return volumeData.map((item) => {
    return {
      Date: item.timestamp ? new Date(item.timestamp * 1000).toLocaleString('en-GB') : item.timestamp,
      Pair: item.wrappedPair?.symbol,
      Margin: item.wrappedPair?.rootInstrument?.marginToken.symbol,
      'Taker Volume': item.takerVolume,
      'Taler Volume USD': item.takerVolumeInUsd,
      'Maker Volume': item.makerVolume,
      'Maker Volume USD': item.makerVolumeInUsd,
      'Maker Rebate': item.makerRebate,
      'Maker Rebate USD': item.takerVolumeInUsd,
      'Take Fee': item.takerFee,
      'Take Fee USD': item.takerFeeInUsd,
    };
  });

  return [];
};

export function getEmptySDKPosition(pair: WrappedPair, traderAddr: string): Position {
  return {
    balance: ZERO,
    size: ZERO,
    entryNotional: ZERO,
    entrySocialLossIndex: ZERO,
    entryFundingIndex: ZERO,
    instrumentAddr: pair.instrumentAddr,
    expiry: pair.expiry,
    traderAddr: traderAddr,

    side: Side.LONG,
    entryPrice: ZERO,

    isInverse: pair.isInverse,

    blockInfo: pair.blockInfo,
  };
}
