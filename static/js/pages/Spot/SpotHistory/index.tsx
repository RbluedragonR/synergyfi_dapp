/**
 * @description Component-SpotHistory
 */
import { useTranslation } from 'react-i18next';
import './index.less';

import Empty from '@/components/Empty';
import { useMockDevTool } from '@/components/Mock';
import { useSpotHistory } from '@/features/spot/query';
import { useWalletConnectStatus } from '@/features/wallet/hook';
import { useSDK } from '@/features/web3/hook';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { WALLET_CONNECT_STATUS } from '@/types/wallet';
import { FC } from 'react';
import SpotHistoryItem from './SpotHistoryItem';
import SpotHistorySkeleton from './SpotHistorySkeleton';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const SpotHistory: FC<IPropTypes> = function ({}) {
  const { t } = useTranslation();
  const chainId = useChainId();
  const sdk = useSDK(chainId);
  const userAddr = useUserAddr();
  const walletConnectStatus = useWalletConnectStatus();
  const { data: histories, isFetched } = useSpotHistory(userAddr, sdk, chainId);
  const { isMockSkeleton } = useMockDevTool();
  return (
    <div className="syn-spot-history">
      <div className="syn-spot-history-title">{t('common.history')}</div>
      <div className="syn-spot-history-content">
        <div className="syn-spot-history-header">
          <div className="syn-spot-history-header-item">{t('common.time')}</div>
          <div className="syn-spot-history-header-item">{t('common.spot.sell')}</div>
          <div className="syn-spot-history-header-item">{t('common.spot.buy')}</div>
        </div>
        <div className="syn-spot-history-container syn-scrollbar">
          {!isMockSkeleton &&
            WALLET_CONNECT_STATUS.CONNECTED === walletConnectStatus &&
            histories?.map((h) => <SpotHistoryItem item={h} key={h.transactionHash + h.logIndex} />)}
          {(isMockSkeleton || (!isFetched && !!userAddr && !histories?.length)) && <SpotHistorySkeleton />}
          {(WALLET_CONNECT_STATUS.CONNECTED !== walletConnectStatus || (isFetched && !histories?.length)) && (
            <Empty showUnconnected={false} />
          )}
        </div>
      </div>
    </div>
  );
};

export default SpotHistory;
