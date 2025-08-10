import { CHAIN_ID } from '@derivation-tech/context';
import { createAsyncThunk } from '@reduxjs/toolkit';

import { retryWhenTimeout } from '@/utils/retry';

import { DAPP_CHAIN_CONFIGS } from '@/constants/chain';
import { checkAccountIsInPair } from '@/utils/account';
import { saveParticipatedPairsToLocalForage } from '@/utils/storage';
import { Context } from '@derivation-tech/context';
import { FetchInstrumentParam, FetchPortfolioParam, Instrument, Portfolio } from '@synfutures/sdks-perp';

export const syn_getAllFutures = createAsyncThunk(
  'syn/syn_getAllFutures',
  async ({
    chainId,
    blockNumber,
    sdkContext,
  }: {
    chainId: CHAIN_ID;
    blockNumber?: number;
    sdkContext: Context;
  }): Promise<Instrument[] | undefined> => {
    const chainConfig = DAPP_CHAIN_CONFIGS[chainId];

    try {
      if (sdkContext && chainConfig) {
        const instrumentList = await retryWhenTimeout(sdkContext.perp.observer.getAllInstruments(), 30000);
        console.record(
          'syn',
          `Query [syn_getAllFutures] ${!blockNumber ? '' : `with blockNumber ${blockNumber}`}`,
          instrumentList,
          {
            chainId,
          },
        );
        return instrumentList;
      }
    } catch (error) {
      console.error('🚀 ~ error syn_getAllFutures:', error);
    }
    return undefined;
  },
);

export const syn_getFuturesByAddress = createAsyncThunk(
  'syn/syn_getFuturesByAddress',
  async ({
    chainId,
    blockNumber,
    sdkContext,
    params,
  }: {
    chainId: CHAIN_ID;
    blockNumber?: number;
    sdkContext: Context;
    params: FetchInstrumentParam[];
  }): Promise<Instrument[] | undefined> => {
    const chainConfig = DAPP_CHAIN_CONFIGS[chainId];

    try {
      if (sdkContext && chainConfig) {
        const instrumentList = await retryWhenTimeout(sdkContext.perp.observer.getInstrument(params), 15000);
        console.record(
          'syn',
          `Query [syn_getFuturesByAddress] ${!blockNumber ? '' : `with blockNumber ${blockNumber}`}`,
          instrumentList,
          {
            chainId,
          },
        );
        return instrumentList;
      }
    } catch (error) {
      console.error('🚀 ~ error syn_getFuturesByAddress:', error);
    }
    return undefined;
  },
);

export const syn_getPortfolioList = createAsyncThunk(
  'syn/getPortfolioList',
  async ({
    chainId,
    userAddr,
    blockNumber,
    sdkContext,
    instruments,
    portfolioParams,
  }: {
    chainId: CHAIN_ID;
    userAddr: string;
    blockNumber?: number;
    sdkContext: Context;
    instruments?: Instrument[];
    portfolioParams?: FetchPortfolioParam[];
  }): Promise<Portfolio[] | undefined> => {
    if (sdkContext) {
      if (instruments) {
        portfolioParams = instruments.reduce((acc, instrument) => {
          instrument.amms.forEach((amm) => {
            acc.push({
              traderAddr: userAddr,
              instrumentAddr: instrument.instrumentAddr,
              expiry: amm.expiry,
            });
          });

          return acc;
        }, [] as FetchPortfolioParam[]);
      }
      if (!portfolioParams) return;
      const accountList = await retryWhenTimeout(sdkContext.perp.observer.getPortfolio(portfolioParams));
      if (accountList && accountList?.length) {
        const participatedPairs = accountList
          ?.filter(
            (p) =>
              checkAccountIsInPair({ position: p.position }) ||
              checkAccountIsInPair({ orders: Array.from(p.orders.values()) }) ||
              checkAccountIsInPair({ ranges: Array.from(p.ranges.values()) }),
          )
          .map((account) => ({
            instrumentAddr: account.instrumentAddr,
            expiry: account.expiry,
          }));
        await saveParticipatedPairsToLocalForage(participatedPairs, userAddr, chainId);
      } else if (accountList && (accountList as unknown as Portfolio)?.instrumentAddr) {
        return [accountList as unknown as Portfolio];
      }

      console.record(
        'syn',
        `Query [getPortfolioList] ${!blockNumber ? '' : `with blockNumber ${blockNumber}`}`,
        accountList,
        {
          chainId,
          userAddr,
        },
      );

      return accountList;
    }
    return undefined;
  },
);
