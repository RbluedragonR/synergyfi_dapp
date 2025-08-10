import './index.less';

import { Skeleton as AntSkeleton, Skeleton as AntSkeletonButton, SkeletonProps } from 'antd';
import classNames from 'classnames';

export function Skeleton({ className, ...props }: SkeletonProps): JSX.Element {
  return <AntSkeleton {...props} className={classNames('syn-skeleton', className)} />;
}

export function SkeletonButton({
  className,
  style,
  width = 56,
  height = 16,
  ...props
}: SkeletonProps & { width?: number; height?: number }): JSX.Element {
  return (
    <AntSkeletonButton.Button
      className={classNames('syn-skeleton-button', className)}
      style={{ width, height, borderRadius: '75px', ...style }}
      active
      {...props}
    />
  );
}
