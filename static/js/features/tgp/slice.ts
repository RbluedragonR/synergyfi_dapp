import { createSlice } from '@reduxjs/toolkit';
import _ from 'lodash';

import { getTGPConfig } from '@/configs';
import { FETCHING_STATUS } from '@/constants';
import { TGP_SEASON, TGP_TYPE } from '@/constants/tgp';
import { CAMPAIGN_TYPE, IOdysseySignature, ODYSSEY_STEP } from '@/types/odyssey';
import { ItemStatus, getDefaultItemStatus, setFulfilledItemStatus } from '@/types/redux';
import {
  ITGPDappConfig,
  ITGPLuckyDrawWinners,
  ITGPMaster,
  ITGPMasterLeaderBoard,
  ITGPOpenLeaderBoard,
  ITGPStat,
  ITGPTrader,
  ITGPUser,
  IUserCheck,
  TGP_USER_STATUS,
} from '@/types/tgp';
import { getStepByTGPUserStatus } from '@/utils/odyssey';

import { postUpdateProfile } from '../odyssey/actions';
import { AppState } from '../store';
import {
  getTGPLuckyDrawTicket,
  getTGPLuckyDrawWinners,
  getTGPMasterLeaderBoard,
  getTGPMasters,
  getTGPOpenLeaderBoard,
  getTGPStats,
  getTGPUser,
  getTGPUserPreCheck,
  setSelectedLuckyWeek,
  setTGPCurrentStep,
  setTGPJWTToken,
  setTGPSeason,
  setTGPSelectedSeason,
  setTGPType,
  signTGPMsg,
} from './actions';

export interface ITGPState {
  masterLeaderBoard: ItemStatus<ITGPMasterLeaderBoard | undefined>;
  openLeaderBoard: ItemStatus<ITGPOpenLeaderBoard | undefined>;
  luckyDrawWinners: ItemStatus<ITGPLuckyDrawWinners[] | undefined>;
  currentType: TGP_TYPE;
  currentSeason: TGP_SEASON | undefined;
  selectedSeason: TGP_SEASON | undefined;
  selectedLuckyWeek: number;
  tgpMasters: ItemStatus<ITGPMaster[] | undefined>;
  stats: ItemStatus<ITGPStat | undefined>;
  tgpDappConfig: ITGPDappConfig;
  userJWTToken: {
    [userAddr: string]: ItemStatus<string>;
  };
  currentStep: {
    [userAddr: string]: ODYSSEY_STEP;
  };
  userProfile: { [userAddr: string]: ItemStatus<ITGPUser> };
  userSignature: {
    [userAddr: string]: IOdysseySignature;
  };
  userCheck: {
    [userAddr: string]: ItemStatus<IUserCheck>;
  };
  userShareTicket: {
    [userAddr: string]: string;
  };
}

export const initialState: ITGPState = {
  masterLeaderBoard: getDefaultItemStatus(),
  openLeaderBoard: getDefaultItemStatus(),
  currentType: TGP_TYPE.MASTER,
  currentSeason: undefined,
  selectedSeason: undefined,
  luckyDrawWinners: getDefaultItemStatus(),
  tgpMasters: getDefaultItemStatus(),
  selectedLuckyWeek: 1,
  tgpDappConfig: getTGPConfig(),
  userJWTToken: {},
  currentStep: {},
  userProfile: {},
  userSignature: {},
  userCheck: {},
  stats: getDefaultItemStatus(),
  userShareTicket: {},
};

export const tgpSlice = createSlice({
  name: 'odyssey',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getTGPMasterLeaderBoard.pending, (state, {}) => {
      _.set(state.masterLeaderBoard, ['status'], FETCHING_STATUS.FETCHING);
    });
    builder.addCase(getTGPMasterLeaderBoard.fulfilled, (state, { payload }) => {
      state.masterLeaderBoard = setFulfilledItemStatus(payload);
    });
    builder.addCase(getTGPMasterLeaderBoard.rejected, (state, {}) => {
      _.set(state.masterLeaderBoard, ['status'], FETCHING_STATUS.DONE);
    });
    builder.addCase(getTGPOpenLeaderBoard.pending, (state, {}) => {
      _.set(state.openLeaderBoard, ['status'], FETCHING_STATUS.FETCHING);
    });
    builder.addCase(getTGPOpenLeaderBoard.fulfilled, (state, { payload }) => {
      state.openLeaderBoard = setFulfilledItemStatus(payload);
    });
    builder.addCase(getTGPOpenLeaderBoard.rejected, (state, {}) => {
      _.set(state.openLeaderBoard, ['status'], FETCHING_STATUS.DONE);
    });
    builder.addCase(getTGPLuckyDrawWinners.fulfilled, (state, { payload }) => {
      state.luckyDrawWinners = setFulfilledItemStatus(payload);
    });
    builder.addCase(setTGPType, (state, { payload }) => {
      state.currentType = payload;
    });
    builder.addCase(setTGPSeason, (state, { payload }) => {
      state.currentSeason = payload;
    });
    builder.addCase(setTGPSelectedSeason, (state, { payload }) => {
      state.selectedSeason = payload;
    });
    builder.addCase(setTGPJWTToken, (state, { payload }) => {
      _.set(state.userJWTToken, [payload.userAddr], setFulfilledItemStatus(payload.jwtToken));
    });
    builder.addCase(setSelectedLuckyWeek, (state, { payload }) => {
      state.selectedLuckyWeek = payload;
    });
    builder.addCase(setTGPCurrentStep, (state, { payload }) => {
      _.set(state.currentStep, [payload.userAddr], payload.step);
    });
    builder.addCase(getTGPUser.pending, (state, { meta }) => {
      const { userAddr } = meta.arg;
      const userProfile = _.get(state.userProfile, [userAddr, 'item']);
      if (!userProfile) _.set(state.userProfile, [meta.arg.userAddr], getDefaultItemStatus());
      else {
        _.set(state.userProfile, [meta.arg.userAddr, 'status'], FETCHING_STATUS.FETCHING);
      }
    });
    builder.addCase(getTGPUser.fulfilled, (state, { payload, meta }) => {
      const { userAddr } = meta.arg;
      if (payload) {
        _.set(state.userProfile, [userAddr], setFulfilledItemStatus(payload));
        const stepStatus = getStepByTGPUserStatus(payload.status);
        _.set(state.currentStep, [userAddr], stepStatus);
      }
    });
    builder.addCase(getTGPUser.rejected, (state, { meta }) => {
      _.set(state.userProfile, [meta.arg.userAddr, 'status'], FETCHING_STATUS.DONE);
    });
    builder.addCase(signTGPMsg.fulfilled, (state, { payload, meta }) => {
      const { userAddr } = meta.arg;
      if (payload) {
        _.set(state.userSignature, [userAddr], payload);
        _.set(state.currentStep, [userAddr], ODYSSEY_STEP.CONNECTED_WALLET);
        const userProfile = _.get(state.userProfile, [userAddr, 'item']);
        if (!userProfile) _.set(state.userProfile, [meta.arg.userAddr], getDefaultItemStatus(FETCHING_STATUS.DONE));
      }
    });
    builder.addCase(getTGPUserPreCheck.pending, (state, { meta }) => {
      const { userAddr } = meta.arg;
      const isMasterItem = _.get(state.userCheck, [userAddr, 'item', 'isMaster']);
      if (!isMasterItem) {
        _.set(state.userCheck, [userAddr], getDefaultItemStatus());
      } else {
        _.set(state.userCheck, [userAddr, 'status'], FETCHING_STATUS.FETCHING);
      }
    });
    builder.addCase(getTGPUserPreCheck.fulfilled, (state, { payload, meta }) => {
      const { userAddr } = meta.arg;
      if (payload !== undefined) {
        _.set(state.userCheck, [userAddr], setFulfilledItemStatus(payload));
      }
    });
    builder.addCase(getTGPLuckyDrawTicket.fulfilled, (state, { payload, meta }) => {
      const { userAddr } = meta.arg;
      if (payload) {
        _.set(state.userShareTicket, [userAddr], payload);
      }
    });
    builder.addCase(getTGPStats.fulfilled, (state, { payload }) => {
      state.stats = setFulfilledItemStatus(payload);
    });
    builder.addCase(getTGPMasters.fulfilled, (state, { payload }) => {
      state.tgpMasters = setFulfilledItemStatus(payload);
    });
    builder.addCase(postUpdateProfile.fulfilled, (state, { payload, meta }) => {
      const { userAddr, email, discordId: discord, username, type } = meta.arg;
      if (payload && type === CAMPAIGN_TYPE.TGP) {
        if (discord) {
          _.set(state.currentStep, [userAddr], ODYSSEY_STEP.FOLLOWED_DISCORD);
          _.set(state.userProfile, [userAddr, 'item', 'status'], TGP_USER_STATUS.DISCORD_CONNECTED);
        }
        if (email) {
          _.set(state.currentStep, [userAddr], ODYSSEY_STEP.FILLED_EMAIL);
          _.set(state.userProfile, [userAddr, 'item', 'status'], TGP_USER_STATUS.EMAIL_CONNECTED);
        }
        if (username) {
          _.set(state.userProfile, [userAddr, 'item', 'username'], username);
        }
      }
    });
  },
});
export const selectTGPType = (state: AppState): TGP_TYPE => state.tgp.currentType;
export const selectCurrentLuckyWeekWinners =
  (week: number) =>
  (state: AppState): ITGPTrader[] | undefined =>
    _.find(_.get(state.tgp.luckyDrawWinners, ['item']), (winners) => winners.week === week)?.winners;
export const selectSelectedLuckyWeek = (state: AppState): number => state.tgp.selectedLuckyWeek;
export const selectTGPConfig = (state: AppState): ITGPDappConfig => state.tgp.tgpDappConfig;
export const selectTGPMasterLeaderBoard = (state: AppState): ITGPMasterLeaderBoard | undefined =>
  _.get(state.tgp.masterLeaderBoard, ['item']);
export const selectTGPOpenLeaderBoard = (state: AppState): ITGPOpenLeaderBoard | undefined =>
  _.get(state.tgp.openLeaderBoard, ['item']);
export const selectTGPMasterLeaderBoardStatus = (state: AppState): FETCHING_STATUS | undefined =>
  _.get(state.tgp.masterLeaderBoard, ['status']);
export const selectTGPOpenLeaderBoardStatus = (state: AppState): FETCHING_STATUS | undefined =>
  _.get(state.tgp.openLeaderBoard, ['status']);

export const selectUserJWTToken =
  (userAddr: string | undefined) =>
  (state: AppState): string | undefined =>
    _.get(state.tgp.userJWTToken, [userAddr || '', 'item']);
export const selectUserJWTTokenStatus =
  (userAddr: string | undefined) =>
  (state: AppState): FETCHING_STATUS =>
    _.get(state.tgp.userJWTToken, [userAddr || '', 'status'], FETCHING_STATUS.INIT);

export const selectTGPUserCurrentStep =
  (userAddr: string | undefined) =>
  (state: AppState): ODYSSEY_STEP =>
    _.get(state.tgp.currentStep, [userAddr || ''], ODYSSEY_STEP.INIT);

export const selectCurrentSeason = (state: AppState): TGP_SEASON =>
  state.tgp.currentSeason || state.tgp.tgpDappConfig.currentSeason;
export const selectSelectedSeason = (state: AppState): TGP_SEASON =>
  state.tgp.selectedSeason || state.tgp.tgpDappConfig.currentSeason;

export const selectTGPUserProfile =
  (userAddr: string | undefined) =>
  (state: AppState): ITGPUser | undefined =>
    _.get(state.tgp.userProfile, [userAddr || '', 'item']);

export const selectTGPUserProfileStatus =
  (userAddr: string | undefined) =>
  (state: AppState): FETCHING_STATUS =>
    _.get(state.tgp.userProfile, [userAddr || '', 'status'], FETCHING_STATUS.INIT);

export const selectTGPUserIsMaster =
  (userAddr: string | undefined) =>
  (state: AppState): boolean =>
    _.get(state.tgp.userCheck, [userAddr || '', 'item', 'isMaster'], false);
export const selectTGPMasters = (state: AppState): ITGPMaster[] | undefined => state.tgp.tgpMasters.item;
export const selectTGPUserIsRegistered =
  (userAddr: string | undefined) =>
  (state: AppState): boolean =>
    _.get(state.tgp.userCheck, [userAddr || '', 'item', 'isRegistered'], false);

export const selectTGPUserCheckStatus =
  (userAddr: string | undefined) =>
  (state: AppState): FETCHING_STATUS =>
    _.get(state.tgp.userCheck, [userAddr || '', 'status'], FETCHING_STATUS.INIT);

export const selectUserSharedTicket =
  (userAddr: string | undefined) =>
  (state: AppState): string | undefined =>
    _.get(state.tgp.userShareTicket, [userAddr || '']);
export const selectTGPStats = (state: AppState): ITGPStat | undefined => _.get(state.tgp.stats, ['item']);

export default tgpSlice.reducer;
