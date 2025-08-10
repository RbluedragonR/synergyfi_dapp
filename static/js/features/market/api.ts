import { S3_PAIRS_KEY } from '@/constants/storage';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { BackendChainsConfig, IBannerItem } from '@/types/config';
import { IMarketTrendInfo } from '@/types/market';
import { CreativePair, IMarketChainPairList, IMarketPair, INewPair } from '@/types/pair';
import { axiosGet } from '@/utils/axios';
import { getExpiryNumberFromString, getMarginTypeByFeeder } from '@/utils/pairs';
import { showProperDateString } from '@/utils/timeUtils';
import { mappingToken } from '@/utils/token';
import { getPairId } from '@/utils/transform/transformId';
import { FeederType, SETTLING_DURATION } from '@synfutures/sdks-perp';
import localforage from 'localforage';
import _ from 'lodash';
import moment from 'moment';

export const fetchMarketPairList = async (): Promise<IMarketChainPairList[] | undefined> => {
  const res = await axiosGet({ url: '/v3/public/perp/market/list' });
  if (res?.data?.data) {
    const keys = _.keys(res?.data?.data);
    return _.map(keys, (key) => {
      const value = res?.data?.data[key];
      return {
        pairs: value.pairs.map((p: IMarketPair) => {
          const isInverse = p.isInverse;
          return {
            ...p,
            chainId: key,
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
            poolFee24h: WrappedBigNumber.from(p.poolFee24h),
          };
        }),
        chainId: Number(key),
        totalEffectLiqTvlUsd: WrappedBigNumber.from(value.totalEffectLiqTvlUsd),
        totalTvlUsd: WrappedBigNumber.from(value.totalTvlUsd),
        totalVolume24Usd: WrappedBigNumber.from(value.totalVolume24Usd),
        totalOpenInterestsUsd: WrappedBigNumber.from(value.totalOpenInterestsUsd),
      };
    });
  }
};

export const fetchMarketCreativePairs = async (
  backendChainsConfig: BackendChainsConfig,
): Promise<Record<string, CreativePair> | undefined> => {
  // const pairs = (await localforage.getItem(S3_PAIRS_KEY)) || ({} as Record<string, CreativePair>);
  try {
    const res = await axiosGet({ url: '/v3/public/perp/market/feature/pairs' });
    if (res?.data?.data) {
      const keys = _.keys(res?.data?.data);
      const values = _.map(keys, (key) =>
        res?.data?.data[key].map((p: INewPair) => ({ ...p, chainId: key })),
      ) as INewPair[][];
      const mappedPairs = values.map((newPairs: INewPair[]) => {
        const mappedNewPairs = _.flatMap(
          newPairs.map((p) => {
            const baseToken = mappingToken({
              token: p.instrument.baseToken,
              chainId: p.chainId,
              marketType: p.instrument.marketType,
            });
            const quoteToken = mappingToken({ token: p.instrument.quoteToken, chainId: p.chainId });
            const pairs = p.expiry.map((exp: string) => {
              const expiry = getExpiryNumberFromString(exp);
              let isInverse = FeederType.BASE_STABLE === p.instrument.feederType;
              // TODO: v3/public/common/inversePairs
              const inverseInstruments = backendChainsConfig[p.chainId]?.['customInverseInstruments'];
              const instrumentSymbol = `${baseToken.symbol}-${quoteToken.symbol}-${p.instrument.marketType}`;
              if (inverseInstruments && inverseInstruments.includes(instrumentSymbol)) {
                isInverse = true;
              }
              return {
                id: `${baseToken.id}-${quoteToken.id}-${expiry}`,
                chainId: p.chainId,
                symbol: `${instrumentSymbol}-${showProperDateString({
                  expiry,
                  format: 'MMDD',
                })}`,
                rootInstrument: {
                  ...p.instrument,
                  baseToken,
                  quoteToken,
                  displaySymbol: isInverse
                    ? `${quoteToken.symbol}-${baseToken.symbol}-${p.instrument.marketType}`
                    : instrumentSymbol,
                  isInverse,
                },
                expiry,
                marginType: getMarginTypeByFeeder(p.instrument.feederType),
              };
            });
            return pairs;
          }),
        );
        return mappedNewPairs;
      });
      const newPairs: CreativePair[] = _.flatMap(mappedPairs);

      // if pair expiry, filter it
      const utcAdjustedToday = moment.utc().add(SETTLING_DURATION, 'seconds'); // 30 mins
      const newPairsFiltered = newPairs.filter((pair) => {
        return pair.expiry > utcAdjustedToday.unix();
      });

      const s3Pairs = _.keyBy(newPairsFiltered, 'id');
      localforage.setItem(S3_PAIRS_KEY, newPairsFiltered);
      return s3Pairs;
    }
  } catch (e) {
    console.error('🚀 ~ fetchMarketCreativePairs e', e);
    // return pairs as Record<string, CreativePair>;
    throw e;
  }
};

export const fetchMarketTrendInfo = async (): Promise<IMarketTrendInfo[]> => {
  try {
    const response = await axiosGet({
      url: '/v3/public/perp/market/cards',
    });

    // Validate and transform the response data
    if (response?.data?.data) {
      return response.data.data.map((item: IMarketTrendInfo) => ({
        lightBg: item.lightBg || '',
        darkBg: item.darkBg || '',
        link: item.link || '',
        openNewTab: item.openNewTab || false,
        sort: item.sort || 0,
      }));
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch market trend info:', error);
    throw error;
  }
};

export const fetchMarketBanners = async (): Promise<IBannerItem[]> => {
  try {
    const response = await axiosGet({
      url: '/v3/public/common/dapp/config',
    });

    // Validate and transform the response data
    if (response?.data?.data) {
      return response.data.data.banners;
    }
  } catch (error) {
    console.error('Failed to fetch market banners:', error);
    throw error;
  }
  return [];
};
