/**
 * @description Component-TGPLeaderBoardTableSkeleton
 */
import './index.less';

import { Skeleton as AntSkeleton } from 'antd';
import classNames from 'classnames';
import { FC } from 'react';

import { Skeleton } from '@/components/Skeleton';
import { TGP_TYPE } from '@/constants/tgp';
import { useTGPType } from '@/features/tgp/hooks';
interface IPropTypes {
  className?: string;
}
const TGPLeaderBoardTableSkeleton: FC<IPropTypes> = function ({}) {
  const type = useTGPType();
  const list = new Array(10).fill(0);
  return (
    <div className="syn-t-gPLeader-board-table-skeleton">
      {list.map((_, index) => (
        <div key={index} className="syn-t-gPLeader-board-table-skeleton-row">
          <AntSkeleton.Avatar
            className="syn-t-gPLeader-board-table-skeleton-row-item rank"
            size={16}
            active
            shape="circle"
          />
          {type === TGP_TYPE.MASTER && (
            <div className="syn-t-gPLeader-board-table-skeleton-row-item trader">
              <Skeleton active paragraph={false} />
              <Skeleton active paragraph={false} />
            </div>
          )}
          <Skeleton
            className={classNames('syn-t-gPLeader-board-table-skeleton-row-item week', {
              master: type === TGP_TYPE.MASTER,
              open: type === TGP_TYPE.OPEN_1,
            })}
            active
            paragraph={false}
          />
          <Skeleton
            className={classNames('syn-t-gPLeader-board-table-skeleton-row-item week', {
              master: type === TGP_TYPE.MASTER,
              open: type === TGP_TYPE.OPEN_1,
            })}
            active
            paragraph={false}
          />
          <Skeleton
            className={classNames('syn-t-gPLeader-board-table-skeleton-row-item week', {
              master: type === TGP_TYPE.MASTER,
              open: type === TGP_TYPE.OPEN_1,
            })}
            active
            paragraph={false}
          />
          <Skeleton
            className={classNames('syn-t-gPLeader-board-table-skeleton-row-item week', {
              master: type === TGP_TYPE.MASTER,
              open: type === TGP_TYPE.OPEN_1,
            })}
            active
            paragraph={false}
          />
          <Skeleton active className="syn-t-gPLeader-board-table-skeleton-row-item prize" paragraph={false} />
        </div>
      ))}
    </div>
  );
};

export default TGPLeaderBoardTableSkeleton;
