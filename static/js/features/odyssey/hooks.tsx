import { useDebounceEffect } from 'ahooks';
import _ from 'lodash';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { FETCHING_STATUS, GlobalModalType } from '@/constants';
import { TWITTER_SHARE_LINK } from '@/constants/odyssey';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useAppDispatch, useAppSelector, useQueryParam } from '@/hooks';
import { useTxNotification } from '@/hooks/useTxNotification';
import { useChainId, useChainName, useChainShortName, useUserAddr } from '@/hooks/web3/useChain';
import { useWalletAccount, useWalletSigner } from '@/hooks/web3/useWalletNetwork';
import {
  IEpoch,
  IEpochDetail,
  IInfoOverview,
  ILeaderBoard,
  IOdysseyChainConfig,
  IOdysseyDashboard,
  IRanking,
  IRecentJoin,
  ITokenProof,
  ITokenRanking,
  IUserPoints,
  IUserProfile,
  ODYSSEY_STEP,
  ODYSSEY_TABS,
} from '@/types/odyssey';
import { ItemStatus } from '@/types/redux';
import {
  getOdysseyJWTToken,
  getOdysseyReferralCodeToLocalForage,
  saveOdysseyReferralCodeToLocalForage,
  saveOdysseySignatureToLocalForage,
} from '@/utils/storage';

import { CHAIN_ID, CHAIN_NAME_ID, DAPP_CHAIN_CONFIGS } from '@/constants/chain';
import { useSwitchNetwork } from '@/hooks/web3/useSwitchConnectorNetwork';
import { getChainIdByChainShortName } from '@/utils/chain';
import { useToggleModal } from '../global/hooks';
import { useWalletChainId } from '../wallet/hook';
import {
  getUserDashboard,
  getUserPrePoints,
  getUserProfile,
  saveReferralCode,
  setOdysseyRegistered,
  setOdysseyUserJWT,
  signOdysseyMsg,
} from './actions';
import {
  selectActiveEpoch,
  selectCurrentEpoch,
  selectEarnPoints,
  selectEpochs,
  selectEpochsStatus,
  selectInfoOverview,
  selectLeaderBoard,
  selectLeaderBoardStatus,
  selectOdysseyTab,
  selectPointsEarning,
  selectRecentJoins,
  selectSharedReferralCode,
  selectSignUpSkipped,
  selectTradePoints,
  selectUserBlastOOPoints,
  selectUserCurrentStep,
  selectUserDashboard,
  selectUserDashboardStatus,
  selectUserEpochDetail,
  selectUserJWT,
  selectUserOdysseyRegistered,
  selectUserPrePoint,
  selectUserProfile,
  selectUserProfileStatus,
  selectUserRanking,
  selectUserRankingStatus,
  selectUserTokenProof,
  selectUserTokenRanking,
} from './slice';

export function useOdysseyProfile(userAddr: string | undefined, chainId: number | undefined): IUserProfile | undefined {
  const profile = useAppSelector(selectUserProfile(userAddr, chainId));
  return useMemo(() => profile, [profile]);
}
export function useOdysseyProfileStatus(userAddr: string | undefined, chainId: number | undefined): FETCHING_STATUS {
  const profile = useAppSelector(selectUserProfileStatus(userAddr, chainId));
  return useMemo(() => profile, [profile]);
}

export function useCurrentStep(userAddr: string | undefined, chainId: number | undefined): ODYSSEY_STEP {
  return useAppSelector(selectUserCurrentStep(userAddr, chainId));
}
export function useUserOdysseyJWT(userAddr: string | undefined, chainId: number | undefined): string | undefined {
  return useAppSelector(selectUserJWT(userAddr, chainId));
}
export function useSignUpSkipped(userAddr: string | undefined, chainId: number | undefined): boolean {
  return useAppSelector(selectSignUpSkipped(userAddr, chainId));
}

export function useOdysseyTab(): ODYSSEY_TABS | undefined {
  return useAppSelector(selectOdysseyTab);
}

export function useUserDashboard(
  userAddr: string | undefined,
  chainId: number | undefined,
): IOdysseyDashboard | undefined {
  return useAppSelector(selectUserDashboard(userAddr, chainId));
}
export function useUserDashboardStatus(userAddr: string | undefined, chainId: number | undefined): FETCHING_STATUS {
  return useAppSelector(selectUserDashboardStatus(userAddr, chainId));
}

export function useUserPrePoint(userAddr: string | undefined, chainId: number | undefined): number {
  return useAppSelector(selectUserPrePoint(userAddr, chainId));
}
export function useUserBlastPoints(
  userAddr: string | undefined,
  chainId: number | undefined,
): ItemStatus<IUserPoints> | undefined {
  return useAppSelector(selectUserBlastOOPoints(userAddr, chainId));
}
export function useUserOdysseyRegistered(userAddr: string | undefined, chainId: number | undefined): boolean {
  return useAppSelector(selectUserOdysseyRegistered(userAddr, chainId));
}

export function useUserLeaderBoard(chainId: number | undefined): ILeaderBoard | undefined {
  return useAppSelector(selectLeaderBoard(chainId));
}

export function useLeaderBoardStatus(chainId: number | undefined): FETCHING_STATUS {
  return useAppSelector(selectLeaderBoardStatus(chainId));
}

export function useEpochs(chainId: number | undefined): IEpoch[] {
  const epochs = useAppSelector(selectEpochs(chainId));
  return useMemo(() => epochs.filter((e) => e.startTs * 1000 <= Date.now()), [epochs]);
}
export function useEpochsStatus(chainId: number | undefined): FETCHING_STATUS | undefined {
  const status = useAppSelector(selectEpochsStatus(chainId));
  return useMemo(() => status, [status]);
}

export function useCurrentEpoch(chainId: number | undefined): IEpoch | undefined {
  return useAppSelector(selectCurrentEpoch(chainId));
}

export function useActiveEpoch(chainId: number | undefined): IEpoch | undefined {
  return useAppSelector(selectActiveEpoch(chainId));
}

export function useRecentJoins(chainId: number | undefined): IRecentJoin[] {
  return useAppSelector(selectRecentJoins(chainId));
}

export function useTradePoints(
  chainId: number | undefined,
  userAddr: string | undefined,
  pairId: string | undefined,
): WrappedBigNumber | undefined {
  return useAppSelector(selectTradePoints(chainId, userAddr, pairId));
}

export function useEarnPoints(
  chainId: number | undefined,
  userAddr: string | undefined,
  pairId: string | undefined,
): WrappedBigNumber | undefined {
  return useAppSelector(selectEarnPoints(chainId, userAddr, pairId));
}

export function useUserRanking(
  userAddr: string | undefined,
  epoch: number | undefined,
  chainId: number | undefined,
): IRanking | undefined {
  return useAppSelector(selectUserRanking(userAddr, epoch, chainId));
}
export function useUserEpochDetail(
  userAddr: string | undefined,
  epoch: number | undefined,
  chainId: number | undefined,
): IEpochDetail | undefined {
  return useAppSelector(selectUserEpochDetail(userAddr, epoch, chainId));
}
export function useUserTokenProof(
  userAddr: string | undefined,
  chainId: number | undefined,
): ITokenProof[] | undefined {
  return useAppSelector(selectUserTokenProof(userAddr, chainId));
}
export function useUserTokenRanking(
  userAddr: string | undefined,
  chainId: number | undefined,
): ItemStatus<ITokenRanking> | undefined {
  return useAppSelector(selectUserTokenRanking(userAddr, chainId));
}
export function useUserRankingStatus(
  userAddr: string | undefined,
  epoch: number | undefined,
  chainId: number | undefined,
): FETCHING_STATUS | undefined {
  return useAppSelector(selectUserRankingStatus(userAddr, epoch, chainId));
}

export function useOdysseyDappConfig() {
  const odysseyDappConfig = useAppSelector((state) => state.odyssey.odysseyDappConfig);
  return useMemo(() => {
    return odysseyDappConfig;
  }, [odysseyDappConfig]);
}
export function useOdysseyDappChainConfig(chainId: number | undefined): IOdysseyChainConfig | undefined {
  const odysseyDappConfig = useOdysseyDappConfig();
  return useMemo(() => {
    return _.get(odysseyDappConfig?.chainConfig, [chainId || '']);
  }, [chainId, odysseyDappConfig?.chainConfig]);
}

export function useInfoOverview(chainId: number | undefined): IInfoOverview | undefined {
  return useAppSelector(selectInfoOverview(chainId));
}

/**
 * get referral code from url
 * @returns
 */
export function useSharedReferralCode(chainId: number | undefined): string | undefined {
  return useAppSelector(selectSharedReferralCode(chainId));
}

export function useChainOdysseyDappConfig(chainId: number | undefined): IOdysseyChainConfig | undefined {
  const odysseyDappConfig = useOdysseyDappConfig();
  return useMemo(() => {
    if (chainId) return odysseyDappConfig?.chainConfig[chainId];
  }, [odysseyDappConfig, chainId]);
}

export function useGetSharedCode(userAddr: string | undefined): void {
  const { referralCode, chainName } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const chainId = CHAIN_NAME_ID[chainName || ''];

  useDebounceEffect(
    () => {
      if (referralCode && chainId) {
        dispatch(saveReferralCode({ referralCode, userAddr, chainId }));
        saveOdysseyReferralCodeToLocalForage(referralCode, userAddr, chainId);
        navigate('/odyssey', { replace: true });
        gtag('event', 'enter_odyssey', {
          entrance: 'referral_link',
        });
      } else {
        // gtag('event', 'enter_odyssey', {
        //   entrance: 'normal_link',
        // });
        chainId &&
          getOdysseyReferralCodeToLocalForage(userAddr, chainId).then((code) => {
            code && dispatch(saveReferralCode({ referralCode: code, userAddr, chainId }));
          });
      }
    },
    [referralCode, userAddr],
    { wait: 200 },
  );
}

export function useUserReferralLink(userAddr: string | undefined, chainId: number | undefined): string | undefined {
  const profile = useOdysseyProfile(userAddr, chainId);
  const chainName = useChainShortName(chainId);
  return useMemo(() => {
    if (profile?.referralCode && chainName) {
      const href = window.location.href.split('?')[0];
      return `${href}/${chainName?.toLowerCase()}/${profile?.referralCode}`;
    }
  }, [profile?.referralCode, chainName]);
}
export function useTwitterLink(userAddr: string | undefined): () => string {
  const chainId = useChainId();
  const link = useUserReferralLink(userAddr, chainId);
  const odysseyConfig = useOdysseyDappChainConfig(chainId);
  const odysseyProfile = useOdysseyProfile(userAddr, chainId);
  const getTwitterLink = useCallback(() => {
    const random = Math.floor(Math.random() * 4);
    if (!odysseyConfig?.twitter) return '';
    return `${TWITTER_SHARE_LINK}${encodeURIComponent(
      odysseyProfile?.isKol ? odysseyConfig.twitter.kol[random] : odysseyConfig.twitter.open[random],
    )}&url=${encodeURIComponent(link || '')}`;
  }, [link, odysseyConfig?.twitter, odysseyProfile?.isKol]);
  return getTwitterLink;
}

export function useGetUserProfile(updateQueries?: boolean): void {
  updateQueries;
  //console.log('🚀 ~ useGetUserProfile ~ updateQueries:', updateQueries);
  const userAddr = useUserAddr();
  // const [searchParams] = useSearchParams();
  // const tabParam = useMemo(() => searchParams.get('tab'), [searchParams]);
  const dispatch = useAppDispatch();
  // const navigate = useNavigate();
  const chainId = useChainId();
  // updates the query params
  // const setQueryParams = useCallback(
  //   (key?: string) => {
  //     navigate({
  //       search: key ? `?tab=${key}` : '',
  //     });
  //   },
  //   [navigate],
  // );

  const initProfile = useCallback(async () => {
    if (userAddr && chainId) {
      try {
        const profile = await dispatch(getUserProfile({ userAddr, chainId })).unwrap();

        if (profile) {
          dispatch(setOdysseyRegistered({ userAddr, registered: true, chainId }));
          // if (updateQueries) {
          //   if (profile.status !== USER_STATUS.TWITTER_CONNECTED) {
          //     // if (tabParam) {
          //     //   if (Object.values(ODYSSEY_TABS).includes(tabParam as ODYSSEY_TABS)) {
          //     //     // dispatch(setOdysseyTab({ tab: tabParam as ODYSSEY_TABS }));
          //     //   } else {
          //     //     // dispatch(setOdysseyTab({ tab: ODYSSEY_TABS.EARN_POINTS }));
          //     //   }
          //     // } else {
          //     //   // setQueryParams(ODYSSEY_TABS.EARN_POINTS);
          //     // }
          //   } else {
          //     // setQueryParams('');
          //     // dispatch(setOdysseyTab({ tab: ODYSSEY_TABS.EARN_POINTS }));
          //   }
          // }
        } else {
          throw new Error('Failed to get user profile');
        }
      } catch (e) {
        // if (updateQueries) {
        //   const skipped = localStorage.getItem(`${SIGN_UP_SKIPPED}-${userAddr}-${chainId}`);
        //   // if (tabParam !== ODYSSEY_TABS.LEADER_BOARD) {
        //   //   setQueryParams(skipped ? ODYSSEY_TABS.EARN_POINTS : '');
        //   //   dispatch(setOdysseyTab({ tab: ODYSSEY_TABS.EARN_POINTS }));
        //   // }
        //   // if (tabParam === ODYSSEY_TABS.LEADER_BOARD) {
        //   //   dispatch(setOdysseyTab({ tab: tabParam as ODYSSEY_TABS }));
        //   // }
        // }
      }
    }
  }, [dispatch, userAddr, chainId]);

  useDebounceEffect(
    () => {
      if (!userAddr || !chainId) return;
      const token = getOdysseyJWTToken(userAddr, chainId);
      token && chainId && dispatch(setOdysseyUserJWT({ userAddr, token, chainId }));
      dispatch(getUserDashboard({ userAddr, chainId }));
      initProfile();
      if (!token) return;
      return () => {
        // userAddr && dispatch(resetState({ userAddr }));
      };
    },
    [dispatch, userAddr, chainId],
    { wait: 100 },
  );
}

export function useGetUserPrePoints(userAddr: string | undefined): void {
  const dispatch = useAppDispatch();
  const chainId = useChainId();
  const currentEpoch = useActiveEpoch(chainId);
  useEffect(() => {
    if (!userAddr) return;

    currentEpoch && userAddr && chainId && dispatch(getUserPrePoints({ userAddr, epoch: currentEpoch.epoch, chainId }));
  }, [currentEpoch, dispatch, userAddr, chainId]);
}

/**
 * handle twitter error message, show notification and clear url
 */
export function useHandleTwitterErrorMsg(): void {
  const errMsg = useQueryParam('errMsg');
  const { t } = useTranslation();
  const notification = useTxNotification();
  const [, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (errMsg) {
      if (errMsg !== 'undefined') {
        notification.error({
          message: t('odyssey.signUp.twitterErrorTitle'),
          description: errMsg,
        });
        gtag('event', 'connect_twitter_result', {
          connect_twitter_result: 'fail',
          exception: errMsg,
        });
      }
      setSearchParams('', { replace: true });
    }
  }, [errMsg, notification, setSearchParams, t]);
}

export function useSignUp(): () => Promise<boolean> {
  const toggleModal = useToggleModal(GlobalModalType.Wallet);
  const userAddr = useWalletAccount();
  const dispatch = useAppDispatch();
  const signer = useWalletSigner();
  const chainId = useChainId();
  const code = useSharedReferralCode(chainId);
  const { t } = useTranslation();
  const onBtnClick = useCallback(async (): Promise<boolean> => {
    if (userAddr && chainId) {
      try {
        if (signer) {
          const response = await dispatch(
            signOdysseyMsg({ userAddr, message: '', inviteCode: code, signer, chainId }),
          ).unwrap();
          if (response) {
            response.data && saveOdysseySignatureToLocalForage(response.data);
            return true;
          }
        }
        return false;
      } catch (error) {
        toast.error(
          <div className="syn-notification-content">
            <div className="syn-notification-content-title">{t('odyssey.signUp.step1.error')}</div>
          </div>,
        );
        return false;
      }
    } else {
      toggleModal(true);
      return false;
    }
  }, [chainId, code, dispatch, signer, t, toggleModal, userAddr]);
  return onBtnClick;
}

export function usePointsPerDay(
  userAddr: string | undefined,
  chainId: number | undefined,
): WrappedBigNumber | undefined {
  return useAppSelector(selectPointsEarning(userAddr, chainId));
}
export function useOdysseyReferralNetworkCheck(): void {
  const chainName = useChainName();
  const walletChainId = useWalletChainId();
  const { chainName: referralChainName } = useParams();
  const { switchWalletNetwork, switchAppNetwork } = useSwitchNetwork();
  useEffect(() => {
    if (referralChainName) {
      const desiredChainId = getChainIdByChainShortName(referralChainName);
      if (
        chainName?.toLocaleLowerCase() !== referralChainName?.toLocaleLowerCase() ||
        (desiredChainId && desiredChainId !== walletChainId)
      ) {
        desiredChainId && switchWalletNetwork(desiredChainId);
        desiredChainId && switchAppNetwork(desiredChainId);
      }
    }
  }, [referralChainName, chainName, walletChainId]);
}

export function useOdysseyDisplayChainId(): CHAIN_ID | undefined {
  const chainId = useChainId();
  const odysseyConfig = useOdysseyDappConfig();
  return useMemo(() => {
    if (chainId) {
      const defaultChainId = CHAIN_ID.BLAST;
      if (odysseyConfig?.supportChains.includes(chainId)) {
        return chainId;
      }
      return defaultChainId;
    }
  }, [chainId, odysseyConfig?.supportChains]);
}

export function useOdysseyChainIconStr(): string | undefined {
  const ooChainId = useOdysseyDisplayChainId();
  return useMemo(() => {
    const defaultChainId = CHAIN_ID.BLAST;
    return DAPP_CHAIN_CONFIGS[ooChainId || defaultChainId].network.icon;
  }, [ooChainId]);
}
