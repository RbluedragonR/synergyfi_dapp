/**
 * @description Component-PortfolioMobile
 */
import './index.less';

import React, { FC, useState } from 'react';

import { PORTFOLIO_TAB_ITEMS } from '@/constants/portfolio';
import SettleModal from '@/pages/components/SettleModal';

import { useListenGateEvent } from '@/hooks/data/useListenEventOnWorker';
import { usePollingAccountsData } from '@/hooks/data/usePollingDataOnWorker';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import PortfolioMobileAccounts from './PortfolioMobileAccounts';
import PortfolioMobileLiquidities from './PortfolioMobileLiquidities';
import PortfolioMobileOrders from './PortfolioMobileOrders';
import PortfolioMobilePositions from './PortfolioMobilePositions';
import PortfolioMobileTabs from './PortfolioMobileTabs';
import PortfolioMobileTotalValues from './PortfolioMobileTotalValues';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const PortfolioMobile: FC<IPropTypes> = function () {
  const [tab, setTab] = useState<PORTFOLIO_TAB_ITEMS>();
  const chainId = useChainId();
  const userAddr = useUserAddr();
  usePollingAccountsData(chainId, userAddr);
  useListenGateEvent(chainId, userAddr);

  return (
    <div className="syn-portfolio-mobile">
      <PortfolioMobileTotalValues />
      <PortfolioMobileTabs onTabChange={setTab} />
      {tab === PORTFOLIO_TAB_ITEMS.POSITION && <PortfolioMobilePositions />}
      {tab === PORTFOLIO_TAB_ITEMS.ORDER && <PortfolioMobileOrders />}
      {tab === PORTFOLIO_TAB_ITEMS.ACCOUNT && <PortfolioMobileAccounts />}
      {tab === PORTFOLIO_TAB_ITEMS.LIQUIDITY && <PortfolioMobileLiquidities />}
      <SettleModal />
      {/* <TvlModal /> */}
    </div>
  );
};

export default PortfolioMobile;
