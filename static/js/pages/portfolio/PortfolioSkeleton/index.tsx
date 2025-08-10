/**
 * @description Component-PortfolioSkeleton
 */
import { Skeleton } from '@/components/Skeleton';
import './index.less';

import { FC } from 'react';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const PortfolioSkeleton: FC<IPropTypes> = function ({}) {
  return (
    <div className="syn-portfolio-skeleton">
      <Skeleton active={true} paragraph={{ rows: 3 }} />
      <Skeleton active={true} paragraph={{ rows: 3 }} />
    </div>
  );
};

export default PortfolioSkeleton;
