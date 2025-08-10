import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import _ from 'lodash';

import { FETCHING_STATUS } from '@/constants';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import {
  IEpoch,
  IEpochDetail,
  IInfoOverview,
  ILeaderBoard,
  IOdysseyDappConfig,
  IOdysseyDashboard,
  IOdysseySignature,
  IRanking,
  IRecentJoin,
  ITokenProof,
  ITokenRanking,
  IUserPoints,
  IUserProfile,
  ODYSSEY_STEP,
  ODYSSEY_TABS,
  USER_STATUS,
} from '@/types/odyssey';
import {
  getDefaultItemStatus,
  getDefaultListArrayStatus,
  ItemStatus,
  ListArrayStatus,
  setFulfilledItemStatus,
  setFulfilledListArrayStatus,
} from '@/types/redux';
import { getStepByUserStatus } from '@/utils/odyssey';
import { currentUnixTime } from '@/utils/timeUtils';

import { getOdysseyConfigWithoutEarnOoPointPairs } from '@/configs';
import { AppState } from '../store';
import {
  claimExtraPointsAction,
  getEpochs,
  getInfoOverview,
  getLeaderBoard,
  getRecentJoins,
  getUserBlastOOPoints,
  getUserDashboard,
  getUserEpochDetails,
  getUserPrePoints,
  getUserProfile,
  getUserRanking,
  getUserTokenProof,
  getUserTokenRanking,
  openBoxAction,
  postUpdateProfile,
  resetState,
  saveReferralCode,
  setCurrentEpoch,
  setCurrentStep,
  setOdysseyRegistered,
  setOdysseyTab,
  setOdysseyUserJWT,
  setSignUpSkipped,
  signOdysseyMsg,
  simulateEarningPoints,
  simulatePointsByAddLiquidity,
  simulatePointsByLimitTrade,
} from './actions';

export interface IOdysseyState {
  chainUserProfile: { [chainId: number]: { [userAddr: string]: ItemStatus<IUserProfile> } };
  chainUserPrePoint: { [chainId: number]: { [userAddr: string]: ItemStatus<number> } };
  chainUserSignature: {
    [chainId: number]: {
      [userAddr: string]: IOdysseySignature;
    };
  };
  chainSignUpSkipped: {
    [chainId: number]: {
      [userAddr: string]: boolean;
    };
  };
  chainUserJWTToKEN: {
    [chainId: number]: {
      [userAddr: string]: string;
    };
  };
  chainUserTokenProof: { [chainId: number]: { [userAddr: string]: ITokenProof[] } };
  chainCurrentStep: {
    [chainId: number]: {
      [userAddr: string]: ODYSSEY_STEP;
    };
  };
  chainUserRegistered: { [chainId: number]: { [userAddr: string]: boolean } };
  chainUserDashboard: {
    [chainId: number]: {
      [userAddr: string]: ItemStatus<IOdysseyDashboard>;
    };
  };
  chainUserPointsPerDay: {
    [chainId: number]: {
      [userAddr: string]: WrappedBigNumber;
    };
  };
  chainUserPoints: { [chainId: number]: { [userAddr: string]: ItemStatus<IUserPoints> } };
  chainLeaderBoard: { [chainId: number]: ItemStatus<ILeaderBoard | undefined> };
  chainCurrentEpoch: { [chainId: number]: IEpoch | undefined };
  chainEpochs: { [chainId: number]: ListArrayStatus<IEpoch> };
  chainRecentJoins: { [chainId: number]: ListArrayStatus<IRecentJoin> };
  chainReferralCode: { [chainId: number]: string }; // code from shared link
  chainUserRanking: {
    [chainId: number]: {
      [userAddr: string]: { [epoch: string]: ItemStatus<IRanking> };
    };
  };
  chainUserEpochDetails: {
    [chainId: number]: {
      [userAddr: string]: { [epoch: string]: IEpochDetail };
    };
  };
  chainUserTokenRanking: {
    [chainId: number]: {
      [userAddr: string]: ItemStatus<ITokenRanking>;
    };
  };
  odysseyDappConfig: IOdysseyDappConfig;
  chainPairPointTradeSimulation: {
    [chainId: number]: {
      [userAddr: string]: {
        [pairSymbol: string]: WrappedBigNumber;
      };
    };
  };
  chainPairPointEarnSimulation: {
    [chainId: number]: {
      [userAddr: string]: {
        [pairSymbol: string]: WrappedBigNumber;
      };
    };
  };
  odysseyTab: ODYSSEY_TABS | undefined;
  chainActiveEpoch: { [chainId: number]: IEpoch | undefined }; // current active epoch for user to earn points
  chainInfoOverview: {
    [chainId: number]: IInfoOverview | undefined;
  };
}

export const initialState: IOdysseyState = {
  chainUserProfile: {},
  chainUserPrePoint: {},
  chainUserDashboard: {},
  chainUserJWTToKEN: {},
  chainUserSignature: {},
  chainUserTokenProof: {},
  chainSignUpSkipped: {},
  chainUserPointsPerDay: {},
  chainReferralCode: {},
  chainLeaderBoard: {},
  chainCurrentEpoch: {},
  chainEpochs: {},
  chainRecentJoins: {},
  chainUserRanking: {},
  chainUserEpochDetails: {},
  chainUserTokenRanking: {},
  chainCurrentStep: {},
  odysseyDappConfig: getOdysseyConfigWithoutEarnOoPointPairs(),
  chainPairPointTradeSimulation: {},
  chainPairPointEarnSimulation: {},
  odysseyTab: undefined,
  chainActiveEpoch: {},
  chainUserPoints: {},
  chainUserRegistered: {},
  chainInfoOverview: {},
};

export const odysseySlice = createSlice({
  name: 'odyssey',
  initialState,
  reducers: {
    setOdysseyDappConfig: (state, { payload }: PayloadAction<IOdysseyDappConfig>) => {
      state.odysseyDappConfig = payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resetState, (state, { payload }) => {
      const userAddr = payload.userAddr;
      const currentProfile = _.get(state.chainUserProfile, [payload.chainId, userAddr]);
      if (!currentProfile) {
        _.set(state.chainUserProfile, [payload.chainId, userAddr], getDefaultItemStatus(FETCHING_STATUS.DONE));
      }
    });
    builder.addCase(setSignUpSkipped, (state, { payload }) => {
      _.set(state.chainSignUpSkipped, [payload.chainId, payload.userAddr], true);
    });
    builder.addCase(setCurrentEpoch, (state, { payload }) => {
      _.set(state.chainCurrentEpoch, [payload.chainId], payload.epoch);
    });
    builder.addCase(setOdysseyTab, (state, { payload }) => {
      state.odysseyTab = payload.tab;
    });
    builder.addCase(setCurrentStep, (state, { payload }) => {
      _.set(state.chainCurrentStep, [payload.chainId, payload.userAddr], payload.step);
    });
    builder.addCase(saveReferralCode, (state, { payload }) => {
      _.set(state.chainReferralCode, [payload.chainId], payload.referralCode);
    });

    // builder.addCase(signOdysseyMsg.pending, (state, { payload,meta }) => {
    // });
    builder.addCase(signOdysseyMsg.fulfilled, (state, { payload, meta }) => {
      const { userAddr, chainId } = meta.arg;
      if (payload) {
        _.set(state.chainUserSignature, [chainId, userAddr], payload);
        _.set(state.chainUserJWTToKEN, [chainId, userAddr], payload.jwtToken);
        _.set(state.chainCurrentStep, [chainId, userAddr], ODYSSEY_STEP.CONNECTED_WALLET);
        const userProfile = _.get(state.chainUserProfile, [chainId, userAddr, 'item']);
        if (!userProfile)
          _.set(state.chainUserProfile, [chainId, userAddr], getDefaultItemStatus(FETCHING_STATUS.DONE));
      }
    });
    builder.addCase(postUpdateProfile.fulfilled, (state, { payload, meta }) => {
      const { userAddr, email, discordId: discord, username, chainId } = meta.arg;
      if (payload) {
        if (discord) {
          _.set(state.chainCurrentStep, [chainId, userAddr], ODYSSEY_STEP.FOLLOWED_DISCORD);
          _.set(state.chainUserProfile, [chainId, userAddr, 'item', 'status'], USER_STATUS.DISCORD_CONNECTED);
        }
        if (email) {
          _.set(state.chainCurrentStep, [chainId, userAddr], ODYSSEY_STEP.FILLED_EMAIL);
          _.set(state.chainUserProfile, [chainId, userAddr, 'item', 'status'], USER_STATUS.EMAIL_CONNECTED);
        }
        // if (discord || email) {
        //   const boxs = _.get(state.userDashboard, ['item', 'boxes'], 0);
        //   _.set(state.userDashboard, [userAddr, 'item', 'boxes'], boxs + 1);
        // }
        if (username) {
          _.set(state.chainUserRanking, [chainId, userAddr, 'item', 'username'], username);
          _.set(state.chainUserTokenRanking, [chainId, userAddr, 'item', 'username'], username);
        }
      }
    });
    builder.addCase(getUserDashboard.pending, (state, { meta }) => {
      const { userAddr, chainId } = meta.arg;
      _.set(state.chainUserDashboard, [chainId, userAddr, 'status'], FETCHING_STATUS.INIT);
    });
    builder.addCase(getUserDashboard.fulfilled, (state, { payload, meta }) => {
      const { userAddr, chainId } = meta.arg;
      if (payload) {
        _.set(state.chainUserDashboard, [chainId, userAddr], setFulfilledItemStatus(payload));
      }
    });
    builder.addCase(getUserDashboard.rejected, (state, { meta }) => {
      const { userAddr, chainId } = meta.arg;
      _.set(state.chainUserDashboard, [chainId, userAddr, 'status'], FETCHING_STATUS.DONE);
    });
    builder.addCase(getLeaderBoard.pending, (state, { meta }) => {
      // const leaderboard = _.get(state.leaderBoard, ['item']);
      const { chainId } = meta.arg;
      _.set(state.chainLeaderBoard, [chainId, 'status'], FETCHING_STATUS.INIT);
    });
    builder.addCase(getLeaderBoard.fulfilled, (state, { payload, meta }) => {
      const { chainId } = meta.arg;
      if (payload) {
        _.set(state.chainLeaderBoard, [chainId], setFulfilledItemStatus(payload));
      }
    });
    builder.addCase(getLeaderBoard.rejected, (state, { meta }) => {
      const { chainId } = meta.arg;
      _.set(state.chainLeaderBoard, [chainId, 'status'], FETCHING_STATUS.DONE);
    });
    builder.addCase(getEpochs.pending, (state, { meta }) => {
      const { chainId } = meta.arg;
      const epochs = _.get(state.chainEpochs, [chainId, 'list']);
      if (!epochs) _.set(state.chainEpochs, [chainId], getDefaultListArrayStatus());
      else {
        _.set(state.chainEpochs, [chainId, 'status'], FETCHING_STATUS.FETCHING);
      }
    });
    builder.addCase(getEpochs.fulfilled, (state, { payload, meta }) => {
      const { chainId } = meta.arg;
      if (payload) {
        _.set(state.chainEpochs, [chainId], setFulfilledListArrayStatus(payload));
        const currentTime = currentUnixTime();
        // find active epoch
        const activeEpoch = payload.find((epoch) => epoch.startTs <= currentTime && currentTime <= epoch.endTs);
        const minEpoch = _.minBy(payload, (epoch) => epoch.startTs);
        const maxEpoch = _.maxBy(payload, (epoch) => epoch.endTs);
        if (activeEpoch) {
          _.set(state.chainCurrentEpoch, [chainId], activeEpoch);
          _.set(state.chainActiveEpoch, [chainId], activeEpoch);
        } else if (minEpoch && currentTime < minEpoch.startTs) {
          _.set(state.chainCurrentEpoch, [chainId], minEpoch);
          _.set(state.chainActiveEpoch, [chainId], minEpoch);
        } else if (maxEpoch && currentTime > maxEpoch.endTs) {
          _.set(state.chainCurrentEpoch, [chainId], maxEpoch);
          _.set(state.chainActiveEpoch, [chainId], maxEpoch);
        } else {
          _.set(state.chainCurrentEpoch, [chainId], undefined);
          _.set(state.chainActiveEpoch, [chainId], undefined);
        }
      }
    });
    builder.addCase(getEpochs.rejected, (state, { meta }) => {
      const { chainId } = meta.arg;

      _.set(state.chainEpochs, [chainId], getDefaultListArrayStatus());
    });
    builder.addCase(getRecentJoins.pending, (state, { meta }) => {
      const { chainId } = meta.arg;
      const recentJoins = _.get(state.chainRecentJoins, [chainId, 'item']);
      if (!recentJoins) _.set(state.chainRecentJoins, [chainId], getDefaultListArrayStatus());
      else {
        _.set(state.chainRecentJoins, [chainId, 'status'], FETCHING_STATUS.FETCHING);
      }
    });
    builder.addCase(getRecentJoins.fulfilled, (state, { payload, meta }) => {
      const { chainId } = meta.arg;
      if (payload) {
        _.set(state.chainRecentJoins, [chainId], setFulfilledListArrayStatus(payload));
      }
    });
    builder.addCase(getRecentJoins.rejected, (state, { meta }) => {
      const { chainId } = meta.arg;
      _.set(state.chainRecentJoins, [chainId], getDefaultListArrayStatus());
    });
    builder.addCase(getUserProfile.pending, (state, { meta }) => {
      const { userAddr, chainId } = meta.arg;
      const userProfile = _.get(state.chainUserProfile, [chainId, userAddr, 'item']);
      if (!userProfile) {
        _.set(state.chainUserProfile, [chainId, userAddr], getDefaultItemStatus());
      } else {
        _.set(state.chainUserProfile, [chainId, userAddr, 'status'], FETCHING_STATUS.FETCHING);
      }
    });
    builder.addCase(getUserProfile.fulfilled, (state, { payload, meta }) => {
      const { userAddr, chainId } = meta.arg;
      _.set(state.chainUserProfile, [chainId, userAddr], setFulfilledItemStatus(payload));
      if (payload) {
        const stepStatus = getStepByUserStatus(payload.status);
        _.set(state.chainCurrentStep, [chainId, userAddr], stepStatus);
      }
    });
    builder.addCase(setOdysseyRegistered, (state, { payload }) => {
      _.set(state.chainUserRegistered, [payload.chainId, payload.userAddr], payload.registered);
    });
    builder.addCase(setOdysseyUserJWT, (state, { payload }) => {
      _.set(state.chainUserJWTToKEN, [payload.chainId, payload.userAddr], payload.token);
    });
    builder.addCase(getUserBlastOOPoints.pending, (state, { meta }) => {
      const { userAddr, chainId } = meta.arg;
      _.set(state.chainUserPoints, [chainId, userAddr, 'status'], FETCHING_STATUS.FETCHING);
    });
    builder.addCase(getUserBlastOOPoints.fulfilled, (state, { payload, meta }) => {
      const { userAddr, chainId } = meta.arg;
      if (payload) {
        _.set(state.chainUserPoints, [chainId, userAddr], setFulfilledItemStatus(payload));
      }
    });
    builder.addCase(getUserBlastOOPoints.rejected, (state, { meta }) => {
      const { userAddr, chainId } = meta.arg;
      _.set(state.chainUserPoints, [chainId, userAddr, 'status'], FETCHING_STATUS.DONE);
    });
    builder.addCase(getUserProfile.rejected, (state, { meta }) => {
      _.set(state.chainUserProfile, [meta.arg.userAddr, 'status'], FETCHING_STATUS.DONE);
    });

    builder.addCase(claimExtraPointsAction.fulfilled, (state, { payload, meta }) => {
      const { userAddr, chainId } = meta.arg;
      if (payload) {
        const currentProfile = _.get(state.chainUserProfile, [chainId, userAddr, 'item']);
        _.set(
          state.chainUserProfile,
          [chainId, userAddr],
          setFulfilledItemStatus({ ...currentProfile, status: USER_STATUS.EXTRA_POINTS_CLAIMED }),
        );
      }
    });

    builder.addCase(openBoxAction.fulfilled, (state, { meta }) => {
      const { userAddr, count, chainId } = meta.arg;
      if (count && count > 0) {
        const dashboard = _.get(state.chainUserDashboard, [chainId, userAddr, 'item']);
        const box = Math.max(0, (dashboard.boxes || 0) - count);
        _.set(state.chainUserDashboard, [chainId, userAddr, 'item', 'boxes'], box);
      }
    });
    builder.addCase(openBoxAction.rejected, (state, { meta }) => {
      console.log('🚀 ~ meta:', meta, state);
    });
    builder.addCase(getUserRanking.pending, (state, { meta }) => {
      const { userAddr, epoch, chainId } = meta.arg;
      if (meta.arg.epoch === _.get(state.chainCurrentEpoch, [chainId])?.epoch) {
        _.set(state.chainUserRanking, [chainId, userAddr, `${epoch}_epoch`, 'status'], FETCHING_STATUS.FETCHING);
      }
    });
    builder.addCase(getUserRanking.rejected, (state, { meta }) => {
      const { userAddr, epoch, chainId } = meta.arg;
      _.set(state.chainUserRanking, [chainId, userAddr, `${epoch}_epoch`, 'status'], FETCHING_STATUS.DONE);
    });
    builder.addCase(getUserRanking.fulfilled, (state, { payload, meta }) => {
      const { userAddr, epoch, chainId } = meta.arg;
      _.set(state.chainUserRanking, [chainId, userAddr, `${epoch}_epoch`], setFulfilledItemStatus(payload));
    });
    builder.addCase(getUserEpochDetails.fulfilled, (state, { payload, meta }) => {
      const { userAddr, chainId } = meta.arg;
      if (payload) {
        _.set(
          state.chainUserEpochDetails,
          [chainId, userAddr],
          _.keyBy(payload, (e) => `epoch_${e.epoch}`),
        );
      }
    });
    builder.addCase(getUserTokenProof.fulfilled, (state, { payload, meta }) => {
      const { userAddr, chainId } = meta.arg;
      _.set(state.chainUserTokenProof, [chainId, userAddr], payload);
    });
    builder.addCase(getUserTokenRanking.pending, (state, { meta }) => {
      const { userAddr, chainId } = meta.arg;
      _.set(state.chainUserTokenRanking, [chainId, userAddr, 'status'], FETCHING_STATUS.FETCHING);
    });
    builder.addCase(getUserTokenRanking.rejected, (state, { meta }) => {
      const { userAddr, chainId } = meta.arg;
      _.set(state.chainUserTokenRanking, [chainId, userAddr, 'status'], FETCHING_STATUS.DONE);
    });
    builder.addCase(getUserTokenRanking.fulfilled, (state, { payload, meta }) => {
      const { userAddr, chainId } = meta.arg;
      if (payload) {
        _.set(state.chainUserTokenRanking, [chainId, userAddr], setFulfilledItemStatus(payload));
      }
    });
    builder.addCase(simulatePointsByAddLiquidity.fulfilled, (state, { meta, payload }) => {
      const { chainId, userAddr, pair } = meta.arg;
      _.set(state.chainPairPointEarnSimulation, [chainId, userAddr, pair.symbol], payload);
    });
    builder.addCase(simulatePointsByLimitTrade.fulfilled, (state, { meta, payload }) => {
      const { chainId, userAddr, pair } = meta.arg;
      _.set(state.chainPairPointTradeSimulation, [chainId, userAddr, pair.symbol], payload);
    });
    builder.addCase(getUserPrePoints.fulfilled, (state, { payload, meta }) => {
      const { userAddr, chainId } = meta.arg;
      if (payload) {
        _.set(state.chainUserPrePoint, [chainId, userAddr], setFulfilledItemStatus(payload));
      }
    });

    // getInfoOverview
    builder.addCase(getInfoOverview.fulfilled, (state, { meta, payload }) => {
      const { chainId } = meta.arg;
      if (payload) {
        _.set(state.chainInfoOverview, [chainId], payload);
      }
    });
    builder.addCase(simulateEarningPoints.fulfilled, (state, { meta, payload }) => {
      _.set(state.chainUserPointsPerDay, [meta.arg.chainId, meta.arg.userAddr], payload);
    });
  },
});
export const { setOdysseyDappConfig } = odysseySlice.actions;
export const selectUserProfile =
  (userAddr: string | undefined, chainId: number | undefined) =>
  (state: AppState): IUserProfile | undefined =>
    _.get(state.odyssey.chainUserProfile, [chainId || '', userAddr || '', 'item']);

export const selectUserProfileStatus =
  (userAddr: string | undefined, chainId: number | undefined) =>
  (state: AppState): FETCHING_STATUS =>
    _.get(state.odyssey.chainUserProfile, [chainId || '', userAddr || '', 'status'], FETCHING_STATUS.INIT);

export const selectUserJWT =
  (userAddr: string | undefined, chainId: number | undefined) =>
  (state: AppState): string | undefined =>
    _.get(state.odyssey.chainUserJWTToKEN, [chainId || '', userAddr || '']);

export const selectSignUpSkipped =
  (userAddr: string | undefined, chainId: number | undefined) =>
  (state: AppState): boolean =>
    _.get(state.odyssey.chainSignUpSkipped, [chainId || '', userAddr || '']);

export const selectUserCurrentStep =
  (userAddr: string | undefined, chainId: number | undefined) =>
  (state: AppState): ODYSSEY_STEP =>
    _.get(state.odyssey.chainCurrentStep, [chainId || '', userAddr || ''], ODYSSEY_STEP.INIT);

export const selectUserDashboard =
  (userAddr: string | undefined, chainId: number | undefined) =>
  (state: AppState): IOdysseyDashboard | undefined =>
    _.get(state.odyssey.chainUserDashboard, [chainId || '', userAddr || '', 'item']);

export const selectUserDashboardStatus =
  (userAddr: string | undefined, chainId: number | undefined) =>
  (state: AppState): FETCHING_STATUS =>
    _.get(state.odyssey.chainUserDashboard, [chainId || '', userAddr || '', 'status'], FETCHING_STATUS.INIT);

export const selectLeaderBoard =
  (chainId: number | undefined) =>
  (state: AppState): ILeaderBoard | undefined =>
    _.get(state.odyssey.chainLeaderBoard, [chainId || '', 'item']);

export const selectLeaderBoardStatus =
  (chainId: number | undefined) =>
  (state: AppState): FETCHING_STATUS =>
    _.get(state.odyssey.chainLeaderBoard, [chainId || '', 'status'], FETCHING_STATUS.INIT);

export const selectEarnPoints =
  (chainId: number | undefined, userAddr: string | undefined, pairId: string | undefined) =>
  (state: AppState): WrappedBigNumber | undefined =>
    _.get(state.odyssey.chainPairPointEarnSimulation, [chainId || '', userAddr || '', pairId || '']);

export const selectTradePoints =
  (chainId: number | undefined, userAddr: string | undefined, pairId: string | undefined) =>
  (state: AppState): WrappedBigNumber | undefined =>
    _.get(state.odyssey.chainPairPointTradeSimulation, [chainId || '', userAddr || '', pairId || '']);

export const selectEpochs =
  (chainId: number | undefined) =>
  (state: AppState): IEpoch[] =>
    _.get(state.odyssey.chainEpochs, [chainId || '', 'list'], []);
export const selectEpochsStatus =
  (chainId: number | undefined) =>
  (state: AppState): FETCHING_STATUS | undefined =>
    _.get(state.odyssey.chainEpochs, [chainId || '', 'status']);
export const selectCurrentEpoch =
  (chainId: number | undefined) =>
  (state: AppState): IEpoch | undefined =>
    _.get(state.odyssey.chainCurrentEpoch, [chainId || '']);
export const selectActiveEpoch =
  (chainId: number | undefined) =>
  (state: AppState): IEpoch | undefined =>
    _.get(state.odyssey.chainActiveEpoch, [chainId || '']);
export const selectRecentJoins =
  (chainId: number | undefined) =>
  (state: AppState): IRecentJoin[] =>
    _.get(state.odyssey.chainRecentJoins, [chainId || '', 'list'], []);
export const selectSharedReferralCode =
  (chainId: number | undefined) =>
  (state: AppState): string | undefined =>
    _.get(state.odyssey.chainReferralCode, [chainId || '']);
export const selectUserRanking =
  (userAddr: string | undefined, epoch: number | undefined, chainId: number | undefined) =>
  (state: AppState): IRanking | undefined =>
    _.get(state.odyssey.chainUserRanking, [chainId || '', userAddr || '', `${epoch}_epoch`, 'item']);
export const selectUserEpochDetail =
  (userAddr: string | undefined, epoch: number | undefined, chainId: number | undefined) =>
  (state: AppState): IEpochDetail | undefined =>
    _.get(state.odyssey.chainUserEpochDetails, [chainId || '', userAddr || '', `epoch_${epoch}`]);
export const selectUserTokenProof =
  (userAddr: string | undefined, chainId: number | undefined) =>
  (state: AppState): ITokenProof[] | undefined =>
    _.get(state.odyssey.chainUserTokenProof, [chainId || '', userAddr || '']);
export const selectUserTokenRanking =
  (userAddr: string | undefined, chainId: number | undefined) =>
  (state: AppState): ItemStatus<ITokenRanking> | undefined =>
    _.get(state.odyssey.chainUserTokenRanking, [chainId || '', userAddr || '']);
export const selectUserRankingStatus =
  (userAddr: string | undefined, epoch: number | undefined, chainId: number | undefined) =>
  (state: AppState): FETCHING_STATUS | undefined =>
    _.get(state.odyssey.chainUserRanking, [chainId || '', userAddr || '', `${epoch}_epoch`, 'status']);

export const selectUserPrePoint =
  (userAddr: string | undefined, chainId: number | undefined) =>
  (state: AppState): number =>
    _.get(state.odyssey.chainUserPrePoint, [chainId || '', userAddr || '', 'item'], 0);
export const selectUserBlastOOPoints =
  (userAddr: string | undefined, chainId: number | undefined) =>
  (state: AppState): ItemStatus<IUserPoints> | undefined =>
    _.get(state.odyssey.chainUserPoints, [chainId || '', userAddr || '']);
export const selectUserOdysseyRegistered =
  (userAddr: string | undefined, chainId: number | undefined) =>
  (state: AppState): boolean =>
    _.get(state.odyssey.chainUserRegistered, [chainId || '', userAddr || ''], false);

export const selectOdysseyTab = (state: AppState): ODYSSEY_TABS | undefined => state.odyssey.odysseyTab;

export const selectPointsEarning =
  (userAddr: string | undefined, chainId: number | undefined) =>
  (state: AppState): WrappedBigNumber | undefined =>
    _.get(state.odyssey.chainUserPointsPerDay, [chainId || '', userAddr || '']);

export const selectInfoOverview =
  (chainId: number | undefined) =>
  (state: AppState): IInfoOverview | undefined =>
    _.get(state.odyssey.chainInfoOverview, [chainId || '']);

export default odysseySlice.reducer;
