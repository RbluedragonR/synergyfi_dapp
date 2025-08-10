import Alert from '@/components/Alert';
import { WrappedVault } from '@/entities/WrappedVault';
import { useUserAddr } from '@/hooks/web3/useChain';
import { Stage } from '@synfutures/sdks-perp-launchpad';
import classNames from 'classnames';
import { ComponentProps, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ProgressCard from './ProgressCard';
import VaultInputCard from './VaultInputCard';
import VaultMetaCard from './VaultMetaCard';
import { VaultYourDeposit } from './element';
import './index.less';

type VaultCardProps = ComponentProps<'div'> & { vault: WrappedVault };
export default function VaultCard({ className, vault, ...others }: VaultCardProps) {
  const userAddr = useUserAddr();
  const { t } = useTranslation();

  const userDeposit = useMemo(() => {
    return vault && userAddr && vault.getUserDeposit(userAddr);
  }, [userAddr, vault]);

  return (
    <div {...others} className={classNames(className, 'syn-vault-card')}>
      {vault.stageForUi === Stage.INVALID && (
        <Alert type="warning" message={t('launchpad.description.invaildWarning')} showIcon />
      )}
      {/* {!haveNoPair && (
        <div className="syn-vault-meta-card">
          <VerticalText title={t('launchpad.availablePairs')} value={<TokenVaultPairTags vault={vault} />} />
        </div>
      )} */}
      {vault.stageForUi === Stage.UPCOMING && (
        <>
          <ProgressCard vault={vault} />
          <div className="syn-vault-card-divider" />
        </>
      )}
      {vault.stageForUi === Stage.UPCOMING ? (
        <VaultYourDeposit vault={vault} />
      ) : (
        <VaultMetaCard showTvl={false} vault={vault} />
      )}
      {userDeposit && userDeposit.gt(0) && <div className="syn-vault-card-divider" />}
      <VaultInputCard vault={vault} />
    </div>
  );
}
