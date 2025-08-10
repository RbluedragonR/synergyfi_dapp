import { CHAIN_ID } from '@derivation-tech/context';

import { WrappedInstrument } from '@/entities/WrappedInstrument';
import { WrappedPair } from '@/entities/WrappedPair';

import { QUERY_KEYS } from '@/constants/query';
import { WrappedAccount } from '@/entities/WrappedAccount';
import { WrappedOrder } from '@/entities/WrappedOrder';
import { WrappedPortfolio } from '@/entities/WrappedPortfolio';
import { WrappedPosition } from '@/entities/WrappedPosition';
import { WrappedRange } from '@/entities/WrappedRange';
import { ITokenPriceMap } from '@/features/global/type';
import { queryClient } from '@/pages/App';
import { IMetaAccount } from '@/types/account';
import { Amm, Instrument, Portfolio } from '@synfutures/sdks-perp';
import { transformMetaPortfolio, transformToMetaOrder, transformToMetaPosition, transformToMetaRange } from './account';
import { transformToMetaFutures, transformToMetaPair } from './pair';

/**
 * transform to WrappedInstrument
 * @param futures
 * @param chainId
 * @returns {WrappedInstrument}
 */
export function transformToWrappedInstrument(futures: Instrument, chainId: CHAIN_ID): WrappedInstrument {
  const metaFutures = transformToMetaFutures(futures, chainId);
  const wrappedInstrument = WrappedInstrument.wrapInstance({ metaFutures: metaFutures, chainId });
  const tokenPriceMap = queryClient.getQueryData<ITokenPriceMap>(QUERY_KEYS.GLOBAL.TOKEN_PRICE(chainId));
  if (tokenPriceMap && tokenPriceMap[wrappedInstrument?.quoteToken?.address]) {
    wrappedInstrument.setQuotePrice(tokenPriceMap[wrappedInstrument.quoteToken.address]);
  }

  const amms = futures.amms;
  if (amms && amms.size > 0) {
    amms.forEach((amm) => {
      transformToWrappedPair(amm, wrappedInstrument);
    });
  }

  return wrappedInstrument;
}

export function transformToWrappedPair(amm: Amm, wrappedInstrument: WrappedInstrument): WrappedPair | undefined {
  const metaPair = transformToMetaPair({
    amm: amm,
    futures: wrappedInstrument,
    blockInfo: amm.blockInfo || wrappedInstrument.blockInfo,
  });
  const wrappedPair = WrappedPair.wrapInstance({ metaPair: metaPair, rootInstrument: wrappedInstrument });
  if (wrappedPair) {
    // set relate
    wrappedInstrument.connectPair(wrappedPair.expiry, wrappedPair);
  }

  return wrappedPair;
}

export function transferToWrappedPortfolio(portfolio: Portfolio, chainId: CHAIN_ID, metaAccount: IMetaAccount) {
  const instrumentAddr = portfolio.instrumentAddr.toLowerCase();
  const userAddr = portfolio.traderAddr;
  const blockInfo = portfolio.blockInfo;
  const metaPortfolio = transformMetaPortfolio(userAddr, instrumentAddr, portfolio, blockInfo);
  const wrappedPair = WrappedPair.getInstance(metaPortfolio.pairId, chainId);
  const wrappedInstrument = WrappedInstrument.getInstance(instrumentAddr, chainId);
  if (!wrappedInstrument || !wrappedPair) return;
  const wrappedAccount = WrappedAccount.wrapInstance({
    metaAccount: metaAccount,
    chainId,
    rootInstrument: wrappedInstrument,
  });
  const wrappedPortfolio = WrappedPortfolio.wrapInstance({
    metaPortfolio: metaPortfolio,
    rootAccount: wrappedAccount,
    rootPair: wrappedPair,
  });
  if (wrappedPortfolio) {
    wrappedAccount.connectPortfolio(wrappedPortfolio);
    // connect position
    const position = portfolio.position;
    if (position) {
      const metaPosition = transformToMetaPosition({
        userAddr,
        instrumentAddr,
        portfolio: portfolio,
        position,
        blockInfo,
      });
      const wrappedPosition = WrappedPosition.wrapInstance({
        metaPosition,
        rootPortfolio: wrappedPortfolio,
        chainId,
      });
      if (wrappedPortfolio) {
        wrappedPortfolio.connectPosition(wrappedPosition);
      }
    }
    // connect order
    const orderList = portfolio.orders;
    if (orderList && orderList.size > 0) {
      orderList.forEach((order) => {
        const metaOrder = transformToMetaOrder({
          userAddr,
          instrumentAddr,
          portfolio: portfolio,
          order,
          blockInfo,
        });
        const wrappedOrder = WrappedOrder.wrapInstance({ metaOrder, rootPortfolio: wrappedPortfolio });
        if (wrappedPortfolio) {
          wrappedPortfolio.connectOrder(wrappedOrder);
        }
      });
    }
    // connect range
    const rangeList = portfolio.ranges;
    if (rangeList && rangeList.size > 0) {
      rangeList.forEach((range) => {
        const metaRange = transformToMetaRange({
          userAddr,
          instrumentAddr,
          portfolio: portfolio,
          range,
          blockInfo,
        });
        const wrappedRange = WrappedRange.wrapInstance({ metaRange, rootPortfolio: wrappedPortfolio });
        if (wrappedPortfolio) {
          wrappedPortfolio.connectRange(wrappedRange);
        }
      });
    }
  }
}
