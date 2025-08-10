/**
 * @description Component-PortfolioMobileValueSkeleton
 */
// eslint-disable-next-line simple-import-sort/imports
import { Skeleton } from '@/components/Skeleton';
import './index.less';

import React, { FC } from 'react';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const PortfolioMobileValueSkeleton: FC<IPropTypes> = function () {
  return (
    <div className="syn-portfolio-mobile-value-skeleton">
      <Skeleton paragraph={false} active={true} />
      <Skeleton paragraph={false} active={true} />
    </div>
  );
};

export default PortfolioMobileValueSkeleton;
