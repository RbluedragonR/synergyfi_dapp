import { HISTORY_RANGE } from '@/constants/history';
import { getOrdersHistoryFromSDK } from '@/utils/history';
import { CHAIN_ID } from '@derivation-tech/context';
import { createAction, createAsyncThunk } from '@reduxjs/toolkit';

import { DailyVolumeDetail } from '@/types/portfolio';
import { Context } from '@derivation-tech/context';
import { OrderHistory } from '@synfutures/sdks-perp-datasource';

export const setHistoryRange = createAction<HISTORY_RANGE>('graph/setHistoryRange');
export const resetHistory = createAction<{ chainId: CHAIN_ID }>('graph/resetHistory');

export const getOpenOrderCreateTime = createAsyncThunk(
  'graph/getOpenOrderCreateTime',
  async (args: Parameters<typeof getOrdersHistoryFromSDK>[0]): Promise<OrderHistory[] | undefined> => {
    return await getOrdersHistoryFromSDK(args);
  },
);

export const getDailyVolumeDetails = createAsyncThunk(
  'graph/getDailyVolumeDetails',
  async ({ sdk }: { userAddr: string; chainId: CHAIN_ID; sdk: Context }): Promise<DailyVolumeDetail[] | undefined> => {
    if (sdk) {
      // const details = await retryGeneralPromise(
      //   /* // @TODO uncomment after build large scale details solution */
      //   // (
      //   //   graphClient as unknown as {
      //   //     getDailyVolumeDetails: ({
      //   //       trader,
      //   //       startTs,
      //   //       endTs,
      //   //     }: {
      //   //       trader: string;
      //   //       startTs: number;
      //   //       endTs: number;
      //   //     }) => Promise<DailyVolumeDetail[] | undefined>;
      //   //   }
      //   // )
      //   sdk.dataSource. .getDailyVolumeDetails({
      //     trader: userAddr,
      //     startTs: Math.floor((now() - 3 * 30 * SECS_PER_DAY * 1000) / 1000),
      //     endTs: Math.floor(now() / 1000),
      //   }),
      // );
      return [];
    }
  },
);
