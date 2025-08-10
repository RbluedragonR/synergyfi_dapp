/**
 * @description Component-EpochRank
 */
import './index.less';

import { FC, useMemo } from 'react';

import { rankSrcList } from '@/utils/image';
import { formatNumber } from '@/utils/numberUtil';
import classNames from 'classnames';

interface IPropTypes {
  className?: string;
  rank: number;
}
const EpochRank: FC<IPropTypes> = function ({ rank }) {
  const rankIcon = useMemo(() => rankSrcList[rank - 1], [rank]);
  return (
    <div className={classNames('syn-epoch-rank')}>
      {rankIcon ? (
        <img width={24} height={24} src={rankIcon} />
      ) : (
        <span className="number"> {!rank || rank < 1000 ? formatNumber(rank, 0) : '-'}</span>
      )}
    </div>
  );
};

export default EpochRank;
