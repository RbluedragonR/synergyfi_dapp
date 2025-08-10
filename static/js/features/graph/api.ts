import { CHAIN_ID } from '@/constants/chain';
import { DEFAULT_HISTORY_PAGE_SIZE, HISTORY_RANGE } from '@/constants/history';
import { IGraphInstrumentBasicInfo, IGraphPairBasicInfo } from '@/types/graph';
import { getStartEndTimeByRangeType } from '@/utils/history';
import { showProperDateString } from '@/utils/timeUtils';
import { getTokenInfo } from '@/utils/token';
import { getPairId } from '@/utils/transform/transformId';
import { Context } from '@derivation-tech/context';
import { OrderStatus } from '@synfutures/sdks-perp-datasource';
import _ from 'lodash';

export const getAllPairBasicInfoByGraph = async (chainId: number | undefined, sdk: Context | undefined) => {
  if (chainId && sdk) {
    const infos = await sdk.perpDataSource.statistics.getInstrumentsInfo();
    const basicInstruments: IGraphInstrumentBasicInfo[] = infos.map((info) => ({
      ...info,
      id: info.address,
      instrumentAddr: info.address,
      baseToken: getTokenInfo(info.base, chainId),
      quoteToken: getTokenInfo(info.quote, chainId),
      chainId,
    }));

    const basicPairs = basicInstruments.reduce((acc, info) => {
      const { expiries } = info;
      expiries?.forEach((expiry) => {
        if (expiry) {
          const pairId = getPairId(info.instrumentAddr, expiry);
          if (pairId) {
            acc[pairId] = {
              id: pairId,
              expiry,
              isInverse: info.isInverse,
              rootInstrument: info,
              chainId,
              symbol: `${info.symbol}-${showProperDateString({
                expiry,
                format: 'MMDD',
                showShortPerp: true,
              })}`,
            };
          }
        }
      });

      return acc;
    }, {} as { [pairId: string]: IGraphPairBasicInfo });

    return basicPairs;
  }
};

export const getVirtualTradeHistory = async ({
  chainId,
  userAddr,
  instrumentAddr,
  expiry,
  page,
  pageSize = DEFAULT_HISTORY_PAGE_SIZE,
  timeRange,
  requiredAllData = false,
  sdk,
}: {
  chainId: CHAIN_ID | undefined;
  userAddr: string | undefined;
  instrumentAddr: string | undefined;
  expiry: number | undefined;
  page?: number;
  pageSize?: number;
  timeRange: HISTORY_RANGE;
  requiredAllData?: boolean;
  sdk: Context;
}) => {
  if (!userAddr) {
    return [];
  }
  const { startTime, endTime } = getStartEndTimeByRangeType(timeRange);
  const tradeHistoryList = await sdk.perpDataSource.history.getVirtualTradeHistory({
    instrumentAddr: instrumentAddr,
    expiry,
    traders: [userAddr],
    startTs: startTime,
    endTs: endTime,
    page,
    size: requiredAllData ? undefined : pageSize,
  });
  console.record('graph', `Query [getTradeHistory]`, tradeHistoryList, {
    chainId,
    userAddr,
  });
  return _.orderBy(tradeHistoryList, ['timestamp'], ['desc']);
};

export const getOrdersHistory = async ({
  chainId,
  userAddr,
  instrumentAddr,
  expiry,
  timeRange,
  page,
  pageSize = DEFAULT_HISTORY_PAGE_SIZE,
  requiredAllData = false,
  requiredOpenDataOnly = false,
  sdk,
}: {
  isPolling?: boolean;
  chainId: CHAIN_ID | undefined;
  userAddr: string | undefined;
  instrumentAddr?: string;
  expiry?: number;
  timeRange: HISTORY_RANGE;
  page?: number;
  pageSize?: number;
  requiredAllData?: boolean;
  requiredOpenDataOnly?: boolean;
  sdk: Context;
}) => {
  if (!userAddr) {
    return [];
  }
  const { startTime, endTime } = getStartEndTimeByRangeType(timeRange);
  let orderHistoryList = await sdk.perpDataSource.history.getOrderHistory({
    instrumentAddr: instrumentAddr,
    expiry,
    traders: [userAddr],
    startTs: startTime,
    endTs: endTime,
    page,
    size: requiredAllData ? undefined : pageSize,
  });
  if (orderHistoryList) {
    if (requiredOpenDataOnly) {
      orderHistoryList = orderHistoryList.filter((o) => o.status == OrderStatus.OPEN);
    } else {
      orderHistoryList = orderHistoryList.filter((o) => o.status !== OrderStatus.OPEN);
    }
  }
  console.record('graph', `Query [getOrderHistory]`, orderHistoryList, {
    chainId,
    userAddr,
  });
  return _.orderBy(
    orderHistoryList.map((o) => ({ ...o, logIndex: o.fillTxLogIndex || o.cancelTxLogIndex || o.placeTxLogIndex })),
    ['createdTimestamp'],
    ['desc'],
  );
};

export const getFundingHistory = async ({
  chainId,
  userAddr,
  instrumentAddr,
  expiry,
  timeRange,
  page,
  pageSize = DEFAULT_HISTORY_PAGE_SIZE,
  requiredAllData = false,
  sdk,
}: {
  chainId: CHAIN_ID | undefined;
  userAddr: string | undefined;
  instrumentAddr?: string;
  expiry?: number;
  timeRange: HISTORY_RANGE;
  page?: number;
  pageSize?: number;
  requiredAllData?: boolean;
  sdk: Context;
}) => {
  if (!userAddr) return [];

  const { startTime, endTime } = getStartEndTimeByRangeType(timeRange);
  const historyList = await sdk.perpDataSource.history.getFundingHistory({
    instrumentAddr,
    expiry,
    traders: [userAddr],
    startTs: startTime,
    endTs: endTime,
    page,
    size: requiredAllData ? undefined : pageSize,
  });

  console.record('graph', `Query [getFundingHistory]`, historyList, { chainId, userAddr });

  return (
    historyList?.map((history) => ({
      ...history,
      instrumentAddr: history.instrumentAddr.toLowerCase(),
    })) || []
  );
};

export const getTransferHistory = async ({
  chainId,
  userAddr,
  instrumentAddr,
  expiry,
  timeRange,
  page,
  pageSize = DEFAULT_HISTORY_PAGE_SIZE,
  requiredAllData = false,
  sdk,
}: {
  chainId: CHAIN_ID | undefined;
  userAddr: string | undefined;
  instrumentAddr?: string;
  expiry?: number;
  timeRange: HISTORY_RANGE;
  page?: number;
  pageSize?: number;
  requiredAllData?: boolean;
  sdk: Context;
}) => {
  if (!userAddr) return [];

  const { startTime, endTime } = getStartEndTimeByRangeType(timeRange);
  const historyList = await sdk.perpDataSource.history.getTransferHistory({
    instrumentAddr,
    expiry,
    traders: [userAddr],
    startTs: startTime,
    endTs: endTime,
    page,
    size: requiredAllData ? undefined : pageSize,
  });

  console.record('graph', `Query [getTransferHistory]`, historyList, { chainId, userAddr });

  return (
    historyList?.map((history) => ({
      ...history,
      timestamp: history.timestamp,
      instrumentAddr: history.instrumentAddr.toLowerCase(),
      expiry: Number(history.expiry),
      isTransferIn: history.type === 'Scatter',
      txHash: history.txHash,
      logIndex: history.logIndex,
    })) || []
  );
};

export const getLiquidityHistory = async ({
  chainId,
  userAddr,
  instrumentAddr,
  expiry,
  timeRange,
  page,
  pageSize = DEFAULT_HISTORY_PAGE_SIZE,
  requiredAllData = false,
  sdk,
}: {
  chainId: CHAIN_ID | undefined;
  userAddr: string | undefined;
  instrumentAddr?: string;
  expiry?: number;
  timeRange: HISTORY_RANGE;
  page?: number;
  pageSize?: number;
  requiredAllData?: boolean;
  sdk: Context;
}) => {
  if (!userAddr) return [];

  const { startTime, endTime } = getStartEndTimeByRangeType(timeRange);
  const eventList = await sdk.perpDataSource.history.getLiquidityHistory({
    instrumentAddr,
    expiry,
    traders: [userAddr],
    startTs: startTime,
    endTs: endTime,
    page,
    size: requiredAllData ? undefined : pageSize,
  });

  console.record('graph', `Query [getLiquidityHistory]`, eventList, { chainId, userAddr });

  return (
    eventList?.map((event) => ({
      ...event,
      instrumentAddr: event.instrumentAddr.toLowerCase(),
    })) || []
  );
};

export const getAccountBalanceHistory = async ({
  chainId,
  userAddr,
  timeRange,
  page,
  pageSize = DEFAULT_HISTORY_PAGE_SIZE,
  requiredAllData = false,
  sdk,
}: {
  chainId: CHAIN_ID | undefined;
  userAddr: string | undefined;
  timeRange: HISTORY_RANGE;
  page?: number;
  pageSize?: number;
  requiredAllData?: boolean;
  sdk: Context;
}) => {
  if (!userAddr) return [];

  const { startTime, endTime } = getStartEndTimeByRangeType(timeRange);
  const historyList = await sdk.perpDataSource.history.getAccountBalanceHistory({
    traders: [userAddr],
    startTs: startTime,
    endTs: endTime,
    page,
    size: requiredAllData ? undefined : pageSize,
  });

  console.record('graph', `Query [getAccountBalanceHistory]`, historyList, { chainId, userAddr });

  return historyList || [];
};
