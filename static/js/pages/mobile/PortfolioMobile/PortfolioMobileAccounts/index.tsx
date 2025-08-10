/**
 * @description Component-PortfolioMobileAccounts
 */
import './index.less';

import React, { FC, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import Alert from '@/components/Alert';
import Empty from '@/components/Empty';
import TokenLogo from '@/components/TokenLogo';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useFetchWithdrawPendings, useUserAllPendingTokens } from '@/features/portfolio/hook';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import DepositButton from '@/pages/components/Portfolio/Vault/AccountButtons/Deposit';
import WithdrawButton from '@/pages/components/Portfolio/Vault/AccountButtons/Withdraw';
import { useAssetsBalanceList } from '@/pages/portfolio/Assets/hooks/assetsHook';

import { useUserIsFetchedGateBalanceList } from '@/features/balance/hook';
import PortfolioMobileAccountSkeleton from './PortfolioMobileAccountSkeleton';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const PortfolioMobileAccounts: FC<IPropTypes> = function () {
  const { t } = useTranslation();
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const filteredAssets = useAssetsBalanceList(chainId, userAddr, undefined, true);
  const pendingTokens = useUserAllPendingTokens(chainId, userAddr);
  const isFetchedGateBalance = useUserIsFetchedGateBalanceList(chainId, userAddr);

  useFetchWithdrawPendings(chainId, userAddr);

  const isShowWithdrawAlert = useMemo(() => {
    return pendingTokens && pendingTokens.length > 0 && pendingTokens.some((token) => token.pending?.amount?.gt(0));
  }, [pendingTokens]);

  const tokenAndAmounts = useMemo(() => {
    if (isShowWithdrawAlert) {
      if (pendingTokens && pendingTokens.length) {
        return pendingTokens
          .filter((asset) => asset.pending?.amount?.gt(0))
          .map((asset) => {
            return `${WrappedBigNumber.from(asset.pending.amount || 0)?.formatDisplayNumber()} ${asset.symbol}`;
          })
          .join(', ');
      }
    }

    return '';
  }, [pendingTokens, isShowWithdrawAlert]);

  return (
    <div className="syn-portfolio-mobile-accounts">
      {!isFetchedGateBalance && !filteredAssets.length && <PortfolioMobileAccountSkeleton />}

      {filteredAssets.map((asset) => (
        <div key={asset.quote.address} className="syn-portfolio-mobile-accounts-asset">
          <div className="syn-portfolio-mobile-accounts-asset-token">
            <TokenLogo token={asset.quote} size={32} />
            <div className="syn-portfolio-mobile-accounts-asset-token-right">
              <div className="syn-portfolio-mobile-accounts-asset-token-right-symbol">{asset.quote.symbol}</div>
              <div className="syn-portfolio-mobile-accounts-asset-token-right-price">
                {asset.gateBalance?.formatPriceNumberWithTooltip({ isShowTBMK: true })}
              </div>
            </div>
          </div>
          <div className="syn-portfolio-mobile-accounts-asset-btns">
            <DepositButton quote={asset.quote} btnProps={{ className: 'syn-portfolio-mobile-accounts-asset-btn' }} />
            <WithdrawButton quote={asset.quote} btnProps={{ className: 'syn-portfolio-mobile-accounts-asset-btn' }} />
          </div>
        </div>
      ))}
      {isShowWithdrawAlert && (
        <div className="syn-portfolio-mobile-accounts-alert">
          <Alert
            message={
              <Trans
                t={t}
                i18nKey={'common.portfolio.withdrawLimit.mobileTip'}
                values={{
                  tokenAndAmounts: tokenAndAmounts,
                }}
                components={{ b: <b /> }}
              />
            }
            type="info"
            showIcon
          />
        </div>
      )}
      {isFetchedGateBalance && !filteredAssets.length && <Empty type="vertical" />}
    </div>
  );
};

export default PortfolioMobileAccounts;
