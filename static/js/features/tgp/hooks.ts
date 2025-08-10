import { useDebounceEffect } from 'ahooks';
import _ from 'lodash';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';

import { FETCHING_STATUS } from '@/constants';
import { TWITTER_SHARE_LINK } from '@/constants/odyssey';
import { TGP_POLLING_INTERVAL, TGP_POLLING_INTERVAL_LONG, TGP_SEASON, TGP_TYPE } from '@/constants/tgp';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { useUserAddr } from '@/hooks/web3/useChain';
import { ODYSSEY_STEP } from '@/types/odyssey';
import {
  ITGPDappConfig,
  ITGPDashboardBase,
  ITGPMaster,
  ITGPMasterLeaderBoard,
  ITGPOpenLeaderBoard,
  ITGPStat,
  ITGPTrader,
  ITGPUser,
  ITradingWeek,
  WeekWithLuckyDrawState,
} from '@/types/tgp';
import { pollingFunc } from '@/utils';
import { getTGPJWTToken } from '@/utils/storage';

import { getTGPMasters, getTGPUser, getTGPUserPreCheck, setTGPJWTToken } from './actions';
import {
  selectCurrentLuckyWeekWinners,
  selectCurrentSeason,
  selectSelectedLuckyWeek,
  selectSelectedSeason,
  selectTGPConfig,
  selectTGPMasterLeaderBoard,
  selectTGPMasterLeaderBoardStatus,
  selectTGPMasters,
  selectTGPOpenLeaderBoard,
  selectTGPOpenLeaderBoardStatus,
  selectTGPStats,
  selectTGPType,
  selectTGPUserCheckStatus,
  selectTGPUserCurrentStep,
  selectTGPUserIsRegistered,
  selectTGPUserProfile,
  selectTGPUserProfileStatus,
  selectUserJWTToken,
  selectUserJWTTokenStatus,
  selectUserSharedTicket,
} from './slice';

export function useTGPMasterLeaderBoard(): ITGPMasterLeaderBoard | undefined {
  const masters = useTGPMasters();
  const leaderboard = useAppSelector(selectTGPMasterLeaderBoard);
  return useMemo(
    () =>
      leaderboard
        ? {
            ...leaderboard,
            list: leaderboard?.list?.map((l) => {
              const master = masters?.find((m) => l.userId === m.userId);
              return { ...l, ...master };
            }),
          }
        : leaderboard,
    [leaderboard, masters],
  );
}
export function useTGPStats(): ITGPStat | undefined {
  return useAppSelector(selectTGPStats);
}
export function useTGPOpenLeaderBoard(): ITGPOpenLeaderBoard | undefined {
  return useAppSelector(selectTGPOpenLeaderBoard);
}
export function useTGPMasterLeaderBoardStatus(): FETCHING_STATUS | undefined {
  return useAppSelector(selectTGPMasterLeaderBoardStatus);
}
export function useTGPOpenLeaderBoardStatus(): FETCHING_STATUS | undefined {
  return useAppSelector(selectTGPOpenLeaderBoardStatus);
}
export function useTGPLeaderBoard(): ITGPMasterLeaderBoard | ITGPOpenLeaderBoard | undefined {
  const type = useTGPType();
  const masterLeaderboard = useTGPMasterLeaderBoard();
  const openLeaderboard = useTGPOpenLeaderBoard();
  return useMemo(
    () => (type === TGP_TYPE.MASTER ? masterLeaderboard : openLeaderboard),
    [masterLeaderboard, openLeaderboard, type],
  );
}
export function useTGPLeaderBoardHeader(): ITGPDashboardBase | undefined {
  const masterLeaderboard = useTGPMasterLeaderBoard();
  const openLeaderboard = useTGPOpenLeaderBoard();
  return useMemo(() => _.merge({}, masterLeaderboard, openLeaderboard), [masterLeaderboard, openLeaderboard]);
}
export function useTGPLeaderBoardStatus(): FETCHING_STATUS | undefined {
  const type = useTGPType();
  const masterLeaderboard = useTGPMasterLeaderBoardStatus();
  const openLeaderboard = useTGPOpenLeaderBoardStatus();
  return useMemo(
    () => (type === TGP_TYPE.MASTER ? masterLeaderboard : openLeaderboard),
    [masterLeaderboard, openLeaderboard, type],
  );
}
export function useTGPType(): TGP_TYPE {
  return useAppSelector(selectTGPType);
}
export function useTGPSeason(): TGP_SEASON {
  return useAppSelector(selectCurrentSeason);
}
export function useTGPSelectedSeason(): TGP_SEASON {
  return useAppSelector(selectSelectedSeason);
}
export function useTGPSeasonWWeeks(season: number): ITradingWeek[] {
  const config = useTGPDappConfig();
  return useMemo(() => config.weeks.slice((season - 1) * 4, season * 4), [config.weeks, season]);
}
export function useUserSharedTicket(userAddr: string | undefined): string | undefined {
  return useAppSelector(selectUserSharedTicket(userAddr));
}

export function useCurrentLuckyWeekWinners(week: number): ITGPTrader[] | undefined {
  return useAppSelector(selectCurrentLuckyWeekWinners(week));
}
export function useSelectedLuckyWeek(): number {
  return useAppSelector(selectSelectedLuckyWeek);
}

export function useTGPDappConfig(): ITGPDappConfig {
  return useAppSelector(selectTGPConfig);
}
export function useTGPWeeksWithUserState(userAddr: string | undefined): WeekWithLuckyDrawState[] | undefined {
  const config = useTGPDappConfig();
  const user = useTGPUser(userAddr);
  return useMemo(() => {
    if (config && user) {
      const weeksWithState = config.weeks.map((week) => {
        const state = user.luckyDraws.find((w) => w.week === week.week);
        const weekWithState = _.merge({}, week, state);
        return weekWithState;
      });
      return weeksWithState;
    }
    if (config) {
      return config.weeks as WeekWithLuckyDrawState[];
    }
    return undefined;
  }, [config, user]);
}

export function useTGPSeasonWeeks(season: number, userAddr: string | undefined): WeekWithLuckyDrawState[] | undefined {
  const weeks = useTGPWeeksWithUserState(userAddr);
  return useMemo(() => weeks?.slice((season - 1) * 4, season * 4), [weeks, season]);
}

export function useCurrentTGPWeek(): number {
  const config = useTGPDappConfig();
  const [currentWeek, setCurrentWeek] = useState<number>(config.defaultWeek || 1);
  let polling: NodeJS.Timeout;
  useEffect(() => {
    if (polling) {
      clearInterval(polling);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    polling = pollingFunc(() => {
      const now = moment().utc();
      const week = config.weeks.find(
        (w) => moment.utc(w.startTs).isSameOrBefore(now) && moment.utc(w.endTs).isSameOrAfter(now),
      );
      if (week) {
        setCurrentWeek(week?.week);
      } else {
        const lastEnd = _.last(config.weeks)?.endTs;
        if (lastEnd) {
          if (now.isAfter(lastEnd)) {
            setCurrentWeek(config.weeks.length + 1);
          }
        }
      }
    }, TGP_POLLING_INTERVAL_LONG);

    return () => polling && clearInterval(polling);
  }, []);
  return currentWeek;
}

export function useTGPWeekState(userAddr: string | undefined, week: number): WeekWithLuckyDrawState | undefined {
  const weeksWithLuckyDrawState = useTGPWeeksWithUserState(userAddr);
  return useMemo(() => weeksWithLuckyDrawState?.find((w) => w.week === week), [week, weeksWithLuckyDrawState]);
}

export function useUserJWTToken(userAddr: string | undefined): string | undefined {
  return useAppSelector(selectUserJWTToken(userAddr));
}
export function useTGPMasters(): ITGPMaster[] | undefined {
  return useAppSelector(selectTGPMasters);
}
export function useUserJWTTokenStatus(userAddr: string | undefined): FETCHING_STATUS {
  return useAppSelector(selectUserJWTTokenStatus(userAddr));
}

export function useTGPCurrentStep(userAddr: string | undefined): ODYSSEY_STEP {
  return useAppSelector(selectTGPUserCurrentStep(userAddr));
}

export function useTGPUser(userAddr: string | undefined): ITGPUser | undefined {
  const profile = useAppSelector(selectTGPUserProfile(userAddr));
  return profile;
}
export function useTGPUserStatus(userAddr: string | undefined): FETCHING_STATUS {
  const profile = useAppSelector(selectTGPUserProfileStatus(userAddr));
  return profile;
}

export function useIsMaster(userAddr: string | undefined): boolean {
  const masterInfo = useTGPMasterByAddr(userAddr);
  return !!masterInfo;
}
export function useIsRegistered(userAddr: string | undefined): boolean {
  const isRegistered = useAppSelector(selectTGPUserIsRegistered(userAddr));
  return isRegistered;
}

export function useUserCheckStatus(userAddr: string | undefined): FETCHING_STATUS {
  const status = useAppSelector(selectTGPUserCheckStatus(userAddr));
  return status;
}
let userPolling: NodeJS.Timeout;
export function useFetchTGPUser(): void {
  const userAddr = useUserAddr();
  const dispatch = useAppDispatch();
  useDebounceEffect(
    () => {
      if (!userAddr) return;
      dispatch(getTGPUserPreCheck({ userAddr }));
      const token = getTGPJWTToken(userAddr);
      dispatch(setTGPJWTToken({ userAddr, jwtToken: token || '' }));
      if (!token) return;
      if (userPolling) {
        clearInterval(userPolling);
      }
      userPolling = pollingFunc(() => {
        userAddr && dispatch(getTGPUser({ userAddr }));
      }, TGP_POLLING_INTERVAL);

      // userAddr && dispatch(getUserDashboard({ userAddr }));
      return () => {
        userAddr && dispatch(setTGPJWTToken({ userAddr, jwtToken: '' }));
        userPolling && clearInterval(userPolling);
      };
    },
    [dispatch, userAddr],
    { wait: 100 },
  );
}
export function useFetchTGPMasters(): void {
  const userAddr = useUserAddr();
  const dispatch = useAppDispatch();
  useEffect(() => {
    userAddr && dispatch(getTGPMasters({ userAddr }));
  }, [dispatch, userAddr]);
}

export function useTGPTwitterLink(
  week: number | undefined,
  type: 'luckyDraw' | 'rank',
  status: 'claim' | 'shareToGetTicket',
  isMaster: boolean,
): string | undefined {
  const tgpConfig = useTGPDappConfig();
  return useMemo(() => {
    const href = window.location.href;
    if (week && type && status) {
      const twitterTxt = encodeURIComponent(
        _.replace(
          _.get(
            tgpConfig.twitterShare,
            [
              `week${week}`,
              type,
              status === 'claim' && type === 'rank' ? `${status}${isMaster ? 'Master' : 'Open'}` : status,
            ],
            '',
          ) as string,
          '{{link}}',
          href,
        ),
      );

      return `${TWITTER_SHARE_LINK}${twitterTxt}`;
    }
  }, [isMaster, status, tgpConfig.twitterShare, type, week]);
}
export function useIsPairInTGP(symbol: string | undefined): boolean {
  const config = useTGPDappConfig();
  return useMemo(
    () => config.trade.isShowTrade && config.trade.supportPairs.includes(symbol || ''),
    [config.trade.isShowTrade, config.trade.supportPairs, symbol],
  );
}
export function useIsTGPEnded(season: number, userAddr: string | undefined): boolean {
  const [ended, setEnded] = useState<boolean>(false);
  const currentSeasonWeeks = useTGPSeasonWeeks(season, userAddr);
  let polling: NodeJS.Timeout;
  useEffect(() => {
    if (polling) {
      clearInterval(polling);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    polling = pollingFunc(() => {
      const now = moment().utc();
      const week = _.last(currentSeasonWeeks);
      setEnded(week ? now.isAfter(moment.utc(week?.endTs)) : false);
    }, TGP_POLLING_INTERVAL_LONG);

    return () => polling && clearInterval(polling);
  }, []);
  return ended;
}

export function useTGPMasterByAddr(userAddr: string | undefined): ITGPMaster | undefined {
  const TGPMasters = useTGPMasters();
  return useMemo(
    () => TGPMasters?.find((m) => userAddr && m.userId.toLowerCase() === userAddr.toLowerCase()),
    [TGPMasters, userAddr],
  );
}
