/**
 * @description Component-TGPLeaderBoardTable
 */
import './index.less';

import { Watermark } from 'antd';
import classNames from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { EmptyDataWrap } from '@/components/EmptyDataWrap';
import { FETCHING_STATUS, THEME_ENUM } from '@/constants';
import { TGP_MASTER_PAGE_SIZE, TGP_PAGE_SIZE, TGP_POLLING_INTERVAL, TGP_SEASON, TGP_TYPE } from '@/constants/tgp';
import { getTGPMasterLeaderBoard, getTGPOpenLeaderBoard, getTGPStats } from '@/features/tgp/actions';
import {
  useCurrentTGPWeek,
  useTGPDappConfig,
  useTGPLeaderBoard,
  useTGPLeaderBoardStatus,
  useTGPSeasonWeeks,
  useTGPType,
} from '@/features/tgp/hooks';
import { useAppDispatch } from '@/hooks';
import { useUserAddr } from '@/hooks/web3/useChain';
import EpochRank from '@/pages/Odyssey/OdysseyLeaderboard/Epoch/EpochRank';
import { ReactComponent as ListLeftIcon } from '@/pages/TGP/assets/svg/list_self_left.svg';
import { ReactComponent as ListLeftIconD } from '@/pages/TGP/assets/svg/list_self_left_dark.svg';
import { ReactComponent as ListRightIcon } from '@/pages/TGP/assets/svg/list_self_right.svg';
import { ReactComponent as ListRightIconD } from '@/pages/TGP/assets/svg/list_self_right_dark.svg';
import { ReactComponent as LogoIcon } from '@/pages/TGP/assets/svg/logo_symbol.svg';
import { ReactComponent as TopLeftIcon } from '@/pages/TGP/assets/svg/triangle_top_left.svg';
import { ReactComponent as TopRightIcon } from '@/pages/TGP/assets/svg/triangle_top_right.svg';
import { IMasterWeek, IOpenWeek, ITGPDashboardMasterRanking } from '@/types/tgp';
import { pollingFunc } from '@/utils';
import { formatNumber } from '@/utils/numberUtil';

import { useTheme } from '@/features/global/hooks';
import Logo from '@/layout/Header/Logo';
import LeaderTablePagination from './LeaderTablePagination';
import TGPLeaderBoardTableSkeleton from './TGPLeaderBoardTableSkeleton';
import TGPLeaderTableEmpty from './TGPLeaderTableEmpty';
import TGPMasterTrader from './TGPMasterTrader';
import TGPMasterWeek from './TGPMasterWeek';
import TGPOpenWeek from './TGPOpenWeek';
interface IPropTypes {
  className?: string;
}
let polling: NodeJS.Timeout;
const TGPLeaderBoardTable: FC<IPropTypes> = function ({}) {
  const tgpType = useTGPType();
  const { t } = useTranslation();
  const userAddr = useUserAddr();
  const dispatch = useAppDispatch();
  const tgpConfig = useTGPDappConfig();
  const [page, setPage] = useState(1);
  const leaderboard = useTGPLeaderBoard();
  const currentSeasonWeeks = useTGPSeasonWeeks(
    tgpType === TGP_TYPE.OPEN_2 ? TGP_SEASON.SECOND : TGP_SEASON.FIRST,
    userAddr,
  );
  const theme = useTheme();
  const currentWeek = useCurrentTGPWeek();
  const rankBase = useMemo(() => (page > 0 ? (page - 1) * TGP_PAGE_SIZE : 0), [page]);
  const leaderboardStatus = useTGPLeaderBoardStatus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getLeaderBoard = useCallback(
    (page?: number) => {
      page = page || 1;
      if (userAddr) {
        tgpType === TGP_TYPE.MASTER &&
          dispatch(getTGPMasterLeaderBoard({ page, userAddr, pageSize: TGP_MASTER_PAGE_SIZE }));
        tgpType === TGP_TYPE.OPEN_1 && dispatch(getTGPOpenLeaderBoard({ page, userAddr, tgpType }));
        tgpType === TGP_TYPE.OPEN_2 && dispatch(getTGPOpenLeaderBoard({ page, userAddr, tgpType }));
      }
    },
    [dispatch, tgpType, userAddr],
  );
  useEffect(() => {
    getLeaderBoard();
    setPage(1);
    dispatch(getTGPStats({}));
  }, [tgpType]);
  useEffect(() => {
    if (polling) {
      clearInterval(polling);
    }
    polling = pollingFunc(() => {
      getLeaderBoard(page);
    }, TGP_POLLING_INTERVAL);
    return () => polling && clearInterval(polling);
  }, [getLeaderBoard, page]);
  return (
    <div className="syn-t-gPLeader-board-table">
      <div className="syn-t-gPLeader-board-table-header">
        <div className="syn-t-gPLeader-board-table-header-item rank">
          {tgpType === TGP_TYPE.MASTER ? <TopLeftIcon className="triangle" /> : <LogoIcon />}
          {t('tgp.leaderboard.rank')}
        </div>
        {tgpType === TGP_TYPE.MASTER && (
          <div className="syn-t-gPLeader-board-table-header-item trader">
            <div className="syn-t-gPLeader-board-table-header-item-top trader">
              <Logo dataTheme={theme.dataTheme} />
              {t('tgp.leaderboard.masterEth')}
            </div>
            <div className="syn-t-gPLeader-board-table-header-item-bottom trader">
              <div>{t('tgp.leaderboard.trader')}</div>
              <div>{t('tgp.leaderboard.totalScore')}</div>
            </div>
          </div>
        )}

        {currentSeasonWeeks?.map((week) => (
          <div
            key={week.startTs}
            className={classNames('syn-t-gPLeader-board-table-header-item week', {
              active: week.week === currentWeek,
            })}>
            <div className="syn-t-gPLeader-board-table-header-item-top">
              <div className="week"> {t(`tgp.week.weekTitle`, { week: week.week })}</div>
              {moment.utc(week.startTs).local().format('MM/DD')}~{moment.utc(week.endTs).local().format('MM/DD')}
            </div>
            <div className="syn-t-gPLeader-board-table-header-item-bottom">
              <div>{tgpType === TGP_TYPE.MASTER ? t('tgp.leaderboard.score') : t('tgp.leaderboard.trader')}</div>
              <div>
                {tgpType === TGP_TYPE.MASTER
                  ? t('tgp.leaderboard.pnl', { symbol: tgpConfig.masterToken })
                  : tgpType === TGP_TYPE.OPEN_1
                  ? t('tgp.leaderboard.pnlShort')
                  : t('tgp.leaderboard.volume')}
              </div>
            </div>
          </div>
        ))}
        <div className="syn-t-gPLeader-board-table-header-item prize">
          <TopRightIcon />
          {tgpType === TGP_TYPE.MASTER ? t('tgp.leaderboard.prize') : t('tgp.leaderboard.weeklyP')}
        </div>
      </div>
      <Watermark content="SynergyFi" font={{ color: 'rgba(0, 191, 191, 0.15)' }}>
        <div className={classNames('syn-t-gPLeader-board-table-body', { long: tgpType === TGP_TYPE.MASTER })}>
          {leaderboardStatus !== FETCHING_STATUS.DONE && !leaderboard?.list ? (
            <TGPLeaderBoardTableSkeleton />
          ) : (
            <>
              {leaderboard?.list?.map((ranking, index) => (
                <div
                  key={index}
                  className={classNames('syn-t-gPLeader-board-table-body-row', {
                    master: tgpType === TGP_TYPE.MASTER,
                    master_active:
                      tgpType === TGP_TYPE.MASTER &&
                      userAddr?.toLowerCase() === _.get(ranking, ['userId']).toLowerCase(),
                  })}>
                  {tgpType === TGP_TYPE.MASTER &&
                    (theme.dataTheme === THEME_ENUM.DARK ? (
                      <>
                        <ListLeftIconD className="icon left" />
                        <ListRightIconD className="icon right" />
                      </>
                    ) : (
                      <>
                        <ListLeftIcon className="icon left" />
                        <ListRightIcon className="icon right" />
                      </>
                    ))}
                  <div className="syn-t-gPLeader-board-table-body-row-item rank">
                    <EpochRank rank={rankBase + index + 1} />
                  </div>
                  {tgpType === TGP_TYPE.MASTER && (
                    <TGPMasterTrader realRank={rankBase + index + 1} ranking={ranking as ITGPDashboardMasterRanking} />
                  )}
                  {tgpType === TGP_TYPE.MASTER && (
                    <>
                      <TGPMasterWeek week={ranking.week1 as IMasterWeek} index={1} />
                      <TGPMasterWeek week={ranking.week2 as IMasterWeek} index={2} />
                      <TGPMasterWeek week={ranking.week3 as IMasterWeek} index={3} />
                      <TGPMasterWeek week={ranking.week4 as IMasterWeek} index={4} />
                    </>
                  )}
                  {tgpType === TGP_TYPE.OPEN_1 && (
                    <>
                      <TGPOpenWeek realRank={rankBase + index + 1} week={ranking.week1 as IOpenWeek} index={1} />
                      <TGPOpenWeek realRank={rankBase + index + 1} week={ranking.week2 as IOpenWeek} index={2} />
                      <TGPOpenWeek realRank={rankBase + index + 1} week={ranking.week3 as IOpenWeek} index={3} />
                      <TGPOpenWeek realRank={rankBase + index + 1} week={ranking.week4 as IOpenWeek} index={4} />
                    </>
                  )}
                  {tgpType === TGP_TYPE.OPEN_2 && (
                    <>
                      <TGPOpenWeek realRank={rankBase + index + 1} week={ranking.week5 as IOpenWeek} index={5} />
                      <TGPOpenWeek realRank={rankBase + index + 1} week={ranking.week6 as IOpenWeek} index={6} />
                      <TGPOpenWeek realRank={rankBase + index + 1} week={ranking.week7 as IOpenWeek} index={7} />
                      <TGPOpenWeek realRank={rankBase + index + 1} week={ranking.week8 as IOpenWeek} index={8} />
                    </>
                  )}
                  <div className="syn-t-gPLeader-board-table-body-row-item prize">
                    <EmptyDataWrap isLoading={!ranking.prize}>
                      {/* {WrappedBigNumber.from(ranking.prize).formatNumberWithTooltip({
                      suffix: tgpConfig.prizeCurrency,
                    })} */}
                      {formatNumber(ranking.prize, 0)} {tgpConfig.prizeCurrency}
                    </EmptyDataWrap>
                  </div>
                </div>
              ))}
              {leaderboard?.list.length === 0 && <TGPLeaderTableEmpty />}
            </>
          )}
        </div>
      </Watermark>

      <LeaderTablePagination
        page={page}
        pageSize={tgpType === TGP_TYPE.MASTER ? TGP_MASTER_PAGE_SIZE : TGP_PAGE_SIZE}
        updatedAt={leaderboard?.updateAt || Date.now().toString()}
        onPageChange={(page: number) => {
          setPage(page);
          getLeaderBoard(page);
        }}
        total={leaderboard?.totals || 0}
      />
    </div>
  );
};

export default TGPLeaderBoardTable;
