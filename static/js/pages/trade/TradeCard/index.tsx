/**
 * @description Component-TradeForm
 */
import './index.less';

import React, { FC } from 'react';

import BuildOnNetworkCard from '@/pages/components/BuildOnNetworkCard';
import TradeForm from './TradeForm';
interface IPropTypes {
  children?: React.ReactNode;
}
const TradeCard: FC<IPropTypes> = function ({}) {
  return (
    <div className="syn-trade-card">
      <TradeForm />
      <BuildOnNetworkCard />
      {/* <OdysseyRewardsCard /> */}
    </div>
  );
};

export default TradeCard;
