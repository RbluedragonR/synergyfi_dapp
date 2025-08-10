import { CHAIN_ID } from '@derivation-tech/context';
import { createAsyncThunk } from '@reduxjs/toolkit';

import { IAccountRecords } from '@/types/account';
import { WorkerPortfolioResult } from '@/types/worker';
import { bigNumberObjectCheck } from '@/utils';
import { checkAccountIsInPair, reduceAccounts } from '@/utils/account';

// import { retryWhenTimeout } from '@/utils/retry';
// import { getWrappedSynWorker } from '@/worker/factory';
// import { ChainSynWorker } from '@/worker/SynWorker';
import SentryService from '@/entities/SentryService';
import {
  getParticipatedPairsFromLocalForage,
  saveParticipatedPairsToLocalForage,
  saveSingleParticipatedPairsToLocalForage,
} from '@/utils/storage';
import { Context } from '@derivation-tech/context';
import { FetchInstrumentParam, FetchPortfolioParam, Instrument } from '@synfutures/sdks-perp';
import _ from 'lodash';
import { getAllFuturesFromChain, parseInstrumentToMeta } from '../futures/actions';
import { fetchMarketPairList } from '../market/api';
import { AppState } from '../store';
import { syn_getAllFutures, syn_getFuturesByAddress, syn_getPortfolioList } from '../syn/action';
// import { transformToWrappedAccount } from '@/utils/transform/transformWrappedEntities';
// import { MySDK } from '@/types/sdk';
export const getAllAccountsFromChain = createAsyncThunk(
  'account/getAllAccountsFromChain',
  async (
    {
      chainId,
      userAddr,
      sdkContext,
      blockNumber,
      instruments,
      needFetchInstruments,
    }: {
      chainId: CHAIN_ID;
      userAddr: string;
      blockNumber?: number;
      sdkContext: Context;
      instruments?: Instrument[];
      needFetchInstruments?: boolean; // if need fetch instruments without instruments
    },
    { dispatch, getState },
  ): Promise<IAccountRecords | undefined> => {
    try {
      // window.synWorker.postMessage({
      //   eventName: WorkerEventNames.FetchPortfolioList,
      //   data: {
      //     chainId,
      //     userAddr,
      //     blockNumber,
      //     needFetchInstruments,
      //   },
      // });
      // if (1) return;

      const {
        pair: { chainMetaPair },
      } = getState() as AppState;
      const pairListMap = _.get(chainMetaPair, [chainId, 'list']);
      // if pairListMap  is exist in redux, fetch portfolio by pairListMap
      if (pairListMap) {
        const pairList = Object.values(pairListMap);
        const params = pairList.map((p) => {
          return {
            traderAddr: userAddr,
            instrumentAddr: p.instrumentAddr,
            expiry: p.expiry,
          } as FetchPortfolioParam;
        });
        if (params) {
          const accountRes = await dispatch(
            syn_getPortfolioList({ chainId, userAddr, blockNumber, sdkContext, portfolioParams: params }),
          ).unwrap();
          if (accountRes && accountRes?.length) {
            const accountRecord = reduceAccounts(chainId, userAddr, accountRes);
            return bigNumberObjectCheck(accountRecord);
          }
        }
      }
      if (needFetchInstruments) {
        const instrumentList = await dispatch(syn_getAllFutures({ chainId, sdkContext })).unwrap();
        if (instrumentList) instruments = instrumentList;
      }

      if (instruments?.length) {
        const accountRes = await dispatch(
          syn_getPortfolioList({ chainId, userAddr, blockNumber, sdkContext, instruments }),
        ).unwrap();

        if (accountRes && accountRes?.length) {
          const accountRecord = reduceAccounts(chainId, userAddr, accountRes);
          return bigNumberObjectCheck(accountRecord);
        }
      } else if (instruments) {
        return {} as IAccountRecords;
      }
    } catch (error) {
      SentryService.captureException(error, {
        name: 'account/getAllAccountsFromChain',
        chainId,
        userAddr,
        blockNumber,
        instruments: instruments?.map((i) => i.instrumentAddr),
        needFetchInstruments,
      });
      console.error('🚀 ~ getAllAccountsFromChain error:', error);
    }
  },
);

export const updatePortfolio = createAsyncThunk(
  'account/updatePortfolio',
  async ({ reducedPortfolio, chainId, userAddr }: WorkerPortfolioResult): Promise<IAccountRecords | undefined> => {
    if (reducedPortfolio) {
      Object.values(reducedPortfolio.positionMap).forEach((position) => {
        if (checkAccountIsInPair({ position }))
          saveSingleParticipatedPairsToLocalForage(
            { instrumentAddr: position.instrumentAddr, expiry: position.expiry },
            userAddr,
            chainId,
          );
      });
      Object.values(reducedPortfolio.orderMap).forEach((order) => {
        if (checkAccountIsInPair({ orders: [order] }))
          saveSingleParticipatedPairsToLocalForage(
            { instrumentAddr: order.instrumentAddr, expiry: order.expiry },
            userAddr,
            chainId,
          );
      });
      Object.values(reducedPortfolio.rangeMap).forEach((range) => {
        if (checkAccountIsInPair({ ranges: [range] }))
          saveSingleParticipatedPairsToLocalForage(
            { instrumentAddr: range.instrumentAddr, expiry: range.expiry },
            userAddr,
            chainId,
          );
      });

      return bigNumberObjectCheck(reducedPortfolio);
    }
  },
);

export const getPortfolioFromChain = createAsyncThunk(
  'pair/getPortfolioFromChain',
  async ({
    chainId,
    instrumentAddr,
    // blockNumber,
    expiry,
    userAddr,
  }: {
    chainId: CHAIN_ID;
    userAddr: string;
    instrumentAddr: string;
    expiry: number;
    blockNumber?: number;
  }): Promise<void> => {
    if (!instrumentAddr || !expiry || !userAddr || !chainId) return;
    // TODO: now we don't need to fetch portfolio from chain, move to api
    // just post message to worker
    // window.synWorker.postMessage({
    //   eventName: WorkerEventNames.FetchPortfolio,
    //   data: {
    //     chainId,
    //     userAddr,
    //     expiry,
    //     instrumentAddr,
    //     blockNumber,
    //   },
    // });
  },
);

export const getAllParticipatedFuturesFromChain = createAsyncThunk(
  'futures/getAllParticipatedFuturesFromChain',
  async (
    {
      chainId,
      sdkContext,
      userAddr,
    }: {
      chainId: CHAIN_ID;
      userAddr: string;
      // marginType: MARGIN_TYPE;
      sdkContext: Context;
    },
    { dispatch },
  ): Promise<Instrument[] | undefined> => {
    try {
      const startAt = Date.now();
      // 1. fetch from localforage
      const pairParams = await getParticipatedPairsFromLocalForage(userAddr, chainId);
      if (pairParams?.length) {
        const instrumentParams = pairParams.reduce((acc, pair) => {
          const { instrumentAddr, expiry } = pair;
          const paramP = acc.find((param) => param.instrument === instrumentAddr);
          if (paramP) {
            paramP.expiries.push(expiry);
          } else {
            acc.push({ instrument: instrumentAddr, expiries: [expiry] });
          }
          return acc;
        }, [] as FetchInstrumentParam[]);
        const instrumentList = await dispatch(
          syn_getFuturesByAddress({ chainId, sdkContext, params: instrumentParams }),
        ).unwrap();
        console.record(
          'syn',
          'getAllParticipatedFuturesFromChain instruments:',
          {
            instrumentList,
            instrumentParams,
            userAddr,
          },
          instrumentList?.length,
          'usage:',
          Date.now() - startAt,
        );
        instrumentList && dispatch(parseInstrumentToMeta({ chainId, instrumentList }));
        return instrumentList;
      }

      try {
        // 2. fetch from graph
        const pairParamsFromGraph = await sdkContext.perpDataSource.user.getUserAmms(userAddr);
        if (pairParamsFromGraph?.length) {
          await saveParticipatedPairsToLocalForage(
            pairParamsFromGraph.map((p) => {
              return { instrumentAddr: p.instrument, expiry: p.expiry };
            }),
            userAddr,
            chainId,
          );
          const instrumentList = await dispatch(
            syn_getFuturesByAddress({
              chainId,
              sdkContext,
              params: pairParamsFromGraph.map((pair) => ({ instrument: pair.instrument, expiries: [pair.expiry] })),
            }),
          ).unwrap();
          console.record(
            'syn',
            'getAllParticipatedFuturesFromChain pairParamsFromGraph instruments:',
            {
              instrumentList,
              pairParamsFromGraph,
              userAddr,
            },
            instrumentList?.length,
            'usage:',
            Date.now() - startAt,
          );
          instrumentList && dispatch(parseInstrumentToMeta({ chainId, instrumentList }));
          return instrumentList;
        } else if (pairParamsFromGraph) {
          return [];
        }
      } catch (error) {
        console.log('🚀 ~ error:', error);
      }

      // 3.  fetch from market api
      try {
        const marketDatas = await fetchMarketPairList();
        if (marketDatas?.length) {
          const chainPairs = marketDatas.find((m) => m.chainId === chainId)?.pairs;
          if (chainPairs) {
            const instrumentList = await dispatch(
              syn_getFuturesByAddress({
                chainId,
                sdkContext,
                params: chainPairs.map((pair) => ({ instrument: pair.instrumentAddress, expiries: [pair.expiry] })),
              }),
            ).unwrap();
            instrumentList && dispatch(parseInstrumentToMeta({ chainId, instrumentList }));
            return instrumentList;
          }
        }
      } catch (error) {}

      // 4. otherwise, return fetch all futures
      dispatch(getAllFuturesFromChain({ chainId, sdkContext, userAddr }));
    } catch (error) {
      console.error('🚀 ~ error:', error);
    }
  },
);

export const updatePortfolioList = createAsyncThunk(
  'account/updatePortfolioList',
  async ({
    accountRecords,
  }: {
    chainId: CHAIN_ID;
    userAddr: string;
    blockNumber?: number;
    accountRecords: IAccountRecords;
  }): Promise<IAccountRecords | undefined> => {
    return accountRecords;
  },
);
