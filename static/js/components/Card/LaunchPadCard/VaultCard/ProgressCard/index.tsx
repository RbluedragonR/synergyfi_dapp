import { WrappedVault } from '@/entities/WrappedVault';
import VaultProgress from '@/pages/vault/VaultList/VaultProgress';
import classNames from 'classnames';
import { ComponentProps } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import './index.less';
type ProgressCardProps = ComponentProps<'div'> & { vault: WrappedVault };
export default function ProgressCard({ className, vault, ...others }: ProgressCardProps) {
  const { t } = useTranslation();
  return (
    <div className={classNames('syn-vault-progress-card', className)} {...others}>
      <div className="syn-vault-progress-card-heading">
        <div className="syn-vault-progress-card-title">
          {t('launchpad.launchProgress')}({vault.getLaunchProgressPercentage().formatPercentageString()})
        </div>
        <div className="syn-vault-progress-card-description">
          <Trans
            i18nKey={'launchpad.description.launchProgress'}
            values={{
              tokenName: vault.quoteToken.symbol,
              totalAmount: vault.targetTvl.formatDisplayNumber(),
            }}
          />
        </div>
      </div>
      <VaultProgress
        targetTvl={vault.targetTvl}
        tvl={vault.tvl}
        vaultTokenSymbol={vault.quoteToken.symbol}
        type="vertical"
      />
    </div>
  );
}
