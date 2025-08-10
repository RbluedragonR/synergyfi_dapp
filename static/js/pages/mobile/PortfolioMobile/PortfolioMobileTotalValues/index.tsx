/**
 * @description Component-PortfolioMobileTotalValues
 */
import './index.less';

import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { EmptyDataWrap } from '@/components/EmptyDataWrap';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { useAssetsTotalsInUsd } from '@/pages/portfolio/Assets/hooks/assetsHook';

import { useMockDevTool } from '@/components/Mock';
import { useUserIsFetchedGateBalanceList } from '@/features/balance/hook';
import { useIsFetchedPortfolioList } from '@/features/portfolio/hook';
import { useIsBlacklistedFromStore } from '@/features/user/hooks';
import PortfolioMobileValueSkeleton from './PortfolioMobileValueSkeleton';
interface IPropTypes {
  className?: string;
}
const PortfolioMobileTotalValues: FC<IPropTypes> = function () {
  const { t } = useTranslation();
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const totals = useAssetsTotalsInUsd(chainId, userAddr);
  const isBlacklisted = useIsBlacklistedFromStore();
  const isFetchedPortfolio = useIsFetchedPortfolioList(chainId, userAddr);
  const isFetchedGateBalance = useUserIsFetchedGateBalanceList(chainId, userAddr);
  const { isMockSkeleton } = useMockDevTool();

  const statusIsLoading = useMemo(() => {
    return isMockSkeleton || !isFetchedPortfolio || !isFetchedGateBalance;
  }, [isFetchedGateBalance, isFetchedPortfolio, isMockSkeleton]);
  return (
    <div className="syn-portfolio-mobile-total-values">
      {isBlacklisted && <div className="syn-violation-account-text-PMV">{t('common.violationAccount')}</div>}
      {statusIsLoading ? (
        <PortfolioMobileValueSkeleton />
      ) : (
        <div className="syn-portfolio-mobile-total-values-value">
          <EmptyDataWrap isLoading={statusIsLoading}>
            ≈ {totals.totalValue?.formatNumberWithTooltip({ prefix: '$', isShowTBMK: true })}
          </EmptyDataWrap>
        </div>
      )}

      <div className="syn-portfolio-mobile-total-values-title">{t('mobile.portfolio.totalV')}</div>
    </div>
  );
};

export default PortfolioMobileTotalValues;
