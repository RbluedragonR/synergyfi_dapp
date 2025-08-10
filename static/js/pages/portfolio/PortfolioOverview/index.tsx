/**
 * @description Component-PorfolioOverview
 */
import './index.less';

import React, { FC } from 'react';

import { useFetchFundFlows, useFetchWithdrawPendings } from '@/features/portfolio/hook';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';

import { useAssetsBalanceList } from '../Assets/hooks/assetsHook';
import PortfolioAsset from './PortfolioAsset';
import PortfolioEmpty from './PortfolioEmpty';
import TotalOverview from './TotalOveriew';
interface IPropTypes {
  children?: React.ReactNode;
}
const PortfolioOverview: FC<IPropTypes> = function ({}) {
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const filteredAssets = useAssetsBalanceList(chainId, userAddr, undefined, true);
  useFetchWithdrawPendings(chainId, userAddr);
  useFetchFundFlows(chainId, userAddr);

  return (
    <div className="syn-portfolio-overview">
      <TotalOverview />
      <PortfolioEmpty>
        <PortfolioAsset assetBalanceList={filteredAssets} userAddr={userAddr} chainId={chainId} />
      </PortfolioEmpty>
    </div>
  );
};

export default PortfolioOverview;
