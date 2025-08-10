/**
 * @description Component-TGPBannerRightSeasons
 */
import './index.less';

import classNames from 'classnames';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { Tooltip } from '@/components/ToolTip';
import { TGP_SEASON } from '@/constants/tgp';
import { setTGPSeason } from '@/features/tgp/actions';
import { useTGPDappConfig, useTGPSeason } from '@/features/tgp/hooks';
import { useAppDispatch } from '@/hooks';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const TGPBannerRightSeasons: FC<IPropTypes> = function ({}) {
  const dispatch = useAppDispatch();
  const season = useTGPSeason();
  const { t } = useTranslation();
  const config = useTGPDappConfig();
  return (
    <div className="syn-tgp-banner-right-seasons">
      <div
        onClick={() => dispatch(setTGPSeason(TGP_SEASON.FIRST))}
        className={classNames('syn-tgp-banner-right-seasons-item', { active: season === TGP_SEASON.FIRST })}>
        <div className="syn-tgp-banner-right-seasons-item-dot" /> {t('tgp.Open1')}
      </div>
      <div className="syn-tgp-banner-right-seasons-divider">/</div>
      <Tooltip title={config.isShowSeasonTwoComingSoon ? t('common.comingSoon') : undefined}>
        <div
          onClick={() => {
            if (config.isShowSeasonTwoComingSoon) return;
            dispatch(setTGPSeason(TGP_SEASON.SECOND));
          }}
          className={classNames('syn-tgp-banner-right-seasons-item', {
            active: season === TGP_SEASON.SECOND,
            disabled: config.isShowSeasonTwoComingSoon,
          })}>
          <div className="syn-tgp-banner-right-seasons-item-dot" /> {t('tgp.Open2')}
        </div>
      </Tooltip>

      <div className="syn-tgp-banner-right-seasons-line" />
    </div>
  );
};

export default TGPBannerRightSeasons;
