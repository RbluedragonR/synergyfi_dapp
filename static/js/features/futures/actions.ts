import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { FetchInstrumentParam, MarketType } from '@synfutures/sdks-perp';
import { BigNumber } from 'ethers';

import { CHAIN_ID } from '@/constants/chain';
import { IInstrumentRecord, IMetaInstrument } from '@/types/pair';
import { ISpotState } from '@/types/spot';
import { BlockyResult, WorkerEventNames } from '@/types/worker';
import { bigNumberObjectCheck } from '@/utils';
import { reduceFutures } from '@/utils/pair';
// import { MySDK } from '@/types/sdk';

// import { getWrappedSynWorker } from '@/worker/factory';
// import { ChainSynWorker } from '@/worker/SynWorker';
// import { fillEmptyAccount } from '../account/actions';
import { Context } from '@derivation-tech/context';
import { Instrument } from '@synfutures/sdks-perp';
import { syn_getAllFutures } from '../syn/action';

export const setFuturesCore = createAction<{
  chainId: CHAIN_ID;
  underlyingId: string;
  underlying: Partial<IMetaInstrument>;
}>('futures/setFuturesCore');

export const getAllFuturesFromChain = createAsyncThunk(
  'futures/getAllFuturesFromChain',
  async (
    {
      chainId,
      sdkContext,
    }: // marginType,
    {
      chainId: CHAIN_ID;
      userAddr: string;
      // marginType: MARGIN_TYPE;
      sdkContext: Context;
    },
    { dispatch },
  ): Promise<Instrument[] | undefined> => {
    try {
      const instrumentList = await dispatch(syn_getAllFutures({ chainId, sdkContext })).unwrap();
      instrumentList && dispatch(parseInstrumentToMeta({ chainId, instrumentList }));
      return instrumentList;
    } catch (error) {
      console.error('🚀 ~ error:', error);
    }
  },
);

export const parseInstrumentToMeta = createAsyncThunk(
  'futures/parseInstrumentToMeta',
  async ({
    chainId,
    instrumentList,
  }: {
    chainId: CHAIN_ID;
    instrumentList: Instrument[];
  }): Promise<IInstrumentRecord | undefined> => {
    if (instrumentList) {
      const instrumentMap = instrumentList.reduce((acc, futures) => {
        acc[futures.instrumentAddr.toLowerCase()] = futures;
        return acc;
      }, {} as Record<string, Instrument>);

      if (instrumentMap) {
        const futuresRecords = reduceFutures(chainId, bigNumberObjectCheck(instrumentMap));
        // dispatch(fillEmptyAccount({ chainId, futuresRecords, userAddr }));
        return futuresRecords;
      }
    }
  },
);

export const updateFuturesFromChain = createAsyncThunk(
  'futures/updateFuturesFromChain',
  async ({
    futuresRecord,
  }: {
    chainId: CHAIN_ID;
    block: number;
    futuresRecord: IInstrumentRecord;
  }): Promise<IInstrumentRecord | undefined> => {
    if (futuresRecord) {
      // const {
      //   global: { chainTokenPriceInfo },
      // } = getState() as AppState;
      // let tokenPriceMap: TokenPriceInfoMap | undefined = undefined;
      // if (chainId) {
      //   if (_.get(chainTokenPriceInfo, [chainId])) {
      //     tokenPriceMap = _.get(chainTokenPriceInfo, [chainId]);
      //     console.log('🚀 ~ tokenPriceMap:', tokenPriceMap);
      //   }
      // }
      // const futuresRecord = reduceFutures(chainId, { [futures.info.addr.toLowerCase()]: futures }, tokenPriceMap);
      return futuresRecord;
    }
  },
);

export const getInstrumentSpotTime = createAsyncThunk(
  'futures/getInstrumentSpotTime',
  async ({
    chainId,
    instrumentAddr,
    blockNumber,
    marketType,
  }: {
    chainId: CHAIN_ID;
    instrumentAddr: string;
    marketType: MarketType;
    blockNumber?: number;
  }): Promise<void> => {
    // just post message to worker
    window.synWorker.postMessage({
      eventName: WorkerEventNames.FetchInstrumentSpotState,
      data: {
        chainId,
        instrumentAddr,
        blockNumber,
        marketType,
      },
    });
  },
);

export const updateInstrumentSpotStateMapFromChain = createAsyncThunk(
  'futures/updateInstrumentSpotStateMapFromChain',
  async ({
    instrumentSpotStateMap,
  }: {
    chainId: CHAIN_ID;
    block: number;
    instrumentSpotStateMap: { [instrumentAddr: string]: BlockyResult<ISpotState> }; // instrument address => spot state
  }): Promise<{ [instrumentAddr: string]: BlockyResult<ISpotState> } | undefined> => {
    if (instrumentSpotStateMap) {
      return instrumentSpotStateMap;
    }
  },
);

export const updateInstrumentSpotRawPriceMapFromChain = createAsyncThunk(
  'futures/updateInstrumentSpotRawPriceMapFromChain',
  async ({
    instrumentSpotRawPriceMap,
  }: {
    chainId: CHAIN_ID;
    block: number;
    instrumentSpotRawPriceMap: { [instrumentAddr: string]: BlockyResult<BigNumber> }; // instrument address => spot state
  }): Promise<{ [instrumentAddr: string]: BlockyResult<BigNumber> } | undefined> => {
    if (instrumentSpotRawPriceMap) {
      return instrumentSpotRawPriceMap;
    }
  },
);

export const batchPairsFromChain = createAsyncThunk(
  'futures/batchPairsFromChain',
  async ({
    chainId,
    params,
    blockNumber,
  }: {
    chainId: CHAIN_ID;
    params: FetchInstrumentParam[];
    blockNumber?: number;
  }) => {
    // just post message to worker
    window.synWorker.postMessage({
      eventName: WorkerEventNames.BatchPairs,
      data: {
        chainId,
        params,
        blockNumber,
      },
    });
  },
);
