/**
 * @description Component-trader
 */
import './index.less';

import { useTraderOverview } from '@/features/referral/query';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { FC } from 'react';
import TraderBindKol from './TraderBindKol';
import TraderDetail from './TraderDetail';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const Trader: FC<IPropTypes> = function ({}) {
  const userAddr = useUserAddr();
  const chainId = useChainId();
  const { data, isFetched } = useTraderOverview(chainId, userAddr);
  return (
    <div className="syn-trader">
      <div className="syn-trader__connected">
        {(!data?.inviterReferralCode && isFetched) || !userAddr ? <TraderBindKol /> : <TraderDetail />}
      </div>
    </div>
  );
};

export default Trader;
