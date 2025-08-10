/**
 * @description Component-portfolio
 */
import './index.less';

import React, { FC, useCallback, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { PORTFOLIO_TAB_ITEMS } from '@/constants/portfolio';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';

import BlockedAlert from '@/components/Alert/BlockedAlert';
import { useMockDevTool } from '@/components/Mock';
import { useWrappedOrderListByUser } from '@/features/account/orderHook';
import { usePositionListByUser } from '@/features/account/positionHook';
import { useWrappedRangeListByUser } from '@/features/account/rangeHook';
import { useBackendChainConfig } from '@/features/config/hook';
import { useIsFetchedPortfolioList } from '@/features/portfolio/hook';
import { useWalletConnectStatus } from '@/features/wallet/hook';
import { useListenGateEvent } from '@/hooks/data/useListenEventOnWorker';
import { usePollingAccountsData } from '@/hooks/data/usePollingDataOnWorker';
import usePortfolioParams from '@/hooks/portfolio/usePortfolioParams';
import { WALLET_CONNECT_STATUS } from '@/types/wallet';
import { getChainShortName } from '@/utils/chain';
import { useTranslation } from 'react-i18next';
import SettleModal from '../components/SettleModal';
import AccountHistory from './AccountHistory';
import OpenOrders from './OpenOrders';
import PortfolioLiquidityTable from './PortfolioLiquidityTable';
import PortfolioOverview from './PortfolioOverview';
import PortfolioPositionTable from './PortfolioPositionTable';
import PortfolioSkeleton from './PortfolioSkeleton';
import PortfolioTabs from './PortfolioTabs';
import portfolioEmpty from './images/icon_empty_128.png';
interface IPropTypes {
  children?: React.ReactNode;
}
const Portfolio: FC<IPropTypes> = function ({}) {
  const { t } = useTranslation();
  const chainId = useChainId();
  const tab = usePortfolioParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const userAddr = useUserAddr();
  const dappConfig = useBackendChainConfig(chainId);
  const positions = usePositionListByUser(chainId, userAddr, false);
  const orders = useWrappedOrderListByUser(chainId, userAddr, false);
  const ranges = useWrappedRangeListByUser(chainId, userAddr, false);
  const { isMockSkeleton } = useMockDevTool();
  const isFetchedPortfolio = useIsFetchedPortfolioList(chainId, userAddr);
  const walletStatus = useWalletConnectStatus();

  usePollingAccountsData(chainId, userAddr);
  useListenGateEvent(chainId, userAddr);
  // const isAccountFetched = useIsFetchedPortfolioFromApi(chainId, userAddr);

  const isEmptyAccount = useMemo(() => {
    if (walletStatus === WALLET_CONNECT_STATUS.UN_CONNECT) return true;
    return !positions?.length && !orders?.length && !ranges?.length;
  }, [orders?.length, positions?.length, ranges?.length, walletStatus]);

  const isAccountLoading = useMemo(() => {
    if (!userAddr) return false;
    return isMockSkeleton || !isFetchedPortfolio;
  }, [isFetchedPortfolio, isMockSkeleton, userAddr]);

  const clickPlaceLimit = useCallback(
    (earn?: boolean, limit?: boolean) => {
      if (chainId && dappConfig) {
        const chainShortName = getChainShortName(chainId);
        if (earn) {
          navigate(`/earn/${chainShortName}/${dappConfig.trade.defaultPairSymbol}`);
        } else {
          navigate(`/trade/${chainShortName}/${dappConfig.trade.defaultPairSymbol}`, { state: { toLimitTab: limit } });
        }
      }
    },
    [chainId, dappConfig, navigate],
  );
  const pageContent = useMemo(() => {
    switch (tab) {
      case PORTFOLIO_TAB_ITEMS.HISTORY:
        return <AccountHistory />;
      default:
        return isAccountLoading ? (
          <PortfolioSkeleton />
        ) : (
          <>
            {isEmptyAccount ? (
              <div className="syn-portfolio-content-empty">
                <img src={portfolioEmpty} />
                <div className="syn-portfolio-content-empty-bottom">
                  <a onClick={() => clickPlaceLimit()}>{t('common.portfolio.makeTrade')}</a>/
                  <a onClick={() => clickPlaceLimit(false, true)}>{t('common.portfolio.placeOrder')}</a>/
                  <a onClick={() => clickPlaceLimit(true)}>{t('common.portfolio.addLiq')}</a>
                </div>
              </div>
            ) : (
              <div className="syn-portfolio-tab-page-content">
                <PortfolioPositionTable />
                <OpenOrders />
                <PortfolioLiquidityTable />
              </div>
            )}
          </>
        );
    }
  }, [clickPlaceLimit, isAccountLoading, isEmptyAccount, t, tab]);

  useEffect(() => {
    if (dappConfig?.trade?.isDisableLimitOrder && pathname === '/portfolio/order') {
      navigate('/portfolio', { replace: true });
    }
  }, [dappConfig?.trade?.isDisableLimitOrder, navigate, pathname]);

  return (
    <div className="syn-portfolio-page">
      <BlockedAlert style={{ marginTop: -8, marginBottom: 0 }} />
      <PortfolioOverview />
      <div className="syn-portfolio-content-wrap">
        <PortfolioTabs />
        <div className="syn-portfolio-content">{pageContent}</div>
        <SettleModal />
      </div>
      {/* <TvlModal /> */}
    </div>
  );
};

export default Portfolio;
