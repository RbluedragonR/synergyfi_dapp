import { BlockInfo, CHAIN_ID } from '@derivation-tech/context';

import { IMetaInstrument, IMetaPair } from '@/types/pair';

import { ADDRESS_ZERO, Amm, Instrument, MarketType, ZERO } from '@synfutures/sdks-perp';
import { mappingToken } from '../token';
import { getPairId } from './transformId';

export function transformToMetaFutures(instrument: Instrument, chainId: CHAIN_ID): IMetaInstrument {
  const instrumentAddr = instrument.instrumentAddr.toLowerCase();
  let base = instrument.base;
  // adapt for missing base token
  if (!base && instrument?.symbol) {
    const baseSymbol = instrument?.symbol.split('-')[0];
    base = {
      name: baseSymbol,
      symbol: baseSymbol,
      address: ADDRESS_ZERO,
      decimals: 0,
    };
    instrument.base = base;
  }
  return {
    ...instrument,
    instrumentAddr,
    id: instrumentAddr,
    baseToken: mappingToken({
      token: instrument.base,
      marketType: (instrument.market?.info?.type as MarketType) || MarketType.LINK,
      chainId: chainId,
    }),
    quoteToken: mappingToken({
      token: instrument.quote,
      // marketType: (futures.market?.info?.type as MarketType) || MarketType.LINK,
      chainId: chainId,
    }),
  };
}

export function transformToMetaPair({
  amm,
  futures,
  blockInfo,
}: {
  amm: Amm;
  futures: Instrument;
  blockInfo?: BlockInfo;
}): IMetaPair {
  const pairId = getPairId(futures.instrumentAddr, amm.expiry);
  return {
    ...amm,
    id: pairId,
    instrumentId: futures.instrumentAddr.toLowerCase(),
    markPrice: amm.markPrice || ZERO,
    blockInfo: blockInfo ||
      futures.blockInfo || {
        height: 0,
        timestamp: 0,
      },
  };
}
