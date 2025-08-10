/**
 * @description Component-OrderHistory
 */
import './index.less';

import React, { FC } from 'react';

import { HISTORY_TYPE } from '@/constants/history';
import { PollingHistoryId } from '@/features/global/type';
import { useHistoryRange, useInfiniteOrdersHistory } from '@/features/graph/hooks';
import { useCurrentPairFromUrl } from '@/features/pair/hook';
import useHistoryPolling from '@/hooks/history/useHistoryPolling';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import HistoryTable from '@/pages/portfolio/AccountHistory/HistoryTable';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const OrderHistory: FC<IPropTypes> = function ({}) {
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const pair = useCurrentPairFromUrl(chainId);
  const timeRange = useHistoryRange();

  const {
    refreshData,
    histories,
    queryState: { fetchNextPage: fetchNextOrderPage, isLoading: isLoadingOrder },
  } = useInfiniteOrdersHistory({ chainId, userAddr, pair, timeRange });

  useHistoryPolling(PollingHistoryId.order, histories, refreshData);

  return (
    <div className="syn-order-history">
      <HistoryTable
        showTradeHistoryTabs
        pair={pair}
        historyType={HISTORY_TYPE.ORDERS}
        histories={histories}
        fetchMoreData={fetchNextOrderPage}
        refresh={refreshData}
        showPair={false}
        loading={isLoadingOrder}
      />
    </div>
  );
};

export default OrderHistory;
