/**
 * @description Component-TGPBanner
 */
import './index.less';

import React, { FC } from 'react';

import { FETCHING_STATUS } from '@/constants';
import { useIsRegistered, useIsTGPEnded, useTGPSeason, useTGPUser, useUserCheckStatus } from '@/features/tgp/hooks';
import { useUserAddr } from '@/hooks/web3/useChain';
import { TGP_USER_STATUS } from '@/types/tgp';

import { useTheme } from '@/features/global/hooks';
import classNames from 'classnames';
import TGPBannerCorner from './TGPBannerCorner';
import TGPBannerLeft from './TGPBannerLeft';
import TGPBannerRight from './TGPBannerRight';
import TGPEnded from './TGPEnded';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const TGPBanner: FC<IPropTypes> = function ({}) {
  const season = useTGPSeason();
  const userAddr = useUserAddr();
  const isTGPEnded = useIsTGPEnded(season, userAddr);
  const tgpUser = useTGPUser(userAddr);
  const isRegistered = useIsRegistered(userAddr);
  const checkStatus = useUserCheckStatus(userAddr);
  const theme = useTheme();
  return (
    <div className={classNames('syn-tgp-banner', theme.dataTheme)}>
      <div className="syn-tgp-banner-container">
        <TGPBannerLeft />
        {isTGPEnded && !isRegistered && checkStatus === FETCHING_STATUS.DONE ? <TGPEnded /> : <TGPBannerRight />}
        {!isTGPEnded && tgpUser && tgpUser.status >= TGP_USER_STATUS.DEFAULT && <TGPBannerCorner />}
      </div>
    </div>
  );
};

export default TGPBanner;
