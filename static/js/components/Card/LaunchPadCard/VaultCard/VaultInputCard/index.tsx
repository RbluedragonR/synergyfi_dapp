import { CardWrapper } from '@/components/CardWrapper';
import { WrappedVault } from '@/entities/WrappedVault';
import { Stage } from '@synfutures/sdks-perp-launchpad';
import classNames from 'classnames';
import { ComponentProps, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { VaultInputDepositBottomCard, VaultInputTabKey, VaultInputWithdrawBottomCard } from './element';
import './index.less';
type VaultInputCardProps = ComponentProps<'div'> & { vault: WrappedVault };

export default function VaultInputCard({ className, vault, ...others }: VaultInputCardProps) {
  const [activeTabKey, setActiveTabKey] = useState<VaultInputTabKey>(VaultInputTabKey.DEPOSIT);
  const { t } = useTranslation();

  return (
    <div className="syn-vault-input-card-wrapper">
      <CardWrapper
        {...others}
        className={classNames('syn-vault-input-card', className)}
        showSettingsIcon={false}
        activeTabKey={activeTabKey}
        onTabChange={(key) => {
          setActiveTabKey(key as VaultInputTabKey);
        }}
        tabList={[
          {
            tab: t('launchpad.deposit'),
            key: VaultInputTabKey.DEPOSIT,
            disabled: vault.stageForUi === Stage.INVALID,
          },
          {
            tab: t('launchpad.withdraw'),
            key: VaultInputTabKey.WITHDRAW,
          },
        ]}>
        {activeTabKey === VaultInputTabKey.DEPOSIT && <VaultInputDepositBottomCard vault={vault} />}
        {activeTabKey === VaultInputTabKey.WITHDRAW && (
          <VaultInputWithdrawBottomCard activeTabKey={activeTabKey} vault={vault} />
        )}
      </CardWrapper>

      {/* {activeTabKey === VaultInputTabKey.WITHDRAW && <PendingWithdrawalCard vault={vault} />} */}
    </div>
  );
}
