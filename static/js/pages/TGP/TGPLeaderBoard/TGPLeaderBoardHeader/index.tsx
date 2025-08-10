/**
 * @description Component-TGPLeaderBoardHeader
 */
import './index.less';

import { Tabs } from 'antd';
import classNames from 'classnames';
import React, { FC, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { EmptyDataWrap } from '@/components/EmptyDataWrap';
import { Tooltip } from '@/components/ToolTip';
import { TGP_SEASON, TGP_TYPE } from '@/constants/tgp';
import { useTheme } from '@/features/global/hooks';
import { setTGPType } from '@/features/tgp/actions';
import { useTGPDappConfig, useTGPLeaderBoardHeader, useTGPType } from '@/features/tgp/hooks';
import { useAppDispatch } from '@/hooks';
import { ReactComponent as LeaderboardIcon } from '@/pages/TGP/assets/svg/icon_title_leaderboard.svg';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const TGPLeaderBoardHeader: FC<IPropTypes> = function ({}) {
  const { t } = useTranslation();
  const tpgType = useTGPType();
  const config = useTGPDappConfig();
  const leaderboard = useTGPLeaderBoardHeader();
  const tgpConfig = useTGPDappConfig();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const tabItems = useMemo(
    () => [
      {
        key: TGP_TYPE.MASTER,
        label: t('tgp.Master'),
      },
      {
        key: TGP_TYPE.OPEN_1,
        label: (
          <Tooltip title={config.isShowSeasonOneComingSoon ? t('common.comingSoon') : undefined}>
            {t('tgp.Open1')}
          </Tooltip>
        ),
        disabled: config.isShowSeasonOneComingSoon,
      },
      {
        key: TGP_TYPE.OPEN_2,
        label: (
          <Tooltip title={config.isShowSeasonTwoComingSoon ? t('common.comingSoon') : undefined}>
            {t('tgp.Open2')}
          </Tooltip>
        ),
        disabled: config.isShowSeasonTwoComingSoon,
      },
    ],
    [config.isShowSeasonOneComingSoon, config.isShowSeasonTwoComingSoon, t],
  );
  useEffect(() => {
    dispatch(setTGPType(tgpConfig.currentSeason === TGP_SEASON.FIRST ? TGP_TYPE.MASTER : TGP_TYPE.OPEN_2));
  }, [dispatch, tgpConfig.currentSeason]);
  return (
    <div className="syn-t-gPLeader-board-header">
      <div className="syn-t-gPLeader-board-header-left">
        <LeaderboardIcon /> {t('tgp.leaderboard.leaderboard')}
      </div>
      <div className="syn-t-gPLeader-board-header-center">
        <Tabs
          className={classNames('syn-t-gPLeader-board-header-tabs', tpgType, theme.dataTheme)}
          onChange={(activeKey: string) => dispatch(setTGPType(activeKey as TGP_TYPE))}
          activeKey={tpgType}
          items={tabItems}
        />
      </div>
      <div className="syn-t-gPLeader-board-header-right">
        <div className="syn-t-gPLeader-board-header-right-item">
          <div className="syn-t-gPLeader-board-header-right-item-title">{t('tgp.leaderboard.totalContestant')}</div>
          <div className="syn-t-gPLeader-board-header-right-item-number">
            {' '}
            <EmptyDataWrap isLoading={!leaderboard?.totalParticipants}>{leaderboard?.totalParticipants}</EmptyDataWrap>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TGPLeaderBoardHeader;
