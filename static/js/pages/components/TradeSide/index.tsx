/**
 * @description Component-TradeSide
 */
import './index.less';

import { Side } from '@synfutures/sdks-perp';
import React, { FC } from 'react';

import { useMediaQueryDevice } from '@/components/MediaQuery';
import Tag from '@/components/Tag';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  side: Side;
  noBg?: boolean;
}
const TradeSide: FC<IPropTypes> = function ({ side, noBg: noTag }) {
  const { deviceType } = useMediaQueryDevice();
  if (side === Side.FLAT) {
    return null;
  }
  return (
    <div className={`syn-trade-side ${noTag ? 'plain' : ''} ${deviceType}`}>
      <Tag bordered={false} color={side === Side.LONG ? 'success' : 'error'}>
        {side === Side.LONG ? 'LONG' : 'SHORT'}
      </Tag>
    </div>
  );
};

export default TradeSide;
