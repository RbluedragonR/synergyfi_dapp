import { POLLING_HISTORY_POLLING } from '@/constants/polling';
import { usePollingHistoryTx } from '@/features/global/hooks';
import { PollingHistoryId } from '@/features/global/type';
import { useMemo } from 'react';
import { usePoller } from '../common/usePoller';
import { useChainId, useUserAddr } from '../web3/useChain';

export default function useHistoryPolling(
  pollingHistoryId: PollingHistoryId,
  histories: { txHash: string }[],
  refreshData: (page?: number, isPolling?: boolean) => void,
) {
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const tx = usePollingHistoryTx(pollingHistoryId, chainId, userAddr);
  const isLatestTxFetched = useMemo(() => {
    if (!tx) return true;
    return histories.some((history) => tx && history.txHash.toLowerCase() === tx?.toLowerCase());
  }, [histories, tx]);
  usePoller(
    () => {
      if (!isLatestTxFetched) {
        refreshData(0, true);
      }
    },
    [refreshData, isLatestTxFetched],
    POLLING_HISTORY_POLLING,
  );
}
