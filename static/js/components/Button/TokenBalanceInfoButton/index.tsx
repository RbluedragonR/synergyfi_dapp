import TokenLogo from '@/components/TokenLogo';
import PortfolioAssetWithdrawLimit from '@/pages/portfolio/PortfolioOverview/PortfolioAsset/PortfolioAssetWithdrawLimit';
import { IAssetsBalance } from '@/types/assets';
import classNames from 'classnames';
import { ComponentProps } from 'react';
import './index.less';

type TokenBalanceInfoButtonProps = {
  assetBalance?: IAssetsBalance;
} & ComponentProps<'button'>;

export default function TokenBalanceInfoButton({ assetBalance, ...props }: TokenBalanceInfoButtonProps): JSX.Element {
  const tokenInfo = assetBalance?.quote;
  if (!assetBalance) return <></>;
  const usdValue = assetBalance.gateBalance?.mul(assetBalance.quote.price || 0);
  return (
    <button {...props} className={classNames('syn-token-balance-info-btn', props.className)}>
      <div className="top">
        <TokenLogo className="token-logo" token={tokenInfo} size={16} />
        <span className="token-symbol-label">{tokenInfo?.symbol}</span>
        <PortfolioAssetWithdrawLimit isCurrentAsset={true} quote={assetBalance.quote} />
      </div>
      <div className="bottom">
        <div className="bold-token-value">
          {assetBalance.gateBalance?.formatNumberWithTooltip({ isShowTBMK: true })}
        </div>
        <div className="usd-value">{usdValue?.formatNumberWithTooltip({ isShowTBMK: true, prefix: '$' })}</div>
      </div>
    </button>
  );
}
