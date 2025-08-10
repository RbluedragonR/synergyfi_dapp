/**
 * @description Component-PortfolioMobileOrdersSkeleton
 */
import './index.less';

import { Skeleton as AntSkeleton } from 'antd';
import React, { FC, useMemo } from 'react';

import { Skeleton } from '@/components/Skeleton';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const PortfolioMobileAccountSkeleton: FC<IPropTypes> = function () {
  const items = useMemo(() => new Array(12).fill(0), []);
  return (
    <div className="syn-portfolio-mobile-account-skeleton">
      {items.map((_value, index) => (
        <div className="syn-portfolio-mobile-account-skeleton-item" key={index}>
          <div className="syn-portfolio-mobile-account-skeleton-item-left">
            <AntSkeleton.Avatar active={true} />
            <Skeleton paragraph={{ rows: 1 }} active={true} />
          </div>
          <div className="syn-portfolio-mobile-account-skeleton-item-right">
            <Skeleton active={true} paragraph={false} />
            <Skeleton active={true} paragraph={false} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default PortfolioMobileAccountSkeleton;
