import { Skeleton } from 'antd';
import classNames from 'classnames';
import './index.less';
function TotalOveriewSkeletonItem({ isBig = false }: { isBig?: boolean }): JSX.Element {
  return (
    <div className={classNames('syn-total-overiew-skeleton-item', isBig && 'big')}>
      <Skeleton className="avatar" title={false} active paragraph={false} avatar />
      {isBig && <div className="big-circle" />}
      <div className="syn-total-overiew-skeleton-item-right">
        <Skeleton className="top" active paragraph={false} />
        <Skeleton className="bottom" active paragraph={false} />
      </div>
    </div>
  );
}

export default function TotalOveriewSkeleton(): JSX.Element {
  return (
    <div className="syn-total-overiew-skeleton">
      <TotalOveriewSkeletonItem isBig />
      <div className="syn-total-overiew-skeleton-right">
        {/* <TotalOveriewSkeletonItem /> */}
        <TotalOveriewSkeletonItem />
      </div>
    </div>
  );
}
