import _ from 'lodash';

import { IInstrumentRecord } from '@/types/pair';

import { WrappedInstrument } from '@/entities/WrappedInstrument';
import { WrappedPair } from '@/entities/WrappedPair';
import { Instrument } from '@synfutures/sdks-perp';
import { bigNumberObjectCheck } from '.';
import { transformToMetaFutures, transformToMetaPair } from './transform/pair';
import { transformToWrappedInstrument } from './transform/transformWrappedEntities';

export function reduceFutures(chainId: number, futures: Record<string, Instrument>): IInstrumentRecord {
  const allFutures = _.reduce(
    futures,
    (res, futuresObj) => {
      if (!res.futuresMap) {
        res.futuresMap = {};
      }
      if (!res?.blockInfo?.height) {
        res.blockInfo = futuresObj.blockInfo || {
          height: 0,
          timestamp: 0,
        };
      }
      if (!res.pairMap) {
        res.pairMap = {};
      }

      transformToWrappedInstrument(futuresObj, chainId);

      const futuresCore = transformToMetaFutures(futuresObj, chainId);
      res.futuresMap[futuresCore.id] = futuresCore;
      const amms = futuresObj?.amms;
      if (amms) {
        amms.forEach((amm) => {
          const pairId = `${futuresObj.instrumentAddr}-${amm.expiry}`.toLowerCase();
          const pairCore = transformToMetaPair({
            amm: amm,
            futures: futuresObj,
            blockInfo: amm.blockInfo,
          });
          res.pairMap[pairId] = pairCore;
        });
      }
      return bigNumberObjectCheck(res);
    },
    {} as IInstrumentRecord,
  );
  allFutures.chainId = chainId;
  return allFutures;
}

// export const getLeftRatio = (minPrice: number, currentPrice: number): number =>
//   minPrice < currentPrice ? currentPrice / minPrice : -minPrice / currentPrice;
// export const getRightRatio = (maxPrice: number, currentPrice: number): number =>
//   maxPrice > currentPrice ? maxPrice / currentPrice : -currentPrice / maxPrice;
export const getLeftRatio = (minPrice: number, currentPrice: number): number =>
  minPrice < currentPrice ? currentPrice / minPrice - 1 : -(1 - minPrice / currentPrice);
export const getRightRatio = (maxPrice: number, currentPrice: number): number =>
  maxPrice > currentPrice ? maxPrice / currentPrice - 1 : -(1 - currentPrice / maxPrice);

/**
 * Checks if the given pair is an instance of WrappedPair.
 *
 * @param pair - The pair to check.
 * @returns A boolean indicating whether the pair is an instance of WrappedPair.
 */
export function isWrappedPairType(pair: unknown): pair is WrappedPair {
  return !!pair && pair instanceof WrappedPair;
}

/**
 * Checks if the given instrument is of type `WrappedInstrument`.
 *
 * @param instrument - The instrument to check.
 * @returns A boolean indicating whether the instrument is a `WrappedInstrument`.
 */
export function isWrappedInstrumentType(instrument: unknown): instrument is WrappedInstrument {
  return !!instrument && instrument instanceof WrappedInstrument;
}
