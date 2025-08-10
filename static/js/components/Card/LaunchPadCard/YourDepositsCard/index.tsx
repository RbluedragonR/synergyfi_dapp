import { CrossIcon, HistoryIcon } from '@/assets/svg';
import { useMockDevTool } from '@/components/Mock';
import { FETCHING_STATUS } from '@/constants';
import { fetchVaultHistory } from '@/features/vault/action';
import { useSelectedVault, useUserVaultHistory, useUserVaultHistoryStatus } from '@/features/vault/hook';
import { useSDK } from '@/features/web3/hook';
import { useAppDispatch } from '@/hooks';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import VaultCard from '../VaultCard';
import VaultInfoCard from '../VaultCard/VaultInfoCard';
import VaultCardSkeleton from '../VaultCardSkeleton';
import { VaultHistoryCard } from './VaultHistoryCard';
import './index.less';
export default function YourDepositsCard() {
  const [showHistory, setShowHistory] = useState(false);
  const { t } = useTranslation();
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const { selectedVault } = useSelectedVault();
  const dispatch = useAppDispatch();
  const vaultHistory = useUserVaultHistory(chainId, userAddr);
  const vaultHistoryStatus = useUserVaultHistoryStatus(chainId, userAddr);
  const { isMockSkeleton } = useMockDevTool();
  const sdk = useSDK(chainId);
  useEffect(() => {
    showHistory && chainId && userAddr && sdk && dispatch(fetchVaultHistory({ chainId, userAddr, sdk }));
  }, [chainId, dispatch, showHistory, userAddr, sdk]);

  return (
    <div className="syn-yds-card-wrapper">
      <div className="syn-yds-card-title">
        <span className="syn-yds-card-title-text">{showHistory ? t('launchpad.history') : t('launchpad.project')}</span>
        <span
          className="syn-yds-card-title-btn"
          onClick={() => {
            setShowHistory((prev) => !prev);
          }}>
          {showHistory ? <CrossIcon color="#000000" /> : <HistoryIcon color="#000000" />}
        </span>
      </div>

      {selectedVault ? (
        <>
          {' '}
          {showHistory ? (
            <VaultHistoryCard
              isSkeleton={isMockSkeleton || vaultHistoryStatus !== FETCHING_STATUS.DONE}
              data={vaultHistory}
            />
          ) : (
            <div className="syn-launch-pad-card-wrap">
              <VaultInfoCard vault={selectedVault} />
              <VaultCard vault={selectedVault} className="syn-launch-pad-card" />
            </div>
          )}
        </>
      ) : (
        <VaultCardSkeleton />
      )}
    </div>
  );
}
