/**
 * @description Component-TGPMasterWeek
 */
import './index.less';

import classNames from 'classnames';
import React, { FC } from 'react';

import { EmptyDataWrap } from '@/components/EmptyDataWrap';
import { formatNumberWithTooltip } from '@/components/NumberFormat';
import { useCurrentTGPWeek } from '@/features/tgp/hooks';
import { IMasterWeek } from '@/types/tgp';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  week: IMasterWeek | undefined;
  index: number;
}
const TGPMasterWeek: FC<IPropTypes> = function ({ week, index }) {
  const currentWeek = useCurrentTGPWeek();
  return (
    <div
      className={classNames('syn-t-gPLeader-board-table-body-row-item week', {
        current: index === currentWeek,
      })}>
      <>
        <EmptyDataWrap isLoading={!week?.scores}>{week?.scores || 0}</EmptyDataWrap>
        <EmptyDataWrap isLoading={week?.PnL === undefined || week?.PnL === null}>
          {formatNumberWithTooltip({
            num: week?.PnL ? (week?.PnL || 0) / 1e18 : '',
          })}
        </EmptyDataWrap>
      </>
    </div>
  );
};

export default TGPMasterWeek;
