import { WrappedVault } from '@/entities/WrappedVault';
import { useUserAddr } from '@/hooks/web3/useChain';
import classNames from 'classnames';
import { ComponentProps, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import './index.less';
type VaultMetaCardProps = ComponentProps<'div'> & { vault: WrappedVault; showTvl?: boolean };

// const HorizontalText = ({ title, value }: { title: ReactNode; value: ReactNode }) => {
//   return (
//     <div className="syn-vault-meta-horizontal-text">
//       <span className="title">{title}</span>
//       <span className="value">{value}</span>
//     </div>
//   );
// };
export const VerticalText = ({
  title,
  value,
  usdValue,
}: {
  title: ReactNode;
  value: ReactNode;
  usdValue?: ReactNode;
}) => {
  return (
    <div className="syn-vault-meta-vertical-text">
      <span className="title">{title}</span>
      <span className="value">
        <span className="token">{value}</span>
        {usdValue && <span className="usd">{usdValue}</span>}
      </span>
    </div>
  );
};
export default function VaultMetaCard({ className, vault, showTvl = true, ...others }: VaultMetaCardProps) {
  const { t } = useTranslation();
  const userAddr = useUserAddr();
  if (vault.getUserDeposit(userAddr)?.eq(0) && vault.getUserAllTimeEarned(userAddr).lte(0)) {
    return null;
  }
  return (
    <div className={classNames('syn-vault-meta-card-wrapper', className)} {...others}>
      {showTvl && (
        <div className="syn-vault-meta-card">
          <VerticalText
            title={t('launchpad.tvl')}
            value={vault.tvl.formatNumberWithTooltip({
              isShowTBMK: true,
              suffix: ` ${vault.quoteToken.symbol}`,
            })}
            usdValue={vault.tvlUSD.formatNumberWithTooltip({
              isShowTBMK: true,
              prefix: '$',
            })}
          />
        </div>
      )}
      <div className="syn-vault-meta-card">
        {!vault.getUserDeposit(userAddr)?.eq(0) && (
          <VerticalText
            title={t('launchpad.yourDeposit')}
            value={vault.getUserDeposit(userAddr).formatNumberWithTooltip({
              isShowTBMK: true,
              suffix: ` ${vault.quoteToken.symbol}`,
            })}
            usdValue={vault.getUserDepositUSD(userAddr).formatNumberWithTooltip({
              isShowTBMK: true,
              prefix: '$',
            })}
          />
        )}
        {/* {vault.getUserAllTimeEarned(userAddr).lte(0) ? null : (
          <VerticalText
            title={t('launchpad.yourAllTimeEarned')}
            value={vault.getUserAllTimeEarned(userAddr).formatNumberWithTooltip({
              isShowTBMK: true,
              suffix: ` ${vault.quoteToken.symbol}`,
            })}
            usdValue={vault.getUserAllTimeEarnedUSD(userAddr).formatNumberWithTooltip({
              isShowTBMK: true,
              prefix: '$',
            })}
          />
        )}
        <VaultOOPointsDropDown vault={vault} /> */}
      </div>
    </div>
  );
}
