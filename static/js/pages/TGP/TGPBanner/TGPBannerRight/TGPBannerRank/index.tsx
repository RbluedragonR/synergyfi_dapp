/**
 * @description Component-TGPBannerRank
 */
import './index.less';

import classNames from 'classnames';
import _ from 'lodash';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { EmptyDataWrap } from '@/components/EmptyDataWrap';
import { formatNumberWithTooltip } from '@/components/NumberFormat';
import { Tooltip } from '@/components/ToolTip';
import { TGP_SEASON } from '@/constants/tgp';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useCurrentTGPWeek, useTGPDappConfig, useTGPSeason, useTGPUser } from '@/features/tgp/hooks';
import { useUserAddr } from '@/hooks/web3/useChain';
import { ITGPBannerScore, ITGPUserMasterRank, ITGPUserOpenRank } from '@/types/tgp';
import { formatNumber } from '@/utils/numberUtil';

import RankClaimBtn from './RankClaimBtn';

interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  isMaster: boolean;
}
const TGPBannerRank: FC<IPropTypes> = function ({ isMaster }) {
  const { t } = useTranslation();
  const userAddr = useUserAddr();
  const tgpUser = useTGPUser(userAddr);
  const tgpConfig = useTGPDappConfig();
  const season = useTGPSeason();
  const tgpWeek = useCurrentTGPWeek();

  const isSeason2 = useMemo(() => {
    return season === TGP_SEASON.SECOND;
  }, [season]);

  const dataList: ITGPBannerScore[] = useMemo(() => {
    // if (!tgpUser?.rankings?.open && !tgpUser?.rankings?.master) return [];
    if (isMaster) {
      const weeks = 4;
      const masters = _.get(tgpUser, ['rankings', 'master']);
      return new Array(weeks).fill('').map((__, week) => {
        const weekInfo: ITGPUserMasterRank | undefined = _.get(masters, [`week${week + 1}`], {});
        return {
          ...weekInfo,
          week: week + 1,
          prize: undefined,
          claimed: false,
          rank: weekInfo?.rank,
          score: weekInfo?.scores,
          pnl: weekInfo?.PnL,
        } as ITGPBannerScore;
      });
    } else {
      const weeks = 4;
      const weekNum = isSeason2 ? 5 : 0 + 1;
      const opens = _.get(tgpUser, ['rankings', 'open']);
      return new Array(weeks).fill('').map((__, week) => {
        const weekInfo: ITGPUserOpenRank | undefined = _.get(opens, [`week${weekNum + week}`], {});
        return {
          ...weekInfo,
          week: weekNum + week,
          rank: weekInfo?.rank,
          prize: weekInfo?.prize,
          pnl: weekInfo?.PnL,
          volume: weekInfo?.volume,
          claimed: weekInfo?.claimed,
        } as ITGPBannerScore;
      });
    }

    return [];
  }, [isMaster, isSeason2, tgpUser?.rankings?.master, tgpUser?.rankings?.open]);

  const allHide = useMemo(() => {
    return dataList.every((item) => item.prize && item.claimed);
  }, [dataList]);

  const masterRanking = useMemo(() => {
    return tgpUser?.rankings?.master;
  }, [tgpUser?.rankings?.master]);

  return (
    <div className={classNames('syn-tgp-banner-rank', isMaster && 'master')}>
      <div className="syn-tgp-banner-rank-table">
        <div className="syn-tgp-banner-rank-table-header">
          <div className="syn-tgp-banner-rank-table-row">
            <div className="syn-tgp-banner-rank-table-cell"></div>
            <div className="syn-tgp-banner-rank-table-cell rank">{t('tgp.banner.rank.Rank')}</div>
            {isMaster && <div className="syn-tgp-banner-rank-table-cell score">{t('tgp.banner.rank.Score')}</div>}
            <div className="syn-tgp-banner-rank-table-cell pnl">
              {isMaster
                ? t('tgp.banner.rank.P&L(ETH)')
                : isSeason2
                ? t('tgp.banner.rank.Volume')
                : t('tgp.banner.rank.P&L')}
            </div>
            {!isMaster && <div className="syn-tgp-banner-rank-table-cell prize">{t('tgp.banner.Prize')}</div>}
          </div>
        </div>
        <div className="syn-tgp-banner-rank-table-body-wrap">
          {tgpUser && (
            <div className="syn-tgp-banner-rank-table-body">
              {isMaster && !!dataList.length && (
                <div className="syn-tgp-banner-rank-table-row">
                  <div className="syn-tgp-banner-rank-table-cell week">
                    <span>{t(`tgp.banner.rank.Standings`)}</span>
                  </div>
                  <div className="syn-tgp-banner-rank-table-cell rank">
                    <EmptyDataWrap
                      isLoading={masterRanking?.rank === undefined || masterRanking.rank === null}
                      marginRight={0}>
                      <span>{masterRanking?.rank}</span>
                    </EmptyDataWrap>
                  </div>
                  {isMaster && (
                    <div className="syn-tgp-banner-rank-table-cell score">
                      <EmptyDataWrap
                        isLoading={masterRanking?.totalScores === undefined || masterRanking?.totalScores === null}
                        marginRight={0}>
                        <span>{masterRanking?.totalScores}</span>
                      </EmptyDataWrap>
                    </div>
                  )}
                  <div className="syn-tgp-banner-rank-table-cell pnl">-</div>
                </div>
              )}
              {dataList.map((item) => {
                return (
                  <div className="syn-tgp-banner-rank-table-row" key={item.week}>
                    <div className="syn-tgp-banner-rank-table-cell week">
                      <span>{t(`tgp.week.weekTitle`, { week: item.week })}</span>
                    </div>
                    <div className="syn-tgp-banner-rank-table-cell rank">
                      <EmptyDataWrap isLoading={item.rank === undefined || item.rank === null} marginRight={0}>
                        <span>{item.rank}</span>
                      </EmptyDataWrap>
                    </div>
                    {isMaster && (
                      <div className="syn-tgp-banner-rank-table-cell score">
                        <EmptyDataWrap isLoading={item.score === undefined || item.score === null} marginRight={0}>
                          <span>{item.score}</span>
                        </EmptyDataWrap>
                      </div>
                    )}
                    <div className="syn-tgp-banner-rank-table-cell pnl">
                      {isSeason2 ? (
                        <EmptyDataWrap isLoading={item.volume === undefined || item.volume === null} marginRight={0}>
                          <span>
                            {formatNumberWithTooltip({
                              num: item.volume || 0,
                              prefix: isMaster ? undefined : '$',
                            })}{' '}
                          </span>
                        </EmptyDataWrap>
                      ) : (
                        <EmptyDataWrap isLoading={item.pnl === undefined || item.pnl === null} marginRight={0}>
                          <span>
                            {formatNumberWithTooltip({
                              num: item?.pnl ? (item?.pnl || 0) / 1e18 : '',
                              prefix: isMaster ? undefined : '$',
                            })}{' '}
                          </span>
                        </EmptyDataWrap>
                      )}
                    </div>
                    {!isMaster && (
                      <div className="syn-tgp-banner-rank-table-cell prize">
                        <EmptyDataWrap
                          isLoading={item.prize === undefined || item.prize === null || tgpWeek <= item.week}
                          marginRight={0}>
                          <span>
                            {formatNumber(item?.prize || 0, 0)} {tgpConfig.prizeCurrency}
                          </span>
                        </EmptyDataWrap>
                        {item?.claimed ? (
                          <Tooltip title={t('tgp.prizeClaimed')}>
                            <div className="syn-tgp-banner-rank-claimed-tag">{t('tgp.Claimed')}</div>
                          </Tooltip>
                        ) : (
                          <RankClaimBtn
                            showClaim={
                              (item.week < tgpWeek && !item.claimed && WrappedBigNumber.from(item.prize || 0).gt(0)) ||
                              false
                            }
                            allHide={allHide}
                            week={item.week}
                            item={item}
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {/* {!dataList?.length && <OdysseyEmpty />} */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TGPBannerRank;
