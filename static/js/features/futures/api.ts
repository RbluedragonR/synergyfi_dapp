import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { IDepthChartData } from '@/types/chart';
import { IFundingChart, IFuturesFundingRateData, IFuturesInstrument, IFuturesOrderBookAllSteps } from '@/types/futures';
import { IMarketPair } from '@/types/pair';
import { bigNumberObjectCheck, debounceRequest } from '@/utils';
import { axiosGet } from '@/utils/axios';
import { getAdjustTradePrice } from '@/utils/pairs';
import { getPairId } from '@/utils/transform/transformId';
import { Context } from '@derivation-tech/context';
import { Amm, MinimalPearl } from '@synfutures/sdks-perp';
import { DepthChartData, FundingChartInterval, KlineData, KlineInterval } from '@synfutures/sdks-perp-datasource';
import _ from 'lodash';
import moment from 'moment';

export async function fetchInstrumentFromChain(
  sdk: Context,
  instrumentAddr: string,
  expiry?: number,
  block?: number,
): Promise<IFuturesInstrument | null> {
  if (sdk) {
    const instrumentList = await sdk.perp.observer.getInstrument(
      [
        {
          instrument: instrumentAddr,
          expiries: expiry ? [expiry] : [],
        },
      ],
      { blockTag: block },
    );
    if (instrumentList.length > 0) {
      const futuresItem = instrumentList[0];

      block = futuresItem.blockInfo?.height || 0;

      return futuresItem;
    }
  }
  return null;
}

export const fetchFuturesInstrument = debounceRequest(
  async (chainId: number, instrumentAddr: string): Promise<IFuturesInstrument | null> => {
    const res = await axiosGet({
      url: '/v3/public/perp/market/instrument/v1',
      config: { params: { chainId, address: instrumentAddr } },
    });
    if (res?.data?.data) {
      const data = bigNumberObjectCheck(res.data.data);
      const amms = data.amms;
      return {
        ...data,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        amms: amms.reduce((map: any, amm: any) => {
          map.set(amm.expiry, amm);
          return map;
        }, new Map<number, Amm>()),
      };
    }
    return null;
  },
  0,
);

export const fetchFuturesPairInfo = async ({
  chainId,
  address,
  expiry,
}: {
  chainId: number;
  address: string;
  expiry: number;
}): Promise<IMarketPair | null> => {
  const res = await axiosGet({
    url: '/v3/public/perp/market/pairInfo',
    config: { params: { chainId, address, expiry } },
  });
  if (res?.data?.data) {
    const p = res?.data?.data;
    const isInverse = p.isInverse;
    return {
      ...p,
      chainId: chainId,
      id: getPairId(p.instrumentAddress, p.expiry),
      fairPrice: WrappedBigNumber.from(p.fairPrice),
      markPrice: WrappedBigNumber.from(p.markPrice),
      fairPriceChange24h: WrappedBigNumber.from(p.fairPriceChange24h),
      markPriceChange24h: WrappedBigNumber.from(p.fairPriceChange24h),
      liquidityApy: WrappedBigNumber.from(p.liquidityApy),
      volume24h: WrappedBigNumber.from(p.volume24h),
      openInterests: WrappedBigNumber.from(p.openInterests),
      tvl: WrappedBigNumber.from(p.tvl),
      volume24hUsd: WrappedBigNumber.from(p.volume24hUsd),
      tvlUsd: WrappedBigNumber.from(p.tvlUsd),
      effectLiqTvl: WrappedBigNumber.from(p.effectLiqTvl),
      openInterestsUsd: WrappedBigNumber.from(p.openInterestsUsd),
      isInverse,
      longOi: WrappedBigNumber.from(p.longOi),
      shortOi: WrappedBigNumber.from(p.shortOi),
      _1hPeriodsFunding: {
        long: WrappedBigNumber.from(p._1hPeriodsFunding.long),
        short: WrappedBigNumber.from(p._1hPeriodsFunding.short),
      },
      _1hLastFunding: {
        long: WrappedBigNumber.from(p._1hLastFunding.long),
        short: WrappedBigNumber.from(p._1hLastFunding.short),
      },
      poolFee24h: WrappedBigNumber.from(p.poolFee24h),
    };
  }
  return null;
};

export const fetchFuturesPairOrderBook = debounceRequest(
  async ({
    chainId,
    address,
    expiry,
    sdk,
  }: {
    chainId: number;
    address: string;
    expiry: number;
    sdk: Context;
  }): Promise<IFuturesOrderBookAllSteps | null> => {
    const res = await axiosGet({
      url: '/v3/public/perp/market/orderBook',
      config: { params: { chainId, address, expiry } },
    });

    if (res?.data?.data) {
      const data = bigNumberObjectCheck(res.data.data);
      const newData = _.reduce(
        data,
        (acc, depth, key) => {
          depth.tick2Pearl = _.reduce(
            depth.tick2Pearl,
            (acc, value, key) => {
              acc.set(Number(key), { liquidityNet: value[0], left: value[1] });
              return acc;
            },
            new Map() as Map<number, MinimalPearl>,
          );

          const depthData = sdk.perpDataSource.depth.getDepthDataByLiquidityDetails(
            depth,
            depth.size,
            depth.tickDelta,
            // depth?.isInverse,
          );
          if (depth.isInverse) {
            const temp = depthData.left;
            depthData.left = depthData.right.map((d) => {
              return { ...d, price: getAdjustTradePrice(d.price, depth.isInverse).toNumber() };
            });
            depthData.right = temp.map((d) => {
              return { ...d, price: getAdjustTradePrice(d.price, depth.isInverse).toNumber() };
            });
          }

          acc[key] = depthData;
          return acc;
        },
        {} as Record<string, { left: DepthChartData[]; right: DepthChartData[] }>,
      );

      return newData;
    }
    return null;
  },
  0,
);

export const fetchFuturesPairDepthChart = debounceRequest(
  async ({
    chainId,
    address,
    expiry,
    sdk,
  }: {
    chainId: number;
    address: string;
    expiry: number;
    sdk: Context;
  }): Promise<IDepthChartData | null> => {
    const res = await axiosGet({
      url: '/v3/public/perp/market/depth',
      config: { params: { chainId, address, expiry } },
    });
    if (res?.data?.data) {
      const data = bigNumberObjectCheck(res.data.data);
      data.tick2Pearl = _.reduce(
        data.tick2Pearl,
        (acc, value, key) => {
          acc.set(Number(key), { liquidityNet: value[0], left: value[1] });
          return acc;
        },
        new Map() as Map<number, MinimalPearl>,
      );

      const newData = sdk.perpDataSource.depth.getDepthRangeDataByLiquidityDetails(
        data,
        data.size,
        data.stepRatio,
        data?.isInverse,
      );
      if (data.isInverse) {
        const temp = newData.left;
        newData.left = newData.right.map((d) => {
          return { ...d, price: getAdjustTradePrice(d.price, data.isInverse).toNumber() };
        });
        newData.right = temp.map((d) => {
          return { ...d, price: getAdjustTradePrice(d.price, data.isInverse).toNumber() };
        });
      }

      return newData;
    }
    return null;
  },
  0,
);

export const fetchFuturesPairFundingChart = debounceRequest(
  async ({
    chainId,
    address,
    expiry,
    chartDuration,
  }: {
    chainId: number;
    address: string;
    expiry: number;
    chartDuration: FundingChartInterval;
  }): Promise<IFundingChart[] | null> => {
    const res = await axiosGet({
      url: '/v3/public/perp/market/funding',
      config: { params: { chainId, address, expiry, type: chartDuration } },
    });

    if (res?.data?.data) {
      const dataSource: IFundingChart[] = res?.data?.data.map((d: IFuturesFundingRateData) => {
        return {
          ...d,
        };
      });
      // if (pair.isInverse) {
      //   dataSource = dataSource.map((d) => {
      //     return { ...d, longFundingRate: d.shortFundingRate, shortFundingRate: d.longFundingRate };
      //   });
      // }
      return dataSource.map((d) => {
        const isLongPay = d.longFundingRate < 0;
        return {
          ...d,
          payRate: WrappedBigNumber.from(isLongPay ? d.longFundingRate : d.shortFundingRate),
          receiveRate: WrappedBigNumber.from(isLongPay ? d.shortFundingRate : d.longFundingRate),
          isLongPay: isLongPay,
        };
      });
    }
    return null;
  },
  0,
);

export const fetchFuturesPairKlineChart = debounceRequest(
  async ({
    chainId,
    instrumentAddr,
    expiry,
    chartDuration,
    timeEnd,
  }: {
    chainId: number;
    instrumentAddr: string;
    expiry: number;
    chartDuration: KlineInterval;
    timeEnd?: number;
  }): Promise<KlineData[] | null> => {
    timeEnd = timeEnd || Math.floor(Date.now() / 1000);
    // fetch 1 more minute data to avoid the last candle tick error
    let utcEnd = moment(timeEnd * 1000).second(0);
    const utcNow = moment(timeEnd * 1000);
    let startTs = utcNow.unix();
    const TIME_NUMBERS = 120;
    if (chartDuration === KlineInterval.DAY) {
      startTs = utcNow.add(-TIME_NUMBERS, 'day').unix();
      utcEnd = utcEnd.add(1, 'day');
    } else if (chartDuration === KlineInterval.WEEK) {
      startTs = utcNow.add(-TIME_NUMBERS * 7, 'day').unix();
      utcEnd = utcEnd.add(7, 'day');
    } else if (chartDuration === KlineInterval.MINUTE) {
      startTs = utcNow.add(-TIME_NUMBERS, 'minutes').unix();
      utcEnd = utcEnd.add(1, 'minutes');
    } else if (chartDuration === KlineInterval.FIVE_MINUTE) {
      startTs = utcNow.add(-TIME_NUMBERS * 5, 'minutes').unix();
      utcEnd = utcEnd.add(5, 'minutes');
    } else if (chartDuration === KlineInterval.FIFTEEN_MINUTE) {
      startTs = utcNow.add(-TIME_NUMBERS * 15, 'minutes').unix();
      utcEnd = utcEnd.add(15, 'minutes');
    } else if (chartDuration === KlineInterval.THIRTY_MINUTE) {
      startTs = utcNow.add(-TIME_NUMBERS * 30, 'minutes').unix();
      utcEnd = utcEnd.add(30, 'minutes');
    } else if (chartDuration === KlineInterval.HOUR) {
      startTs = utcNow.add(-TIME_NUMBERS, 'hours').unix();
      utcEnd = utcEnd.add(1, 'hours');
    } else if (chartDuration === KlineInterval.FOUR_HOUR) {
      startTs = utcNow.add(-TIME_NUMBERS * 4, 'hours').unix();
      utcEnd = utcEnd.add(4, 'hours');
    }

    const endTs = utcEnd.unix();

    const res = await axiosGet({
      url: `/v3/public/perp/market/kline`,
      config: {
        params: {
          chainId,
          instrument: instrumentAddr,
          expiry,
          interval: chartDuration,
          startTs,
          endTs,
        },
      },
    });
    let data = res?.data?.data;

    // remove the last tick with 0 volume
    if (data.length && data.length >= 2) {
      const last = data[data.length - 1];
      if (last.baseVolume === 0) {
        data = data.slice(0, data.length - 1);
      }
    }
    return data;
  },
  0,
);
