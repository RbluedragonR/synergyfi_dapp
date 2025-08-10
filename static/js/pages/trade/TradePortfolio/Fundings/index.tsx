/**
 * @description Component-Fundings
 */
import './index.less';

import React, { FC } from 'react';

import { HISTORY_TYPE } from '@/constants/history';
import { POLLING_HISTORY_POLLING } from '@/constants/polling';
import { useHistoryRange, useInfiniteFundingHistory } from '@/features/graph/hooks';
import { useCurrentPairFromUrl } from '@/features/pair/hook';
import { usePoller } from '@/hooks/common/usePoller';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import HistoryTable from '@/pages/portfolio/AccountHistory/HistoryTable';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const Fundings: FC<IPropTypes> = function ({}) {
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const pair = useCurrentPairFromUrl(chainId);
  const timeRange = useHistoryRange();
  const {
    refreshData,
    histories: fundingHistories,
    queryState: { isLoading, fetchNextPage },
  } = useInfiniteFundingHistory({ chainId, userAddr, pair, timeRange });

  usePoller(
    () => {
      refreshData();
    },
    [refreshData],
    POLLING_HISTORY_POLLING,
  );
  return (
    <div className="syn-fundings">
      <HistoryTable
        showTradeHistoryTabs
        pair={pair}
        fetchMoreData={fetchNextPage}
        refresh={refreshData}
        historyType={HISTORY_TYPE.FUNDING}
        histories={fundingHistories}
        showPair={false}
        loading={isLoading}
      />
    </div>
  );
};

export default Fundings;
