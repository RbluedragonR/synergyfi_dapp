/**
 * @description Component-TGPBannerCorner
 */
import './index.less';

import { useDebounceFn } from 'ahooks';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { FETCHING_STATUS, GlobalModalType } from '@/constants';
import { useToggleModal } from '@/features/global/hooks';
import { getTGPLuckyDrawTicket } from '@/features/tgp/actions';
import {
  useCurrentTGPWeek,
  useIsMaster,
  useTGPTwitterLink,
  useTGPUserStatus,
  useTGPWeekState,
  useUserJWTToken,
} from '@/features/tgp/hooks';
import { useAppDispatch } from '@/hooks';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';

import { ReactComponent as IconClick_24 } from './assets/icon_click_24.svg';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const TGPBannerCorner: FC<IPropTypes> = function ({}) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const toggleModal = useToggleModal(GlobalModalType.LUCK_TICKET);
  const currentWeek = useCurrentTGPWeek();
  const userAddr = useUserAddr();
  const weekState = useTGPWeekState(userAddr, currentWeek);
  const isMaster = useIsMaster(userAddr);
  const twitterLink = useTGPTwitterLink(currentWeek, 'luckyDraw', 'shareToGetTicket', isMaster);
  const jwt = useUserJWTToken(userAddr);
  const userStatus = useTGPUserStatus(userAddr);
  const chainId = useChainId();

  const { run: onBtnClick } = useDebounceFn(
    async () => {
      window.open(twitterLink, '_blank');
      if (!weekState?.ticket && userAddr) {
        console.log('🚀 ~ weekState:', weekState);
        await dispatch(getTGPLuckyDrawTicket({ userAddr, chainId }));
        setTimeout(() => {
          toggleModal(true);
        }, 500);
      }
    },
    {
      wait: 200,
    },
  );

  if (!jwt || userStatus === FETCHING_STATUS.INIT) return null;
  return (
    <div className="syn-tgp-banner-corner">
      <div className="syn-tgp-banner-corner-content" onClick={onBtnClick}>
        <div className="syn-tgp-banner-corner-content-text">
          <span>{t('tgp.banner.shareToWin')}</span>
          <span className="highlight">{t('tgp.banner.luckyDraw')}</span>
        </div>
        <div className="syn-tgp-banner-corner-icon">
          <IconClick_24 />
        </div>
      </div>
    </div>
  );
};

export default TGPBannerCorner;
