import _ from 'lodash';

import { IInstrumentRecord } from '@/types/pair';

import { Instrument } from '@synfutures/sdks-perp';
import { bigNumberObjectCheck } from '.';
import { transformToMetaFutures, transformToMetaPair } from './transform/pair';

export function reduceFuturesForWorker(chainId: number, futures: Record<string, Instrument>): IInstrumentRecord {
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
