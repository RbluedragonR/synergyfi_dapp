/**
 * @description Component-TGPLuckyDrawWinners
 */
import './index.less';

import classNames from 'classnames';
import _ from 'lodash';
import { FC, useEffect, useMemo } from 'react';

import { getTGPLuckyDrawWinners } from '@/features/tgp/actions';
import { useCurrentLuckyWeekWinners, useSelectedLuckyWeek, useTGPUser } from '@/features/tgp/hooks';
import { useAppDispatch } from '@/hooks';
import { useUserAddr } from '@/hooks/web3/useChain';
import { ReactComponent as TriangleIcon } from '@/pages/TGP/assets/svg/lucky_draw_triangle.svg';

import TGPName from '../../components/TGPName';

interface IPropTypes {
  className?: string;
}
const TGPLuckyDrawWinners: FC<IPropTypes> = function ({}) {
  const selectedWeek = useSelectedLuckyWeek();
  const luckyWinners = useCurrentLuckyWeekWinners(selectedWeek);
  const dispatch = useAppDispatch();
  const userAddr = useUserAddr();
  const user = useTGPUser(userAddr);
  const currentWeekState = useMemo(
    () => _.find(user?.luckyDraws, (draw) => draw.week === selectedWeek),
    [selectedWeek, user?.luckyDraws],
  );
  useEffect(() => {
    userAddr && dispatch(getTGPLuckyDrawWinners({ userAddr }));
  }, [dispatch]);
  if (!luckyWinners?.length) {
    return null;
  }
  return (
    <div className="syn-t-gPLucky-draw-winners">
      <TriangleIcon className={classNames('syn-t-gPLucky-draw-winners-triangle', `active-${selectedWeek}`)} />
      {luckyWinners?.map((winner) => (
        <div
          key={winner.ticket}
          className={classNames('syn-t-gPLucky-draw-winners-winner', {
            active: winner?.ticket === currentWeekState?.ticket,
          })}>
          <div className="syn-t-gPLucky-draw-winners-winner-number">{winner.ticket}</div>
          <div className={classNames('syn-t-gPLucky-draw-winners-winner-profile')}>
            <TGPName showTooltip={false} ellipsisWidth={68} size={16} userAddr={winner.userId} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default TGPLuckyDrawWinners;
