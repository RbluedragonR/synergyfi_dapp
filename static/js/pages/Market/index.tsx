/**
 * @description Component-Market
 */
import './index.less';

import React, { FC } from 'react';

import BlockedAlert from '@/components/Alert/BlockedAlert';
import MarketBanner from '../components/Overview';
import MarketTrends from './MarketTrends';
import TradingPairs from './TradingPairs';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const Market: FC<IPropTypes> = function ({}) {
  return (
    <div className="syn-market">
      <BlockedAlert />
      <MarketBanner />
      <div className="syn-market-list">
        <TradingPairs />
        <MarketTrends />
      </div>
    </div>
  );
};

export default Market;
