/**
 * @description Component-EarnHistory
 */
import './index.less';

import React, { FC } from 'react';

import { HISTORY_TYPE } from '@/constants/history';
import { PollingHistoryId } from '@/features/global/type';
import { useHistoryRange, useInfiniteLiquidityHistory } from '@/features/graph/hooks';
import { usePairFromUrl } from '@/features/pair/hook';
import useHistoryPolling from '@/hooks/history/useHistoryPolling';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import HistoryTable from '@/pages/portfolio/AccountHistory/HistoryTable';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const EarnHistory: FC<IPropTypes> = function ({}) {
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const pair = usePairFromUrl(chainId);
  const timeRange = useHistoryRange();

  const {
    refreshData,
    histories: liquidityHistories,
    queryState: { isLoading, fetchNextPage },
  } = useInfiniteLiquidityHistory({ chainId, userAddr, pair, timeRange });

  useHistoryPolling(PollingHistoryId.liquidity, liquidityHistories, refreshData);

  return (
    <div className="syn-earn-history">
      <HistoryTable
        showTradeHistoryTabs
        pair={pair}
        fetchMoreData={fetchNextPage}
        refresh={refreshData}
        loading={isLoading}
        historyType={HISTORY_TYPE.LIQUIDITY}
        histories={liquidityHistories}
        showPair={false}
      />
    </div>
  );
};

export default EarnHistory;
