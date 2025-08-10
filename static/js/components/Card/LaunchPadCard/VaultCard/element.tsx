import { WrappedVault } from '@/entities/WrappedVault';
import { useUserAddr } from '@/hooks/web3/useChain';
import classNames from 'classnames';
import { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import './element.less';
type VaultYourDepositProps = ComponentProps<'div'> & { vault: WrappedVault };
export function VaultYourDeposit({ className, vault }: VaultYourDepositProps) {
  const { t } = useTranslation();
  const userAddr = useUserAddr();
  if (vault.getUserDeposit(userAddr).eq(0)) {
    return null;
  }
  return (
    <div className={classNames('syn-vault-your-deposit', className)}>
      <span className="syn-vault-your-deposit-title">{t('launchpad.yourDeposit')}</span>
      <span className="syn-vault-your-deposit-amount">
        <span className="syn-vault-your-deposit-token">
          {vault.getUserDeposit(userAddr).formatNumberWithTooltip({
            isShowTBMK: true,
            suffix: ` ${vault.quoteToken.symbol}`,
          })}
        </span>
        <span className="syn-vault-your-deposit-usd">
          {vault.getUserDepositUSD(userAddr).formatNumberWithTooltip({
            isShowTBMK: true,
            prefix: '$',
          })}
        </span>
      </span>
    </div>
  );
}
