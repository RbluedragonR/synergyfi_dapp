/**
 * @description Component-ITGPOpenWeek
 */
import './index.less';

import classNames from 'classnames';
import { isNil } from 'lodash';
import React, { FC } from 'react';

import { EmptyDataWrap } from '@/components/EmptyDataWrap';
import { formatNumberWithTooltip } from '@/components/NumberFormat';
import { Tooltip } from '@/components/ToolTip';
import { TGP_TYPE } from '@/constants/tgp';
import { useCurrentTGPWeek, useTGPType } from '@/features/tgp/hooks';
import { useUserAddr } from '@/hooks/web3/useChain';
import { ReactComponent as ListLeftIcon } from '@/pages/TGP/assets/svg/list_self_left.svg';
import { ReactComponent as ListLeftIconD } from '@/pages/TGP/assets/svg/list_self_left_dark.svg';
import { ReactComponent as ListRightIcon } from '@/pages/TGP/assets/svg/list_self_right.svg';
import { ReactComponent as ListRightIconD } from '@/pages/TGP/assets/svg/list_self_right_dark.svg';
import { IOpenWeek } from '@/types/tgp';
import { shortenAddress } from '@/utils/address';

import { THEME_ENUM } from '@/constants';
import { useTheme } from '@/features/global/hooks';
import RankProfileImg from '../../components/RankProfileImg';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  week: IOpenWeek | undefined;
  index: number;
  realRank: number;
}
const TGPOpenWeek: FC<IPropTypes> = function ({ week, index, realRank }) {
  const userAddr = useUserAddr();
  const tgpType = useTGPType();
  const currentWeek = useCurrentTGPWeek();
  const theme = useTheme();
  return (
    <div
      className={classNames('syn-t-gPLeader-board-table-body-row-item week public', {
        active: week?.userId.toLowerCase() === userAddr?.toLowerCase(),
        current: index === currentWeek,
      })}>
      {theme.dataTheme === THEME_ENUM.DARK ? (
        <>
          <ListLeftIconD className="icon left" />
          <ListRightIconD className="icon right" />
        </>
      ) : (
        <>
          <ListLeftIcon className="icon left" />
          <ListRightIcon className="icon right" />
        </>
      )}
      <div className="trader-profile">
        <EmptyDataWrap isLoading={!week?.userId}>
          <RankProfileImg userId={week?.userId} isOpen={true} realRank={realRank} imgUrl={week?.profileImgUrl} />
          <div className="name">
            <Tooltip>{shortenAddress(week?.userId || '', true)}</Tooltip>
          </div>
        </EmptyDataWrap>
      </div>
      <div>
        <EmptyDataWrap
          isLoading={!week?.userId || tgpType === TGP_TYPE.OPEN_1 ? isNil(week?.PnL) : isNil(week?.volume)}>
          {formatNumberWithTooltip({
            num: (tgpType === TGP_TYPE.OPEN_1 ? (week?.PnL ? (week?.PnL || 0) / 1e18 : '') : week?.volume) || '',
            isShowTBMK: tgpType === TGP_TYPE.OPEN_2,
            prefix: '$',
          })}
        </EmptyDataWrap>
      </div>
    </div>
  );
};

export default TGPOpenWeek;
