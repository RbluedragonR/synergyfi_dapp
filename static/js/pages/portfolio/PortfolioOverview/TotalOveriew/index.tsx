/**
 * @description Component-TotalValues
 */
import './index.less';

import Card from '@/components/Card';
import { useWalletConnectStatus } from '@/features/wallet/hook';
import UnconnectedCard from '@/pages/components/UnconnectedCard';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import ChainTagIcon from '@/assets/svg/icons/chainTag';
import { useMockDevTool } from '@/components/Mock';
import { useUserIsFetchedGateBalanceList } from '@/features/balance/hook';
import { useIsFetchedPortfolioList } from '@/features/portfolio/hook';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { WALLET_CONNECT_STATUS } from '@/types/wallet';
import TotalPnLChart from './PieChartWithTexts/TotalPnLChart';
import TotalValueChart from './PieChartWithTexts/TotalValueChart';
import TotalVolumeChart from './PieChartWithTexts/TotalVolumeChart';
import TotalOveriewSkeleton from './Skeleton';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}

const TotalOverview: FC<IPropTypes> = function ({}) {
  const { t } = useTranslation();
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const walletConnectStatus = useWalletConnectStatus();
  const { isMockSkeleton } = useMockDevTool();

  const isFetchedPortfolio = useIsFetchedPortfolioList(chainId, userAddr);
  const isFetchedGateBalance = useUserIsFetchedGateBalanceList(chainId, userAddr);

  const statusIsLoading = useMemo(() => {
    return isMockSkeleton || !isFetchedPortfolio || !isFetchedGateBalance;
  }, [isFetchedGateBalance, isFetchedPortfolio, isMockSkeleton]);

  return (
    <>
      <UnconnectedCard />
      {walletConnectStatus !== WALLET_CONNECT_STATUS.UN_CONNECT && (
        <Card className="syn-total-values">
          <h1 className="syn-total-values-title">
            {t('common.overview')}
            <ChainTagIcon chainId={chainId} />
          </h1>
          {statusIsLoading ? (
            <TotalOveriewSkeleton />
          ) : (
            <div className="syn-total-values-content">
              <div className="syn-total-values-chart-container">
                <TotalValueChart chainId={chainId} userAddr={userAddr} statusIsLoading={statusIsLoading} />
              </div>

              <div className="syn-total-values-content-right">
                <div className="syn-total-values-chart-container">
                  <TotalPnLChart chainId={chainId} userAddr={userAddr} statusIsLoading={statusIsLoading} />
                </div>

                <div className="syn-total-values-chart-container">
                  <TotalVolumeChart chainId={chainId} userAddr={userAddr} statusIsLoading={statusIsLoading} />
                </div>
              </div>
            </div>
          )}
        </Card>
      )}
    </>
  );
};

export default TotalOverview;
