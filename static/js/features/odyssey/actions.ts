import { JsonRpcSigner } from '@ethersproject/providers';
import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BigNumber } from 'ethers';
import _ from 'lodash';

import { FETCHING_STATUS } from '@/constants';
import { PAIR_RATIO_BASE } from '@/constants/global';
import { getOdysseyApiPrefix } from '@/constants/odyssey';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { WrappedPair } from '@/entities/WrappedPair';
import {
  CAMPAIGN_TYPE,
  IEpoch,
  IEpochDetail,
  IInfoOverview,
  ILeaderBoard,
  IOdysseyDashboard,
  IOdysseySignature,
  IRanking,
  IRecentJoin,
  ISpinResult,
  ITokenProof,
  ITokenRanking,
  IUserPoints,
  IUserProfile,
  InstrumentPointConfigParam,
  ODYSSEY_STEP,
  ODYSSEY_TABS,
} from '@/types/odyssey';
import { CreativePair } from '@/types/pair';
import { TokenInfo } from '@/types/token';
import { axiosGet, axiosPost } from '@/utils/axios';
import { saveOdysseyJWTToken } from '@/utils/storage';

import { CHAIN_ID } from '@/constants/chain';
import { QUERY_KEYS } from '@/constants/query';
import { WrappedPortfolio } from '@/entities/WrappedPortfolio';
import { queryClient } from '@/pages/App';
import { simulateOrderPointPerDay, simulatePortfolioPointPerDay, simulateRangePointPerDay } from '@/utils/odyssey';
import { isWrappedPairType } from '@/utils/pair';
import { Context } from '@derivation-tech/context';
import { ITokenPriceMap } from '../global/type';
import { AppState } from '../store';

export const setCurrentStep = createAction<{ userAddr: string; step: ODYSSEY_STEP; chainId: number }>(
  'odyssey/setCurrentStep',
);
export const setSignUpSkipped = createAction<{ userAddr: string; chainId: number }>('odyssey/setSignUpSkipped');
export const setOdysseyTab = createAction<{ tab: ODYSSEY_TABS }>('odyssey/setOdysseyTab');
export const saveReferralCode = createAction<{ userAddr?: string; referralCode: string; chainId: number }>(
  'odyssey/saveReferralCode',
);
export const resetState = createAction<{ userAddr: string; chainId: number }>('odyssey/resetState');
export const setCurrentEpoch = createAction<{ chainId: number; epoch: IEpoch }>('odyssey/setCurrentEpoch');
export const setOdysseyRegistered = createAction<{
  userAddr: string;
  registered: boolean;
  chainId: number;
}>('odyssey/setOdysseyRegistered');
export const setOdysseyUserJWT = createAction<{
  userAddr: string;
  token: string;
  chainId: number;
}>('odyssey/setOdysseyUserJWT');

export const postJWTToken = createAsyncThunk(
  'odyssey/postJWTToken',
  async ({
    // message,
    inviteCode,
    userAddr,
    signature,
    nonce,
    source,
    chainId,
  }: {
    inviteCode?: string;
    userAddr: string;
    signature: string;
    nonce: number;
    source: number;
    chainId: number;
  }): Promise<string | undefined> => {
    const response = await axiosGet({
      url: getOdysseyApiPrefix(chainId, '/auth/sign'),
      type: CAMPAIGN_TYPE.ODYSSEY,
      address: userAddr,
      config: {
        params: {
          source: source, // 0: odyssey 1: TGP Master 2: TGP Open
          referralCode: inviteCode,
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

export const signOdysseyMsg = createAsyncThunk(
  'odyssey/signOdysseyMsg',
  async (
    {
      // message,
      signer,
      inviteCode,
      userAddr,
      chainId,
    }: {
      message: string;
      signer: JsonRpcSigner;
      inviteCode?: string;
      userAddr: string;
      chainId: number;
    },
    { dispatch, getState },
  ): Promise<{ data: IOdysseySignature } & { jwtToken?: string }> => {
    const {
      odyssey: { odysseyDappConfig, chainUserProfile: userProfile },
    } = getState() as AppState;
    const profile = _.get(userProfile, [chainId, userAddr]);
    const nonce = new Date().getTime();
    const signMsg = `Wallet Address:${userAddr}
Nonce:${nonce}
Agreement:${odysseyDappConfig?.sign?.agreement}`;
    const signature = await signer.signMessage(signMsg);
    const jwtToken = await dispatch(
      postJWTToken({
        chainId,
        inviteCode:
          inviteCode && _.isEqual(inviteCode?.toLowerCase(), profile?.item?.referralCode.toLowerCase())
            ? undefined
            : inviteCode,
        userAddr,
        signature,
        nonce,
        source: 0,
      }),
    ).unwrap();
    console.log('🚀 ~ jwtToken:', jwtToken);
    if (jwtToken) {
      saveOdysseyJWTToken(userAddr, jwtToken, chainId);
      dispatch(getUserDashboard({ userAddr, chainId }));
      chainId && dispatch(getUserProfile({ userAddr, chainId }));
    }
    return {
      data: {
        nonce,
        signature,
        address: userAddr,
        inviteCode,
      },
      jwtToken,
    };
  },
);

export const postUpdateProfile = createAsyncThunk(
  'odyssey/postUpdateProfile',
  async (
    {
      discordId,
      email,
      username,
      userAddr,
      chainId,
      type = CAMPAIGN_TYPE.ODYSSEY,
    }: {
      discordId?: string;
      email?: string;
      username?: string;
      userAddr: string;
      chainId: number;
      type?: CAMPAIGN_TYPE;
    },
    { dispatch },
  ): Promise<boolean> => {
    try {
      const url = username ? '/user/updateUserName' : '/user/update';
      const result = await axiosPost({
        type: type,
        chainId,
        url: getOdysseyApiPrefix(chainId, url),
        address: userAddr,
        data: {
          discordId,
          email,
          username,
        },
      });
      if (result.status === 200) {
        dispatch(getUserProfile({ userAddr, chainId }));
        if (username) {
          dispatch(getLeaderBoard({ chainId }));
        }

        // TODO: temp comment out for api not ready
        // dispatch(getUserDashboard({ userAddr }));
        return true;
      }
      return false;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log('🚀 ~ error:', error);
      if (error?.response?.data?.msg || error?.response?.data?.message) {
        throw new Error(error?.response?.data?.msg || error?.response?.data?.message);
      }
      throw new Error('');
      return false;
    }
    return false;
  },
);

export const getUserDashboard = createAsyncThunk(
  'odyssey/getUserDashboard',
  async (
    { userAddr, epoch, chainId }: { userAddr: string; epoch?: number; chainId: number },
    { getState },
  ): Promise<IOdysseyDashboard | undefined> => {
    if (!epoch) {
      const {
        odyssey: { chainActiveEpoch },
      } = getState() as AppState;
      const activeEpoch = chainActiveEpoch[chainId];
      if (activeEpoch) {
        epoch = activeEpoch.epoch;
      }
    }
    if (!epoch) {
      return;
    }
    const result = await axiosGet({
      type: CAMPAIGN_TYPE.ODYSSEY,
      url: getOdysseyApiPrefix(chainId, '/dashboard'),
      address: userAddr,
      config: {
        params: {
          wallet: userAddr,
          epoch,
        },
      },
    });
    if (result?.data?.data) {
      return result.data.data;
    }
  },
);
export const getLeaderBoard = createAsyncThunk(
  'odyssey/getLeaderBoard',
  async (
    {
      epoch,
      page = 1,
      pageSize = 500,
      chainId,
    }: {
      epoch?: number;
      page?: number;
      pageSize?: number;
      chainId: number;
    },
    { getState, dispatch },
  ): Promise<ILeaderBoard | undefined> => {
    const {
      odyssey: { chainCurrentEpoch, chainEpochs },
    } = getState() as AppState;
    const currentEpoch = chainCurrentEpoch[chainId];
    if (!epoch) {
      epoch = currentEpoch?.epoch || 1;
    }
    const result = await axiosGet({
      type: CAMPAIGN_TYPE.ODYSSEY,
      url: getOdysseyApiPrefix(chainId, '/leaderboard'),
      // address: userAddr,
      config: {
        params: {
          epoch,
          page,
          pageSize,
        },
      },
    });
    if (result?.data?.data) {
      const rankings = result?.data?.data?.rankings;
      if (result?.data?.data?.rankings) {
        const epochs = chainEpochs[chainId];
        if (!rankings.length && epochs.list && epochs.status === FETCHING_STATUS.DONE) {
          let epochNumber = (currentEpoch?.epoch || 2) - 1;
          if (epochNumber < 1) {
            epochNumber = 1;
          }
          const newEpoch = epochs.list.find((e) => e.epoch === epochNumber);
          newEpoch &&
            dispatch(
              setCurrentEpoch({
                chainId,
                epoch: newEpoch,
              }),
            );
        } else {
          result.data.data.rankings = _.orderBy(result?.data?.data.rankings.slice(0, 100), ['rank'], ['asc']);
        }
      }
      return result.data.data;
    }
  },
);
export const getEpochs = createAsyncThunk(
  'odyssey/getEpochs',
  async ({ chainId }: { chainId: number }): Promise<IEpoch[] | undefined> => {
    const result = await axiosGet({
      type: CAMPAIGN_TYPE.ODYSSEY,
      url: getOdysseyApiPrefix(chainId, '/epochs'),
    });
    if (result?.data?.data) {
      return result.data.data?.epochs;
    }
  },
);
export const getRecentJoins = createAsyncThunk(
  'odyssey/recentJoins',
  async ({ chainId }: { chainId: number }): Promise<IRecentJoin[] | undefined> => {
    const result = await axiosGet({
      type: CAMPAIGN_TYPE.ODYSSEY,
      url: getOdysseyApiPrefix(chainId, '/recentJoins'),
      // address: userAddr,
    });
    if (result?.data?.data) {
      return result.data.data?.users;
    }

    // return [
    //   {
    //     name: 'leo1',
    //     inviter: 'jx',
    //     timestamp: 1704941814,
    //   },
    //   {
    //     name: 'leo2',
    //     inviter: 'jx',
    //     timestamp: 1704941814,
    //   },
    // ];
  },
);
export const getUserProfile = createAsyncThunk(
  'odyssey/getUserProfile',
  async ({ userAddr, chainId }: { userAddr: string; chainId: number }): Promise<IUserProfile | undefined> => {
    try {
      const result = await axiosGet({
        type: CAMPAIGN_TYPE.ODYSSEY,
        url: getOdysseyApiPrefix(chainId, '/user'),
        config: {
          params: { wallet: userAddr },
        },
      });
      if (result?.data?.data) {
        return result.data.data;
      }
    } catch (e) {
      console.log('🚀 ~ e:', e);
      return undefined;
    }
  },
);
export const getUserBlastOOPoints = createAsyncThunk(
  'odyssey/getUserBlastOOPoints',
  async ({ userAddr, chainId }: { userAddr: string; chainId: number }): Promise<IUserPoints | undefined> => {
    const result = await axiosGet({
      type: CAMPAIGN_TYPE.ODYSSEY,
      url: getOdysseyApiPrefix(chainId, '/user/points'),
      // address: userAddr,
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
export const getUserTokenProof = createAsyncThunk(
  'odyssey/getUserTokenProof',
  async ({ userAddr, chainId }: { userAddr: string; chainId: number }): Promise<ITokenProof[] | undefined> => {
    const result = await axiosGet({
      type: CAMPAIGN_TYPE.ODYSSEY,
      url: getOdysseyApiPrefix(chainId, '/token/user/proof'),
      // address: userAddr,
      config: {
        params: {
          wallet: userAddr,
        },
      },
    });
    if (result?.data?.data) {
      return result.data.data.proofs;
    }
  },
);
export const spinAction = createAsyncThunk(
  'odyssey/spin',
  async (
    { userAddr, count = 1, chainId }: { userAddr: string; count?: number; chainId: number },
    { dispatch },
  ): Promise<ISpinResult | undefined> => {
    const result = await axiosPost({
      type: CAMPAIGN_TYPE.ODYSSEY,
      chainId,
      url: getOdysseyApiPrefix(chainId, '/spin'),
      address: userAddr,
      data: { count },
    });
    if (result?.data?.data) {
      dispatch(getUserDashboard({ userAddr, chainId }));
      return result.data.data;
    }
  },
);
export const openBoxAction = createAsyncThunk(
  'odyssey/openBox',
  async (
    { userAddr, count = 1, chainId }: { userAddr: string; count?: number; chainId: number },
    { dispatch },
  ): Promise<{ points: number; extraPoints: number } | undefined> => {
    const result = await axiosPost({
      type: CAMPAIGN_TYPE.ODYSSEY,
      chainId,
      url: getOdysseyApiPrefix(chainId, '/openBox'),
      address: userAddr,
      data: { count },
    });
    if (result?.data?.data) {
      dispatch(getUserDashboard({ userAddr, chainId }));
      dispatch(getUserProfile({ userAddr, chainId }));
      return result.data.data;
    }
  },
);
export const claimExtraPointsAction = createAsyncThunk(
  'odyssey/claimExtraPoints',
  async ({ userAddr, chainId }: { userAddr: string; chainId: number }, { dispatch }): Promise<number | undefined> => {
    try {
      const result = await axiosPost({
        type: CAMPAIGN_TYPE.ODYSSEY,
        url: getOdysseyApiPrefix(chainId, '/claimExtraPoints'),
        chainId,
        address: userAddr,
      });
      if (result?.data?.data) {
        dispatch(getUserDashboard({ userAddr, chainId }));
        return result.data.data.points;
      }
    } catch (e) {
      console.log('🚀 ~ e:', e);
    }
  },
);

export const getUserRanking = createAsyncThunk(
  'odyssey/getUserRanking',
  async (
    { userAddr, epoch, chainId }: { userAddr: string; epoch?: number; chainId: number },
    { getState },
  ): Promise<IRanking | undefined> => {
    if (!epoch) {
      const {
        odyssey: { chainCurrentEpoch },
      } = getState() as AppState;
      const currentEpoch = chainCurrentEpoch[chainId];
      epoch = currentEpoch?.epoch || 1;
    }
    const result = await axiosGet({
      type: CAMPAIGN_TYPE.ODYSSEY,
      url: getOdysseyApiPrefix(chainId, '/user/ranking'),
      config: {
        params: {
          epoch,
          wallet: userAddr,
        },
      },
    });
    if (result?.data?.data) {
      return result.data.data;
    }
  },
);
export const getUserEpochDetails = createAsyncThunk(
  'odyssey/getUserEpochDetails',
  async ({ userAddr, chainId }: { userAddr: string; chainId: number }): Promise<IEpochDetail[] | undefined> => {
    try {
      const result = await axiosGet({
        type: CAMPAIGN_TYPE.ODYSSEY,
        url: getOdysseyApiPrefix(chainId, '/user/points/detail'),
        config: {
          params: {
            wallet: userAddr,
          },
        },
      });

      return result.data?.data;
    } catch (e) {
      console.log('🚀 ~ e:', e);
      return undefined;
    }
  },
);
export const getUserTokenRanking = createAsyncThunk(
  'odyssey/getUserTokenRanking',
  async (
    { userAddr, epoch, chainId }: { userAddr: string; epoch?: number; chainId: number },
    { getState },
  ): Promise<ITokenRanking | undefined> => {
    if (!epoch) {
      const {
        odyssey: { chainCurrentEpoch },
      } = getState() as AppState;
      const currentEpoch = chainCurrentEpoch[chainId];
      epoch = currentEpoch?.epoch || 1;
    }
    const result = await axiosGet({
      type: CAMPAIGN_TYPE.ODYSSEY,
      url: getOdysseyApiPrefix(chainId, '/token/user/ranking'),
      config: {
        params: {
          epoch,
          wallet: userAddr,
        },
      },
    });
    if (result?.data?.data) {
      return result.data.data;
    }
  },
);

export const simulatePointsByLimitTrade = createAsyncThunk(
  'odyssey/simulatePointsByLimitTrade',
  async (
    {
      chainId,
      userAddr,
      tick,
      accountBoost,
      base,
      quote,
      poolFactor,
      pair,
    }: {
      userAddr: string;
      chainId: number;
      tick: number;
      base: BigNumber;
      accountBoost?: number;
      poolFactor?: number;
      quote: TokenInfo;
      pair: WrappedPair;
    },
    { getState },
  ): Promise<WrappedBigNumber | undefined> => {
    try {
      const {
        odyssey: { odysseyDappConfig, chainUserDashboard: userDashboard },
      } = getState() as AppState;
      const chainTokenPriceInfo = queryClient.getQueryData<ITokenPriceMap>(QUERY_KEYS.GLOBAL.TOKEN_PRICE(chainId));
      const tokenPrice = chainTokenPriceInfo?.[quote.address]?.current;
      if (!tokenPrice) return;
      if (!odysseyDappConfig.supportChains.includes(chainId)) {
        return;
      }
      const config = odysseyDappConfig.chainConfig[chainId];
      const pairConfig = config.earnOoPointPairs?.find((p) => p.pairSymbol === pair.symbol);
      if (!pairConfig) {
        return;
      }
      const baseWad = base;
      const priceWad = WrappedBigNumber.from(tokenPrice).wadValue;
      if (!poolFactor) {
        poolFactor = pairConfig.boost;
      }
      if (!accountBoost) {
        const config = _.get(userDashboard, [chainId, userAddr, 'item']);
        if (config) {
          accountBoost = WrappedBigNumber.from(config.boost).plus(1).toNumber();
        } else {
          accountBoost = 1;
        }
      }
      console.log(`simulatePointsByLimitTrade params`, {
        tick,
        baseWad,
        accountBoost: WrappedBigNumber.from(accountBoost).mul(PAIR_RATIO_BASE).toNumber(),
        poolFactor: WrappedBigNumber.from(poolFactor).mul(PAIR_RATIO_BASE).toNumber(),
        priceWad,
      });
      const points = await simulateOrderPointPerDay(
        tick,
        baseWad,
        WrappedBigNumber.from(accountBoost).mul(PAIR_RATIO_BASE).toNumber(),
        WrappedBigNumber.from(poolFactor).mul(PAIR_RATIO_BASE).toNumber(),
        priceWad,
      );
      console.log('🚀 ~ points:', points);
      return WrappedBigNumber.from(points);
    } catch (error) {
      console.log('🚀 ~ error:', error);
    }
  },
);
export const simulateEarningPoints = createAsyncThunk(
  'odyssey/simulateEarningPoints',
  async (
    {
      chainId,
      accountBoost,
      userAddr,
      portfolios,
    }: {
      portfolios: WrappedPortfolio[];
      chainId: number;
      accountBoost?: number;
      userAddr: string;
      customStableInstruments: undefined | string[];
    },
    { getState },
  ): Promise<WrappedBigNumber | undefined> => {
    try {
      const {
        odyssey: { odysseyDappConfig, chainUserDashboard: userDashboard },
      } = getState() as AppState;
      const tokenPriceMap = queryClient.getQueryData<ITokenPriceMap>(QUERY_KEYS.GLOBAL.TOKEN_PRICE(chainId));
      if (!odysseyDappConfig.supportChains.includes(chainId)) {
        return;
      }
      const earnOoPointPairs = odysseyDappConfig.chainConfig[chainId]?.earnOoPointPairs;
      if (!earnOoPointPairs || !tokenPriceMap) {
        return;
      }
      if (!accountBoost) {
        const config = _.get(userDashboard, [chainId, userAddr, 'item']);
        if (config) {
          accountBoost = WrappedBigNumber.from(config.boost).plus(1).toNumber();
        } else {
          accountBoost = 1;
        }
      }
      const configMap = new Map<string, InstrumentPointConfigParam>();
      portfolios.forEach((p) => {
        const pair = p.rootPair;
        const config = earnOoPointPairs.find((e) => e.pairSymbol.toLowerCase() === pair.symbol.toLowerCase());
        let configForInstrument = configMap.get(p.rootInstrument.instrumentAddr);
        if (configForInstrument) {
          configForInstrument.poolFactorMap.set(p.expiry, (config?.boost || 0) * PAIR_RATIO_BASE);
        } else {
          configForInstrument = {
            isStable: p.rootInstrument.isStablePair,
            quotePriceWad: WrappedBigNumber.from(tokenPriceMap[p.rootInstrument.quoteToken.address].current).wadValue,
            poolFactorMap: new Map<number, number>().set(p.expiry, (config?.boost || 0) * PAIR_RATIO_BASE),
          };
        }
        configMap.set(p.rootInstrument.instrumentAddr, configForInstrument);
      });

      const points = await simulatePortfolioPointPerDay(portfolios, accountBoost * PAIR_RATIO_BASE, configMap);

      return WrappedBigNumber.from(points);
    } catch (error) {
      console.log('🚀 ~ error:', error);
    }
  },
);

export const simulatePointsByAddLiquidity = createAsyncThunk(
  'odyssey/simulatePointsByAddLiquidity',
  async (
    {
      chainId,
      userAddr,
      accountBoost,
      quote,
      poolFactor,
      pair,
      alphaWad,
      liquidity: liquidity,
      margin,
      sdk,
      customStableInstruments,
    }: {
      userAddr: string;
      chainId: number;
      accountBoost?: number;
      poolFactor?: number;
      quote: TokenInfo;
      pair: WrappedPair | CreativePair;
      alphaWad: BigNumber;
      liquidity: WrappedBigNumber;
      margin: WrappedBigNumber;
      sdk: Context;
      customStableInstruments: undefined | string[];
    },
    { getState },
  ): Promise<WrappedBigNumber | undefined> => {
    try {
      const {
        odyssey: { odysseyDappConfig, chainUserDashboard: userDashboard },
      } = getState() as AppState;
      const chainTokenPriceInfo = queryClient.getQueryData<ITokenPriceMap>(QUERY_KEYS.GLOBAL.TOKEN_PRICE(chainId));

      const tokenPrice = chainTokenPriceInfo?.[quote.address]?.current;
      if (!tokenPrice) return;
      if (!odysseyDappConfig.supportChains.includes(chainId)) {
        return;
      }
      const config = odysseyDappConfig.chainConfig[chainId];
      const pairConfig = config.earnOoPointPairs?.find((p) => p.pairSymbol === pair.symbol);
      if (!pairConfig) {
        return;
      }

      const priceWad = WrappedBigNumber.from(tokenPrice).wadValue;
      if (!poolFactor) {
        poolFactor = pairConfig.boost;
      }
      if (!accountBoost) {
        const config = _.get(userDashboard, [chainId, userAddr, 'item']);
        if (config) {
          accountBoost = WrappedBigNumber.from(config.boost).plus(1).toNumber();
        } else {
          accountBoost = 1;
        }
      }

      console.record('syn', `simulateRangePointPerDay params`, {
        pairInfo: {
          marketType: pair.rootInstrument.marketType,
          baseSymbol: pair.rootInstrument.baseToken.symbol,
          quoteSymbol: pair.rootInstrument.quoteToken.symbol,
        },
        expiry: pair.expiry,
        alphaWad,
        liquidity: liquidity.wadValue,
        accountBoost: WrappedBigNumber.from(accountBoost).mul(PAIR_RATIO_BASE).toNumber(),
        poolFactor: WrappedBigNumber.from(poolFactor).mul(PAIR_RATIO_BASE).toNumber(),
        priceWad,
      });
      const instrumentSymbol = `${pair.rootInstrument.baseToken.symbol}-${pair.rootInstrument.quoteToken.symbol}-${pair.rootInstrument.marketType}`;
      let isStablePair = false;
      if (customStableInstruments && customStableInstruments.includes(instrumentSymbol)) {
        isStablePair = true;
      } else if (pair instanceof WrappedPair) {
        isStablePair = pair.rootInstrument.isStablePair;
      }

      const isLivePair = isWrappedPairType(pair);

      const points = await simulateRangePointPerDay({
        instrument: {
          marketType: pair.rootInstrument.marketType,
          baseSymbol: pair.rootInstrument.baseToken.symbol,
          quoteSymbol: pair.rootInstrument.quoteToken.symbol,
        },
        expiry: pair.expiry,
        alphaWad,
        liquidity: liquidity.wadValue,
        balance: margin.wadValue,
        accountBoost: WrappedBigNumber.from(accountBoost).mul(PAIR_RATIO_BASE).toNumber(),
        poolFactor: WrappedBigNumber.from(poolFactor).mul(PAIR_RATIO_BASE).toNumber(),
        quotePriceWad: priceWad,
        isStable: isStablePair,
        sdk,
        pair: isLivePair ? pair : undefined,
      });
      return WrappedBigNumber.from(points);
    } catch (error) {
      console.log('🚀 ~ error:', error);
    }
  },
);

export const getUserPrePoints = createAsyncThunk(
  'odyssey/getUserPrePoints',
  async ({
    userAddr,
    epoch = 1,
    chainId,
  }: {
    userAddr: string;
    epoch?: number;
    chainId: number;
  }): Promise<number | undefined> => {
    const result = await axiosGet({
      type: CAMPAIGN_TYPE.ODYSSEY,
      url: getOdysseyApiPrefix(chainId, '/user/prePoints'),
      // address: userAddr,
      config: {
        params: {
          epoch,
          wallet: userAddr,
        },
      },
    });
    if (result?.data?.data) {
      return result.data.data.points;
    }
  },
);

export const getInfoOverview = createAsyncThunk(
  'odyssey/getInfoOverview',
  async ({ chainId }: { chainId: CHAIN_ID }): Promise<IInfoOverview | undefined> => {
    const url = `https://api.synfutures.com/s3/config/info-page/${chainId}/overview.json`;
    const result = await axios.get(url);
    return result.data;
  },
);
