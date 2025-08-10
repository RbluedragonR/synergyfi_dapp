/**
 * @description Component-TradeHistory
 */
import './index.less';

import React, { FC } from 'react';

import { HISTORY_TYPE } from '@/constants/history';
import { PollingHistoryId } from '@/features/global/type';
import { useHistoryRange, useInfiniteVirtualTradeHistory } from '@/features/graph/hooks';
import { useCurrentPairFromUrl } from '@/features/pair/hook';
import useHistoryPolling from '@/hooks/history/useHistoryPolling';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import HistoryTable from '@/pages/portfolio/AccountHistory/HistoryTable';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const TradeHistory: FC<IPropTypes> = function ({}) {
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const timeRange = useHistoryRange();
  const pair = useCurrentPairFromUrl(chainId);
  const {
    refreshData,
    histories,
    queryState: { isLoading, fetchNextPage },
  } = useInfiniteVirtualTradeHistory({ chainId, userAddr, timeRange, pair });

  useHistoryPolling(PollingHistoryId.trade, histories, refreshData);
  return (
    <div className="syn-trade-history">
      <HistoryTable
        showTradeHistoryTabs
        pair={pair}
        sticky={{ offsetHeader: 48 }}
        historyType={HISTORY_TYPE.TRADE}
        histories={histories}
        refresh={refreshData}
        fetchMoreData={fetchNextPage}
        showPair={false}
        loading={isLoading}
      />
    </div>
  );
};

export default TradeHistory;
