/**
 * @description Component-TGPLuckyDrawPhases
 */
import './index.less';

import classNames from 'classnames';
import moment from 'moment';
import React, { FC, useCallback, useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@/components/Button';
import { Tooltip } from '@/components/ToolTip';
import { GlobalModalType } from '@/constants';
import { TGP_SEASON } from '@/constants/tgp';
import { useToggleModal } from '@/features/global/hooks';
import { getTGPLuckyDrawTicket, setSelectedLuckyWeek, setTGPSelectedSeason } from '@/features/tgp/actions';
import {
  useCurrentTGPWeek,
  useIsMaster,
  useSelectedLuckyWeek,
  useTGPDappConfig,
  useTGPSeasonWeeks,
  useTGPSelectedSeason,
  useTGPTwitterLink,
  useTGPUser,
} from '@/features/tgp/hooks';
import { useAppDispatch } from '@/hooks';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { ReactComponent as ShareIcon } from '@/pages/TGP/assets/svg/icon_share_16.svg';
import { TGP_LUCK_DRAW_USER_STATUS, TGP_USER_STATUS } from '@/types/tgp';

import { ReactComponent as IconLeft } from './assets/icon_arrow_left.svg';
import { ReactComponent as IconRight } from './assets/icon_arrow_right.svg';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const TGPLuckyDrawPhases: FC<IPropTypes> = function ({}) {
  const { t } = useTranslation();
  const userAddr = useUserAddr();
  const currentWeek = useCurrentTGPWeek();
  const dispatch = useAppDispatch();
  const selectedWeek = useSelectedLuckyWeek();
  const isMaster = useIsMaster(userAddr);
  const tgpUser = useTGPUser(userAddr);
  const tgpConfig = useTGPDappConfig();
  const season = useTGPSelectedSeason();
  const chainId = useChainId();
  const weeksWithUserState = useTGPSeasonWeeks(season, userAddr);
  const twitterLink = useTGPTwitterLink(currentWeek, 'luckyDraw', 'shareToGetTicket', isMaster);

  const toggledDrawModal = useToggleModal(GlobalModalType.LUCKY_DRAW);
  const toggleTicketModal = useToggleModal(GlobalModalType.LUCK_TICKET);
  useEffect(() => {
    let selectedWeek = currentWeek ? currentWeek - 1 : 0;
    if (season === TGP_SEASON.SECOND && currentWeek === 5) {
      selectedWeek = 0;
    }
    dispatch(setSelectedLuckyWeek(selectedWeek));
  }, [currentWeek, dispatch]);
  const shareOnTwitter = useCallback(() => {
    if (userAddr) {
      dispatch(getTGPLuckyDrawTicket({ userAddr, chainId }));
      setTimeout(() => toggleTicketModal(true), 3000);
    }
  }, [dispatch, toggleTicketModal, userAddr, chainId]);
  return (
    <div className="syn-t-gPLucky-draw-phases">
      <div className="syn-t-gPLucky-draw-phases-weeks">
        {season !== TGP_SEASON.FIRST && (
          <IconLeft
            onClick={() => {
              dispatch(setTGPSelectedSeason(TGP_SEASON.FIRST));
              dispatch(setSelectedLuckyWeek(currentWeek < 5 ? currentWeek - 1 : 4));
            }}
            className={classNames('syn-t-gPLucky-draw-phases-weeks-icon left', {
              // disabled: season === TGP_SEASON.FIRST,
            })}
          />
        )}
        {season !== TGP_SEASON.SECOND && (
          <IconRight
            onClick={() => {
              dispatch(setTGPSelectedSeason(TGP_SEASON.SECOND));
              if (currentWeek > 5) {
                dispatch(setSelectedLuckyWeek(currentWeek > 5 ? currentWeek - 1 : 5));
              } else {
                dispatch(setSelectedLuckyWeek(0));
              }
            }}
            className={classNames('syn-t-gPLucky-draw-phases-weeks-icon right', {
              // disabled: season === TGP_SEASON.SECOND,
            })}
          />
        )}
        {weeksWithUserState?.map((week, index) => (
          <div
            key={week.week}
            className={classNames('syn-t-gPLucky-draw-phases-weeks-item', { first: index === 0, last: index === 3 })}>
            <div className="line" />
            <div className="week">{t(`tgp.week.weekTitle`, { week: week.week })}</div>
            <div className="range">
              {moment.utc(week.startTs).local().format('MM/DD')}~{moment.utc(week.endTs).local().format('MM/DD')}
            </div>
            <div className="line" />
          </div>
        ))}
      </div>
      {tgpUser && tgpUser.status >= TGP_USER_STATUS.DEFAULT && (
        <div className="syn-t-gPLucky-draw-phases-tiles">
          {weeksWithUserState?.map((week, index) => (
            <div
              key={index}
              onClick={() => {
                if (currentWeek && week.week < currentWeek && week.status !== TGP_LUCK_DRAW_USER_STATUS.NOT_OPEN) {
                  dispatch(setSelectedLuckyWeek(week.week));
                }
              }}
              className={classNames('syn-t-gPLucky-draw-phases-tiles-item', {
                first: index === 0,
                last: index === 3,
                active: week.week === selectedWeek,
                off: week.week <= currentWeek,
                current: week.week === currentWeek,
                selectable: week.week < currentWeek,
                not_started: week.week > currentWeek,
              })}>
              {week.week > currentWeek && <div>{t('tgp.luckydraw.notStarted')}</div>}
              {week.week === currentWeek && (
                <div className="container">
                  <div className="container-status">{t('tgp.luckydraw.onGoing')}</div>
                  <div className="container-bottom">
                    {week.ticket ? (
                      <>
                        {t('tgp.luckydraw.yourTicket')} <b>#{week.ticket}</b>
                      </>
                    ) : (
                      <Button
                        href={twitterLink}
                        target="_blank"
                        rel="noreferrer"
                        onClick={shareOnTwitter}
                        className="container-btn">
                        {t('tgp.luckydraw.shareLine')}
                        <ShareIcon />
                      </Button>
                    )}
                  </div>
                </div>
              )}
              {week.week < currentWeek && (
                <div className="container">
                  <div className="container-status">{t('tgp.luckydraw.ended')}</div>

                  <div className="container-bottom">
                    {(week.status === TGP_LUCK_DRAW_USER_STATUS.OPEN_WINNER ||
                      week.status === TGP_LUCK_DRAW_USER_STATUS.CLAIMED) && (
                      <>
                        <Trans
                          i18nKey="tgp.luckydraw.wonLine"
                          values={{
                            prize: `${week.prize} ${tgpConfig.prizeCurrency}`,
                          }}
                          components={{ b: <b /> }}
                        />{' '}
                        {week.status === TGP_LUCK_DRAW_USER_STATUS.CLAIMED ? (
                          <Tooltip title={t('tgp.prizeClaimed')}>
                            <Button className="container-btn claimed">{t('tgp.Claimed')}</Button>
                          </Tooltip>
                        ) : (
                          <Button onClick={() => toggledDrawModal()} className="container-btn">
                            {t('tgp.Claim')}
                          </Button>
                        )}
                      </>
                    )}
                    {week.status === TGP_LUCK_DRAW_USER_STATUS.OPEN_LOSER && (
                      <div className="container-bottom-not-won">{t('tgp.luckydraw.notwon')}</div>
                    )}
                    {!week.ticket && <div className="container-bottom-not-won">{t('tgp.luckydraw.notJoin')}</div>}
                    {week.status === TGP_LUCK_DRAW_USER_STATUS.NOT_OPEN && week.ticket && (
                      <>
                        {t('tgp.luckydraw.yourTicket')} <b>#{week.ticket}</b>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TGPLuckyDrawPhases;
