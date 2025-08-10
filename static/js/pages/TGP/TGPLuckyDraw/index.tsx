/**
 * @description Component-TGPLuckyDraw
 */
import './index.less';

import React, { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { getTGPLuckyDrawWinners } from '@/features/tgp/actions';
import { useTGPUser } from '@/features/tgp/hooks';
import { useAppDispatch } from '@/hooks';
import { useUserAddr } from '@/hooks/web3/useChain';
import { ReactComponent as IconLucky } from '@/pages/TGP/assets/svg/icon_title_lucky.svg';
import { ReactComponent as IconDecor } from '@/pages/TGP/assets/svg/title_decor.svg';
import { TGP_USER_STATUS } from '@/types/tgp';

import TGPLuckyDrawEmpty from './TGPLuckyDrawEmpty';
import TGPLuckyDrawModal from './TGPLuckyDrawModal';
import TGPLuckyDrawPhases from './TGPLuckyDrawPhases';
import TGPLuckyDrawWinners from './TGPLuckyDrawWinners';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const TGPLuckyDraw: FC<IPropTypes> = function ({}) {
  const { t } = useTranslation();
  const userAddr = useUserAddr();
  const dispatch = useAppDispatch();
  const tgpUser = useTGPUser(userAddr);
  useEffect(() => {
    userAddr && tgpUser && dispatch(getTGPLuckyDrawWinners({ userAddr }));
  }, [userAddr, tgpUser]);
  return (
    <div className="syn-t-gPLucky-draw">
      <div className="syn-t-gPLucky-draw-header">
        <div className="syn-t-gPLucky-draw-header-left">
          <IconLucky />
          {t('tgp.luckydraw.title')}
        </div>
        <IconDecor />
      </div>
      <div className="syn-t-gPLucky-draw-container">
        <TGPLuckyDrawPhases />
        {tgpUser && tgpUser.status >= TGP_USER_STATUS.DEFAULT ? <TGPLuckyDrawWinners /> : <TGPLuckyDrawEmpty />}
      </div>
      <TGPLuckyDrawModal />
    </div>
  );
};

export default TGPLuckyDraw;
