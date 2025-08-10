/**
 * @description Component-TGPBannerLeft
 */
import './index.less';

import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { useTGPDappConfig } from '@/features/tgp/hooks';

import { CHAIN_ID } from '@/constants/chain';
import { useDappChainConfig } from '@/hooks/web3/useChain';
import { ReactComponent as IconCalendar_20 } from './assets/icon_calendar_20.svg';
import { ReactComponent as IconTrophy_24 } from './assets/icon_trophy_24.svg';

interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const TGPBannerLeft: FC<IPropTypes> = function ({}) {
  const { t } = useTranslation();
  const config = useTGPDappConfig();
  const dappConfig = useDappChainConfig(CHAIN_ID.BLAST);
  return (
    <div className="syn-tgp-banner-left">
      <div className="syn-tgp-banner-left-content">
        <h2 className="syn-tgp-banner-title1">
          <span>{t('tgp.banner.title1')}</span>
          <span>
            <img
              loading="lazy"
              width={16}
              height={16}
              src={dappConfig?.network?.icon}
              className="syn-tgp-banner-title1-network-img"
              alt="Switch Network"
            />
            {t('tgp.banner.title2')}
          </span>
        </h2>
        <h1 className="syn-tgp-banner-title2">
          <span className="syn-tgp-banner-title2-text">
            {' '}
            <IconTrophy_24 />
            {t('tgp.banner.leftPrize')}
          </span>
          <span className="syn-tgp-banner-title2-num">{config.prize}</span>
        </h1>
        <div className="syn-tgp-banner-time">
          <IconCalendar_20 />
          <span>{t('tgp.banner.competitionPeriod')}</span>
          <b>
            <span>{t('tgp.banner.time')}</span>
          </b>
        </div>
      </div>
    </div>
  );
};

export default TGPBannerLeft;
