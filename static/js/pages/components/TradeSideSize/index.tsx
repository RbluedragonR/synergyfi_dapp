/**
 * @description Component-TradeSide
 */
import './index.less';

import { Side } from '@synfutures/sdks-perp';
import React, { FC } from 'react';

import { useMediaQueryDevice } from '@/components/MediaQuery';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  side: Side;
  size: React.ReactNode;
  quoteSize?: React.ReactNode;
  noBg?: boolean;
  vertical?: boolean;
}
const TradeSideSize: FC<IPropTypes> = function ({ vertical, size, quoteSize, side, noBg: noTag }) {
  const { deviceType } = useMediaQueryDevice();
  if (side === Side.FLAT) {
    return null;
  }
  return (
    <div
      className={`syn-trade-side-size ${noTag ? 'plain' : ''} ${side === Side.LONG ? 'LONG' : 'SHORT'} ${deviceType} ${
        vertical ? 'vertical' : ''
      }`}>
      <div className="syn-trade-side-size-left" />
      <div className={`syn-trade-side-size-container ${vertical ? 'vertical' : ''}`}>
        {size}
        <div className="syn-trade-side-size-bottom">{quoteSize}</div>
      </div>
    </div>
  );
};

export default TradeSideSize;
