/**
 * @description Component-VaultList
 */
import bannerSrc from '@/assets/images/vault_coming_banner.png';
import { WrappedVault } from '@/entities/WrappedVault';
import { useSelectedVault, useWatchVaultListChange, useWrappedVaults } from '@/features/vault/hook';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { getVaultRowKey } from '@/utils/vault';
import { Stage } from '@synfutures/sdks-perp-launchpad';
import { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import VaultListOngoing from '../VaultListOngoing';
import VaultListComing from './VaultListComing';
import './index.less';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const VaultList: FC<IPropTypes> = function ({}) {
  const { t } = useTranslation();
  //const [search, setSearch] = useState('');
  const { selectedVault } = useSelectedVault();
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const [prevVault, setPrevVault] = useState<WrappedVault | null>(null);
  const vaults = useWrappedVaults(chainId, userAddr);
  // const haveNoUpcoming = useMemo(() => vaults.filter((v) => v.stageForUi === Stage.UPCOMING).length === 0, [vaults]);
  const haveNoUpcoming = useMemo(() => vaults.filter((v) => v.stageForUi === Stage.UPCOMING).length === 0, [vaults]);
  useWatchVaultListChange(chainId, userAddr);

  useEffect(() => {
    prevVault &&
      document
        .querySelector(`[data-row-key="${getVaultRowKey(prevVault)}"]`)
        ?.classList.toggle('ant-table-row-active-vault');
    selectedVault &&
      document
        .querySelector(`[data-row-key="${getVaultRowKey(selectedVault)}"]`)
        ?.classList.toggle('ant-table-row-active-vault');
    setPrevVault(selectedVault);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVault]);
  return (
    <div className="syn-vault-list">
      {
        <>
          <h1 className="syn-vault-list-heading-title">{t('launchpad.launchedVault')}</h1>
          {/* <Search
          value={search}
          className="syn-vault-list-search"
          onChange={(e) => setSearch(e.target.value)}
          prefix={<img src={SearchIconSrc} />}
          placeholder={t('launchpad.search')}
        /> */}
          <VaultListOngoing search={''} />
        </>
      }
      {!haveNoUpcoming && (
        <>
          <div className="syn-vault-list-heading">
            <h1 className="syn-vault-list-heading-title">{t('launchpad.boostToLaunch')}</h1>
            {/* <Search
          value={search}
          className="syn-vault-list-search"
          onChange={(e) => setSearch(e.target.value)}
          prefix={<img src={SearchIconSrc} />}
          placeholder={t('launchpad.search')}
        /> */}
          </div>
          <VaultListComing search={''} />
        </>
      )}
      {false && (
        <>
          <h1 className="syn-vault-list-heading-title">{t('launchpad.stayTuned')}</h1>
          <img src={bannerSrc} />
        </>
      )}
    </div>
  );
};

export default VaultList;
