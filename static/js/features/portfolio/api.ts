import { CHAIN_ID } from '@/constants/chain';
import { bigNumberObjectCheck, debounceRequest } from '@/utils';
import { checkAccountIsInPair } from '@/utils/account';
import { axiosGet } from '@/utils/axios';
import { retryWhenTimeout } from '@/utils/retry';
import { saveParticipatedPairsToLocalForage } from '@/utils/storage';
import { Context } from '@derivation-tech/context';
import { Amm, FetchPortfolioParam, Instrument, Order, Portfolio, Range } from '@synfutures/sdks-perp';
import _ from 'lodash';
import { fetchMarketPairList } from '../market/api';
export const getAllParticipatedFuturesFromChain = async ({
  chainId,
  sdkContext,
  userAddr,
}: {
  chainId: CHAIN_ID;
  userAddr: string;
  // marginType: MARGIN_TYPE;
  sdkContext: Context;
}): Promise<Instrument[] | null> => {
  const startAt = Date.now();
  // 1. fetch from graph
  try {
    const pairParamsFromGraph = await sdkContext.perpDataSource.user.getUserAmms(userAddr);
    if (pairParamsFromGraph?.length) {
      await saveParticipatedPairsToLocalForage(
        pairParamsFromGraph.map((p) => {
          return { instrumentAddr: p.instrument, expiry: p.expiry };
        }),
        userAddr,
        chainId,
      );
      //  const chainConfig = DAPP_CHAIN_CONFIGS[chainId];

      const instrumentList = await retryWhenTimeout(
        sdkContext?.perp?.observer.getInstrument(
          pairParamsFromGraph.map((pair) => ({ instrument: pair.instrument, expiries: [pair.expiry] })),
        ),
        15000,
      );

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
      return instrumentList;
    } else if (pairParamsFromGraph) {
      return [];
    }
  } catch (error) {
    console.log('🚀 ~ error:', error);
  }

  // 2.  fetch from market api
  try {
    const marketDatas = await fetchMarketPairList();
    if (marketDatas?.length) {
      const chainPairs = marketDatas.find((m) => m.chainId === chainId)?.pairs;
      if (chainPairs) {
        const instrumentList = await retryWhenTimeout(
          sdkContext?.perp?.observer.getInstrument(
            chainPairs.map((pair) => ({ instrument: pair.instrumentAddress, expiries: [pair.expiry] })),
          ),
          15000,
        );

        return instrumentList;
      }
    }
  } catch (error) {}
  return null;
};

export const fetchPortfolioListFromChain = async ({
  chainId,
  userAddr,
  blockNumber,
  sdk: sdkContext,
  portfolioParams,
}: {
  chainId: CHAIN_ID;
  userAddr: string;
  blockNumber?: number;
  sdk: Context;
  //   instruments?: Instrument[];
  portfolioParams?: FetchPortfolioParam[];
}): Promise<Portfolio[] | null> => {
  if (sdkContext) {
    if (!portfolioParams) return null;
    const accountList = await retryWhenTimeout(sdkContext?.perp?.observer.getPortfolio(portfolioParams));
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
  return null;
};

export const fetchPortfolioListFromApi = debounceRequest(
  async (
    chainId: number,
    userAddress: string,
    instrumentAddress?: string,
    expiry?: number,
  ): Promise<{ instruments: Instrument[]; portfolios: Portfolio[] } | null> => {
    const res = await axiosGet({
      url: '/v3/public/perp/market/user/portfolio/v1',
      config: {
        params: {
          chainId,
          userAddress: userAddress,
          ...(instrumentAddress && { instrumentAddress }),
          ...(expiry && { expiry }),
        },
      },
    });
    if (res?.data?.data) {
      const data = bigNumberObjectCheck(res.data.data);
      let { instruments, portfolios } = data;
      if (portfolios?.length) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        portfolios = portfolios.map((d: any) => {
          return {
            ...d,
            orders: _.reduce(
              d.orders,
              (acc, value, key) => {
                acc.set(Number(key), value);
                return acc;
              },
              new Map<number, Order>(),
            ),
            ranges: _.reduce(
              d.ranges,
              (acc, value, key) => {
                acc.set(Number(key), value);
                return acc;
              },
              new Map<number, Range>(),
            ),
          };
        });
      }

      if (instruments?.length) {
        instruments = instruments.map((instrument: Instrument) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const amms = instrument.amms as any;
          return {
            ...instrument,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            amms: amms.reduce((map: any, amm: any) => {
              map.set(amm.expiry, amm);
              return map;
            }, new Map<number, Amm>()),
          };
        });
      }

      return { instruments: instruments || [], portfolios: portfolios || [] };
    }
    return null;
  },
  200,
);
