import { JsonRpcSigner } from '@ethersproject/providers';
import { createAction, createAsyncThunk } from '@reduxjs/toolkit';

import { getOdysseyApiPrefix } from '@/constants/odyssey';
import { getTgpApiPrefix, TGP_PAGE_SIZE, TGP_SEASON, TGP_TYPE } from '@/constants/tgp';
import { CAMPAIGN_TYPE, ODYSSEY_STEP } from '@/types/odyssey';
import {
  ITGPLuckyDrawWinners,
  ITGPMaster,
  ITGPMasterLeaderBoard,
  ITGPOpenLeaderBoard,
  ITGPSignature,
  ITGPStat,
  ITGPUser,
  IUserCheck,
  TGP_USER_STATUS,
} from '@/types/tgp';
import { axiosGet, axiosPost } from '@/utils/axios';
import { saveTGPJWTToken } from '@/utils/storage';

import { CHAIN_ID } from '@/constants/chain';
import { AppState } from '../store';
export const setTGPType = createAction<TGP_TYPE>('tgp/setTGPType');
export const setTGPSeason = createAction<TGP_SEASON>('tgp/setTGPSeason');
export const setTGPSelectedSeason = createAction<TGP_SEASON>('tgp/setTGPSelectedSeason');
export const setSelectedLuckyWeek = createAction<number>('tgp/setSelectedLuckyWeek');
export const setTGPCurrentStep = createAction<{ userAddr: string; step: ODYSSEY_STEP }>('tgp/setCurrentStep');
export const setTGPJWTToken = createAction<{ userAddr: string; jwtToken: string }>('tgp/setTGPJWTToken');

export const getTGPStats = createAsyncThunk(
  'tgp/getTGPStat',
  async ({ chainId }: { chainId?: number }): Promise<ITGPStat | undefined> => {
    try {
      const result = await axiosGet({
        type: CAMPAIGN_TYPE.TGP,
        url: getTgpApiPrefix('/stats', chainId),
      });
      if (result) {
        return result.data.data;
      }
    } catch (e) {
      return undefined;
    }
    return undefined;
  },
);
export const getTGPMasters = createAsyncThunk(
  'tgp/getTGPMasters',
  async ({ userAddr }: { userAddr: string }): Promise<ITGPMaster[] | undefined> => {
    try {
      const result = await axiosGet({
        type: CAMPAIGN_TYPE.TGP,
        url: getTgpApiPrefix(`/tgp/masters`),
        address: userAddr,
      });
      if (result) {
        return result.data.data;
      }
    } catch (e) {
      return undefined;
    }
    return undefined;
  },
);

export const getTGPMasterLeaderBoard = createAsyncThunk(
  'tgp/getTGPMasterLeaderBoard',
  async ({
    userAddr,
    page = 1,
    pageSize = TGP_PAGE_SIZE,
  }: {
    userAddr: string;
    pageSize?: number;
    page?: number;
  }): Promise<ITGPMasterLeaderBoard | undefined> => {
    try {
      const result = await axiosGet({
        type: CAMPAIGN_TYPE.TGP,
        url: getTgpApiPrefix(`/tgp/leaderboard/master`),
        address: userAddr,
        config: {
          params: { page, pageSize },
        },
      });
      if (result) {
        return result.data.data;
      }
    } catch (e) {
      return undefined;
    }
    return undefined;
  },
);
export const getTGPOpenLeaderBoard = createAsyncThunk(
  'tgp/getTGPOpenLeaderBoard',
  async ({
    userAddr,
    page = 1,
    pageSize = TGP_PAGE_SIZE,
    tgpType,
  }: {
    userAddr: string;
    pageSize?: number;
    page?: number;
    tgpType: TGP_TYPE;
  }): Promise<ITGPOpenLeaderBoard | undefined> => {
    try {
      const result = await axiosGet({
        type: CAMPAIGN_TYPE.TGP,
        url: getTgpApiPrefix(`/tgp/leaderboard/open/${tgpType}`),
        address: userAddr,
        config: {
          params: { page, pageSize },
        },
      });
      if (result) {
        return result.data.data;
      }
    } catch (e) {
      return undefined;
    }
    return undefined;
  },
);
export const getTGPLuckyDrawWinners = createAsyncThunk(
  'tgp/getTGPLuckyDrawWinners',
  async ({ userAddr }: { userAddr: string }): Promise<ITGPLuckyDrawWinners[] | undefined> => {
    try {
      const result = await axiosGet({
        url: getTgpApiPrefix('/tgp/luckyDrawWinners'),
        address: userAddr,
        type: CAMPAIGN_TYPE.TGP,
      });
      if (result) {
        return result.data.data;
      }
      return undefined;
    } catch (e) {
      return undefined;
    }
  },
);
export const getTGPLuckyDrawTicket = createAsyncThunk(
  'tgp/getTGPLuckyDrawTicket',
  async (
    { userAddr, chainId }: { userAddr: string; chainId: number | undefined },
    { dispatch },
  ): Promise<string | undefined> => {
    try {
      const result = await axiosPost({
        url: getTgpApiPrefix('/tgp/luckyDraw'),
        address: userAddr,
        type: CAMPAIGN_TYPE.TGP,
        chainId,
      });
      if (result) {
        dispatch(getTGPUser({ userAddr }));
        return result.data.ticket;
      }
      return undefined;
    } catch (e) {
      return undefined;
    }
  },
);

export const signTGPMsg = createAsyncThunk(
  'tgp/signTGPMsg',
  async (
    {
      signer,
      userAddr,
      isMaster,
    }: {
      signer: JsonRpcSigner;
      userAddr: string;
      isMaster: boolean;
    },
    { dispatch, getState },
  ): Promise<{ data: ITGPSignature } & { jwtToken?: string }> => {
    const {
      tgp: { tgpDappConfig },
    } = getState() as AppState;
    const nonce = new Date().getTime();
    const signMsg = `Wallet Address:${userAddr}
Nonce:${nonce}
Agreement:${isMaster ? tgpDappConfig.sign.agreement.master : tgpDappConfig.sign.agreement.open}`;
    const signature = await signer.signMessage(signMsg);
    console.log('🚀 ~ :signTGPMsg', {
      userAddr,
      signature,
      nonce,
      source: isMaster ? 1 : 2,
      signMsg,
    });
    const jwtToken = await dispatch(
      postTGPJWTToken({
        userAddr,
        signature,
        nonce,
        source: isMaster ? 1 : 2,
      }),
    ).unwrap();
    console.log('🚀 ~ jwtToken:', jwtToken);
    if (jwtToken) {
      saveTGPJWTToken(userAddr, jwtToken);
      // dispatch(getUserDashboard({ userAddr }));
      dispatch(getTGPUser({ userAddr }));
      dispatch(setTGPJWTToken({ userAddr, jwtToken }));
    }
    return {
      data: {
        nonce,
        signature,
        address: userAddr,
      },
      jwtToken,
    };
  },
);

export const postTGPJWTToken = createAsyncThunk(
  'tgp/postTGPJWTToken',
  async ({
    // message,
    userAddr,
    signature,
    nonce,
    source,
  }: {
    userAddr: string;
    signature: string;
    nonce: number;
    source: number;
  }): Promise<string | undefined> => {
    // only blast has tgp
    const response = await axiosGet({
      url: getOdysseyApiPrefix(CHAIN_ID.BLAST, '/tgp/auth/sign'),
      type: CAMPAIGN_TYPE.TGP,
      address: userAddr,
      config: {
        params: {
          source: source, // 0: odyssey 1: TGP Master 2: TGP Open
          wallet: userAddr,
          signature,
          nonce,
        },
      },
    });
    if (response?.data?.data) {
      return response?.data?.data.accessToken;
    }
  },
);

export const getTGPUser = createAsyncThunk(
  'tgp/getTGPUser',
  async ({ userAddr }: { userAddr: string }): Promise<ITGPUser | undefined> => {
    const result = await axiosGet({
      type: CAMPAIGN_TYPE.TGP,
      url: getTgpApiPrefix('/tgp/user'),
      address: userAddr,
    });
    if (result?.data?.data) {
      return {
        ...result.data.data,
        status: TGP_USER_STATUS.DEFAULT,
      };
    }
  },
);

export const getTGPUserPreCheck = createAsyncThunk(
  'tgp/getTGPUserPreCheck',
  async ({ userAddr }: { userAddr: string }): Promise<IUserCheck | undefined> => {
    const result = await axiosGet({
      type: CAMPAIGN_TYPE.TGP,
      url: getTgpApiPrefix('/tgp/user/preCheck'),
      address: userAddr,
      config: {
        params: {
          wallet: userAddr,
        },
      },
    });
    if (result?.data?.data) {
      return result.data.data;
    }
  },
);
