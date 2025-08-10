/**
 * @description Component-Transfers
 */
import './index.less';

import React, { FC } from 'react';

import { HISTORY_TYPE } from '@/constants/history';
import { PollingHistoryId } from '@/features/global/type';
import { useHistoryRange, useInfiniteTransferHistory } from '@/features/graph/hooks';
import { useCurrentPairFromUrl } from '@/features/pair/hook';
import useHistoryPolling from '@/hooks/history/useHistoryPolling';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import HistoryTable from '@/pages/portfolio/AccountHistory/HistoryTable';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const Transfers: FC<IPropTypes> = function ({}) {
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const timeRange = useHistoryRange();
  const pair = useCurrentPairFromUrl(chainId);
  const {
    refreshData,
    histories: transferHistories,
    queryState: { fetchNextPage, isLoading },
  } = useInfiniteTransferHistory({ chainId, userAddr, pair: 'all', timeRange });

  useHistoryPolling(PollingHistoryId.transfer, transferHistories, refreshData);
  return (
    <div className="syn-transfers">
      {/* <HistoryRefresh refresh={refreshData} historyStatus={transferHistoryStatus}></HistoryRefresh> */}
      <HistoryTable
        showTradeHistoryTabs
        pair={pair}
        historyType={HISTORY_TYPE.TRANSFERS}
        histories={transferHistories}
        showPair={false}
        fetchMoreData={fetchNextPage}
        loading={isLoading}
      />
    </div>
  );
};

export default Transfers;
