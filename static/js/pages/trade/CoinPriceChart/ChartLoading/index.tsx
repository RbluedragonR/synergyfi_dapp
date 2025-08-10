/**
 * @description Component-ChartLoading
 */
import './index.less';

import React, { FC } from 'react';

import tradeChartBg from './assets/trade_chart_bg.png';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  isLoading: boolean;
}
const ChartLoading: FC<IPropTypes> = function ({ children, isLoading }) {
  if (!isLoading) return <>{children}</>;
  return (
    <div className="syn-chart-loading">
      <img src={tradeChartBg} alt="bg" />
    </div>
  );
};

export default ChartLoading;
