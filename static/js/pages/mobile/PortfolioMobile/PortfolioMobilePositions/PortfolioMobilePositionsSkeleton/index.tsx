/**
 * @description Component-PortfolioMobilePositionsSkeleton
 */
import './index.less';

import { Skeleton as AntSkeleton } from 'antd';
import React, { FC, useMemo } from 'react';

import { Skeleton } from '@/components/Skeleton';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const PortfolioMobilePositionsSkeleton: FC<IPropTypes> = function () {
  const items = useMemo(() => new Array(12).fill(0), []);
  return (
    <div className="syn-portfolio-mobile-positions-skeleton">
      {items.map((_val, index) => (
        <div key={index} className="syn-portfolio-mobile-positions-skeleton-item">
          <div className="syn-portfolio-mobile-positions-skeleton-item-top">
            <div className="syn-portfolio-mobile-positions-skeleton-item-top-left">
              <AntSkeleton.Avatar active={true} shape="circle" />
              <Skeleton active={true} paragraph={false} className="right" />
            </div>
            <Skeleton active={true} paragraph={false} className="right" />
          </div>
          <div className="syn-portfolio-mobile-positions-skeleton-item-bottom">
            <Skeleton active={true} paragraph={false} />
            <Skeleton active={true} paragraph={false} />
            <Skeleton active={true} paragraph={false} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default PortfolioMobilePositionsSkeleton;
