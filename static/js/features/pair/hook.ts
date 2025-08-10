import { InstrumentCondition, MarketType, PEARL_SPACING, Side, Status } from '@synfutures/sdks-perp';
// import BN from 'bignumber.js';
import _ from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useMediaQueryDevice } from '@/components/MediaQuery';
import { getOracleConfig } from '@/configs';
import { CHAIN_ID } from '@/constants/chain';
import { MMR_RATIO, PAIR_RATIO_BASE } from '@/constants/global';
import { WrappedBigNumber, WrappedBigNumberLike } from '@/entities/WrappedBigNumber';
import { WrappedPair } from '@/entities/WrappedPair';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { Context } from '@derivation-tech/context';

import { CreativePair, IChainPairsFavorites, IMetaPair, IOracleInfo } from '@/types/pair';
import { TokenInfo } from '@/types/token';
import { getChainIdByChainShortName } from '@/utils/chain';
import { getSavedPairChosen } from '@/utils/localstorage';
import { formatNumber, inputNumChecker } from '@/utils/numberUtil';
import { getAdjustTradeSide, getDisplayExpiry, isDisableExpiredPair, isPairExpiredToday } from '@/utils/pairs';

import { getPairId } from '@/utils/transform/transformId';
import { useAsyncEffect } from 'ahooks';
import { useBackendChainConfig } from '../config/hook';
import {
  useMarketPairInfo,
  useMarketWrappedInstrument,
  useWrappedInstrument,
  useWrappedInstrumentMap,
} from '../futures/hooks';
import { useCurrentMarketType } from '../global/hooks';
import { useTokenPrices } from '../global/query';
import {
  useCreativePairList,
  useCurrentMarketPairFromUrl,
  useDefaultPairSymbolFromUrlOrFallbackLocalOrApi,
} from '../market/hooks';
import { getLimitAlignPriceWad } from '../trade/actions';
import { useSDK } from '../web3/hook';
import { selectChainMetaPair, selectChainPairFavorites, selectMetaPair } from './pairSlice';
// import { useTokenPriceInfoMap } from '../global/hooks';

export function useMetaPairMap(chainId: number | undefined): Record<string, IMetaPair> {
  const pairs = useAppSelector(selectChainMetaPair(chainId));
  return useMemo(() => pairs || {}, [pairs]);
}

export function useMetaPair(chainId: CHAIN_ID | undefined, pairId: string | undefined): IMetaPair | undefined {
  const pair = useAppSelector(selectMetaPair(chainId, pairId));
  return pair;
}

export function useWrappedPairMap(chainId: CHAIN_ID | undefined): { [pairId: string]: WrappedPair } {
  const originPairMap = useMetaPairMap(chainId);

  const futuresCoreMap = useWrappedInstrumentMap(chainId);
  const { data: priceMap } = useTokenPrices({ chainId });

  return useMemo(() => {
    if (!chainId || !futuresCoreMap) return {};
    return _.mapValues(originPairMap, (originPair) => {
      let pair = WrappedPair.getInstance(originPair.id, chainId);
      if (futuresCoreMap[originPair.instrumentId]) {
        if (!pair) {
          pair = WrappedPair.wrapInstance({
            metaPair: originPair,
            rootInstrument: futuresCoreMap[originPair.instrumentId],
          });
          // TODO uncomment this later
          // pair && futuresCoreMap[originPair.instrumentId].setPair(pair.expiry, pair);
        } else {
          pair.fillField(originPair);
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return pair!;
    });
    // must include pricemap
  }, [chainId, originPairMap, futuresCoreMap, priceMap]);
}

export function useWrappedPairList(chainId: CHAIN_ID | undefined): WrappedPair[] {
  const pairMap = useWrappedPairMap(chainId);
  return useMemo(() => {
    return Object.values(pairMap || {});
  }, [pairMap]);
}

export function useDisplayPairList(chainId: CHAIN_ID | undefined, isFilterAbnormalPair = true): WrappedPair[] {
  const pairList = useWrappedPairList(chainId);
  // const tokenPriceMap = useTokenPriceInfoMap(chainId);

  const displayList = useMemo(() => {
    return pairList.filter((pair) => {
      return isFilterAbnormalPair
        ? pair?.rootInstrument?.condition === InstrumentCondition.NORMAL && pair?.status !== Status.SETTLED
        : true;
    });
  }, [isFilterAbnormalPair, pairList]);

  return useMemo(() => displayList.filter((p) => !!p), [displayList]);
}
export function useDisplayPairMargins(chainId: CHAIN_ID | undefined): string[] {
  const pairs = useDisplayPairList(chainId);
  return useMemo(() => {
    const symbols = pairs.map((p) => p.rootInstrument?.marginToken.symbol);
    return _.uniq(symbols) as string[];
  }, [pairs]);
}

// export function useChainPairStats(chainId: CHAIN_ID | undefined): ListStatus<WrappedPairData> {
//   const chainPairStats = useAppSelector(selectChainPairStats);

//   return useMemo(() => {
//     if (chainId) {
//       const pairStats = _.get(chainPairStats, [chainId]);
//       if (pairStats) return pairStats;
//     }

//     return {} as ListStatus<WrappedPairData>;
//   }, [chainId, chainPairStats]);
// }
// export function usePairStatsMap(chainId: CHAIN_ID | undefined): { [pairId: string]: WrappedPairData } {
//   const chainPairStats = useChainPairStats(chainId);
//   return useMemo(() => _.get(chainPairStats, ['list']), [chainPairStats]);
// }
// export function usePairStats(pairId: string | undefined, chainId: CHAIN_ID | undefined): WrappedPairData | undefined {
//   // const chainPairStats = useChainPairStats();
//   const singlePairStats = useAppSelector(selectSinglePairStats(chainId, pairId));

//   const pair = useWrappedPair(chainId, pairId);
//   // const singlePairStats = useMemo(() => _.get(chainPairStats, ['list', pairId || '']), [chainPairStats, pairId]);
//   useEffect(() => {
//     pair && singlePairStats && pair.setPairStats(new WrappedPairData(singlePairStats));
//   }, [pair, singlePairStats]);

//   return singlePairStats;
// }

export function useWrappedPair(chainId: CHAIN_ID | undefined, pairId: string | undefined): WrappedPair | undefined {
  const metaPair = useMetaPair(chainId, pairId);
  const wrappedFutures = useWrappedInstrument(chainId, metaPair?.instrumentId);
  const { data: priceMap } = useTokenPrices({ chainId });
  const pair = useMemo(() => {
    if (metaPair && wrappedFutures) {
      let pair = WrappedPair.getInstance(metaPair.id, chainId);
      if (!pair) pair = WrappedPair.wrapInstance({ metaPair, rootInstrument: wrappedFutures });
      else {
        pair.fillField(metaPair);
      }
      return pair;
    }
    return undefined;
    // must include priceMap
  }, [chainId, metaPair, wrappedFutures, priceMap]);
  return pair;
}

export function useCurrentPairFromUrl(
  chainId: number | undefined,
  isFilterAbnormalPair = true,
): WrappedPair | undefined {
  const { pairSymbol, chainShortName } = useParams();
  const chainIdFromUrl = useMemo(() => {
    return chainShortName ? getChainIdByChainShortName(chainShortName) : undefined;
  }, [chainShortName]);
  const symbolInStorage = useDefaultPairSymbolFromUrlOrFallbackLocalOrApi(chainId);
  const pairList = useDisplayPairList(chainId, isFilterAbnormalPair);
  const dormantPairList = useDormantPair(chainId);
  const pair = useMemo(() => {
    if (chainIdFromUrl !== chainId) return undefined;

    const symbol = pairSymbol || symbolInStorage;
    return [...pairList, ...dormantPairList].find((wp) => wp.symbol === symbol);
  }, [chainId, chainIdFromUrl, dormantPairList, pairList, pairSymbol, symbolInStorage]);
  // useEffect(() => {
  //   pair && console.log('🚩useCurrentPairFromUrl----> current pair', pairSymbol, pair);
  // }, [pairSymbol]);

  const currentPairFromApi = useCurrentWrappedPairFromApi(chainId);

  const currPairInfo = useMarketPairInfo(chainId, pair?.instrumentAddr, pair?.expiry);

  return useMemo(() => {
    const current = currentPairFromApi || pair;

    currPairInfo && current?.setPairStats(currPairInfo);
    return current;
  }, [currPairInfo, currentPairFromApi, pair]);
}

export function useCurrentWrappedPairFromApi(chainId: number | undefined): WrappedPair | undefined {
  const { pairSymbol, chainShortName } = useParams();
  const pairFromApi = useCurrentMarketPairFromUrl(chainId);
  const chainIdFromUrl = useMemo(() => {
    return chainShortName ? getChainIdByChainShortName(chainShortName) : undefined;
  }, [chainShortName]);
  const symbolInStorage = useDefaultPairSymbolFromUrlOrFallbackLocalOrApi(chainId);

  const dormantPairList = useDormantPair(chainId);

  const marketWrappedInstrument = useMarketWrappedInstrument(
    chainIdFromUrl || undefined,
    pairFromApi?.instrumentAddress,
  );

  const currentPair = useMemo(() => {
    if (marketWrappedInstrument?.pairMap) {
      const pairs = Object.values(marketWrappedInstrument?.pairMap);
      const symbol = pairSymbol || symbolInStorage;
      return [...pairs, ...dormantPairList].find((pair) => pair.symbol === symbol);
    }
  }, [dormantPairList, marketWrappedInstrument?.pairMap, pairSymbol, symbolInStorage]);

  return currentPair;
}

export function useCurrentPairByDevice(chainId: number | undefined): WrappedPair | undefined {
  const { isMobile } = useMediaQueryDevice();
  const currentPairFromChain = useCurrentPairFromUrl(chainId);
  const currentPairFromUrl = useCurrentPairFromUrl(chainId);
  const pair = useMemo(
    () => (isMobile ? currentPairFromChain : currentPairFromUrl),
    [currentPairFromChain, currentPairFromUrl, isMobile],
  );
  return pair;
}
export function useCurrentNewPairFromUrl(chainId: number | undefined): CreativePair | undefined {
  const { pairSymbol } = useParams();
  const userAddr = useUserAddr();
  const marketType = useCurrentMarketType();
  const symbolInStorage = marketType ? getSavedPairChosen(userAddr, chainId, marketType) : undefined;
  const newPairs = useCreativePairList(chainId);
  const pair = useMemo(
    () =>
      pairSymbol
        ? newPairs.find((wp) => wp.symbol === pairSymbol)
        : newPairs.find((wp) => wp.symbol === symbolInStorage),
    [newPairs, pairSymbol, symbolInStorage],
  );

  return pair;
}
export function useCombinedPairFromUrl(
  chainId: number | undefined,
  isFilterAbnormalPair = true,
  tradableOnly = false,
): WrappedPair | CreativePair | undefined {
  const pair = usePairFromUrl(chainId, isFilterAbnormalPair);
  const newPair = useCurrentNewPairFromUrl(chainId);
  return useMemo(() => {
    return tradableOnly ? pair : pair || newPair;
  }, [pair, tradableOnly, newPair]);
}
export function usePairFromUrl(chainId: number | undefined, isFilterAbnormalPair = true): WrappedPair | undefined {
  const { isMobile } = useMediaQueryDevice();
  const pair = useCurrentPairFromUrl(chainId, isFilterAbnormalPair);
  return useMemo(() => {
    if (pair && !pair.isNormalPair) {
      return undefined;
    }
    return pair;
  }, [isMobile, pair]);
}

export function useChainPairFavorites(): IChainPairsFavorites {
  return useAppSelector(selectChainPairFavorites);
}

export function useDormantPair(chainId: CHAIN_ID | undefined): WrappedPair[] {
  const wrappedPairList = useWrappedPairList(chainId);

  return useMemo(() => {
    const unInitiatedPairs = wrappedPairList.filter(
      (p) =>
        p.rootInstrument.condition === InstrumentCondition.NORMAL &&
        p.liquidity.eq(0) &&
        p?.status === Status.DORMANT &&
        // filter expired pair
        !isDisableExpiredPair(p) &&
        !isPairExpiredToday(p.expiry),
    );
    return unInitiatedPairs;
  }, [wrappedPairList]);
}

export function usePairInfo(pair: WrappedPair | undefined):
  | {
      displayBaseToken: TokenInfo;
      displayQuoteToken: TokenInfo;
      marginToken: TokenInfo;
      expiry: string;
      minQuoteTradeSize: WrappedBigNumber;
      imrRate: WrappedBigNumber;
      mmrRate: WrappedBigNumber;
      tip: WrappedBigNumber;
      tradingFeeRatio: WrappedBigNumber;
      protocolFeeRatio: WrappedBigNumber;
      oracleInfo: IOracleInfo;
    }
  | undefined {
  const oracleConfigConfig = useMemo(() => {
    return getOracleConfig();
  }, []);
  const pairInfo = useMemo(() => {
    if (pair) {
      const displayBaseToken = pair.rootInstrument.displayBaseToken;
      const displayQuoteToken = pair.rootInstrument.displayQuoteToken;
      const marginToken = pair.rootInstrument.marginToken;
      const expiry = getDisplayExpiry(pair.expiry);
      const imrRate = WrappedBigNumber.from(pair.rootInstrument.setting.initialMarginRatio).div(PAIR_RATIO_BASE);
      const minQuoteTradeSize = WrappedBigNumber.from(pair.rootInstrument.setting.quoteParam.minMarginAmount).div(
        imrRate,
      );
      const mmrRate = WrappedBigNumber.from(pair.rootInstrument.setting.maintenanceMarginRatio).div(PAIR_RATIO_BASE);
      const tip = WrappedBigNumber.from(pair.rootInstrument.setting.quoteParam.tip);
      const tradingFeeRatio = WrappedBigNumber.from(pair.rootInstrument.setting.quoteParam.tradingFeeRatio).div(
        PAIR_RATIO_BASE,
      );
      const protocolFeeRatio = WrappedBigNumber.from(pair.rootInstrument.setting.quoteParam.protocolFeeRatio).div(
        PAIR_RATIO_BASE,
      );
      const oracleInfo = oracleConfigConfig[pair.rootInstrument.marketType];
      return {
        displayBaseToken,
        displayQuoteToken,
        marginToken,
        expiry,
        minQuoteTradeSize,
        imrRate,
        mmrRate,
        tip,
        tradingFeeRatio,
        protocolFeeRatio,
        oracleInfo,
      };
    }
  }, [oracleConfigConfig, pair]);
  return pairInfo;
}
export function useGetAlignedPrice(
  sdkContext: Context | undefined,
  pair: WrappedPair | undefined,
): (
  price: WrappedBigNumberLike,
  side: Side,
) => Promise<
  | {
      tick: number;
      originPrice: WrappedBigNumber;
      adjustPrice: WrappedBigNumber;
    }
  | undefined
> {
  const dispatch = useAppDispatch();
  const getAlignPriceWad = useCallback(
    async (
      price: WrappedBigNumberLike,
      side: Side,
    ): Promise<
      | {
          tick: number;
          originPrice: WrappedBigNumber;
          adjustPrice: WrappedBigNumber;
        }
      | undefined
    > => {
      if (sdkContext) {
        try {
          if (pair) {
            const originPrice = WrappedBigNumber.from(price || 0);
            const adjustedSide = getAdjustTradeSide(side, pair.isInverse);
            const result = await dispatch(
              getLimitAlignPriceWad({
                sdkContext,
                isInverse: pair?.isInverse || false,
                limitPrice: originPrice,
                instrumentAddr: pair.instrumentAddr,
              }),
            ).unwrap();
            if (result) {
              if (
                inputNumChecker(WrappedBigNumber.from(price).stringValue, pair.priceDecimal) !==
                inputNumChecker(result.adjustPrice.stringValue, pair.priceDecimal)
              ) {
                let tick = result?.tick;
                let adjustPrice = result?.adjustPrice;
                // can not place order on current amm tick
                if (adjustedSide === Side.LONG && result?.tick >= pair.tick) {
                  tick = tick - PEARL_SPACING;
                  const tickPrice = await sdkContext?.perp?.calc?.getWadAtTick(pair.instrumentAddr, tick);
                  adjustPrice = WrappedBigNumber.from(tickPrice);
                }
                if (adjustedSide === Side.SHORT && result?.tick <= pair.tick) {
                  tick = tick + PEARL_SPACING;
                  const tickPrice = await sdkContext?.perp?.calc?.getWadAtTick(pair.instrumentAddr, tick);
                  adjustPrice = WrappedBigNumber.from(tickPrice);
                }
                return { ...result, tick, adjustPrice };
              }
              return { ...result, adjustPrice: originPrice };
            }
          }
          return undefined;
        } catch (e) {
          console.log('🚀 ~ file: index.tsx:76 ~ e:', e);
          return undefined;
        }
      }
    },
    [dispatch, pair, sdkContext],
  );

  return getAlignPriceWad;
}
export function usePairAdjustedRange(
  pair: WrappedPair | undefined,
  tradeSide: Side,
  sdkContext: Context | undefined,
  isTurnOnCrossMarket?: boolean,
): (WrappedBigNumber | undefined)[] {
  const [upperPrice, setUpperPrice] = useState<WrappedBigNumber | undefined>(undefined);
  const [lowerPrice, setLowerPrice] = useState<WrappedBigNumber | undefined>(undefined);
  const getUpperLowerPrice = useCallback(async () => {
    if (pair && sdkContext) {
      try {
        const { lowerTick, upperTick } = pair.placeOrderLimit;
        const markPrice = pair.wrapAttribute('markPrice');
        const { lowerPrice: lowerLimit, upperPrice: upperLimit } = await sdkContext?.perp?.calc?.getWadAtTicks(
          pair.instrumentAddr,
          lowerTick,
          upperTick,
        );

        // mmr limit for cross market
        const mmrRatio = pair?.rootInstrument.setting.maintenanceMarginRatio / PAIR_RATIO_BASE;

        let upperMaxLimit = WrappedBigNumber.from(pair.isInverse ? lowerLimit : upperLimit);
        if (isTurnOnCrossMarket && tradeSide === Side.LONG) {
          upperMaxLimit = markPrice.mul(1 + mmrRatio);
        }

        if (upperMaxLimit) {
          setUpperPrice(
            WrappedBigNumber.from(
              formatNumber(
                upperMaxLimit.stringValue,
                pair.priceDecimal,
                false,
                // pair.isInverse ? BN.ROUND_CEIL : BN.ROUND_DOWN,
              ),
            ),
          );
        }

        let lowerMaxLimit = WrappedBigNumber.from(pair.isInverse ? upperLimit : lowerLimit);
        if (isTurnOnCrossMarket && tradeSide === Side.SHORT) {
          lowerMaxLimit = markPrice.mul(1 - mmrRatio);
        }

        if (lowerMaxLimit) {
          setLowerPrice(
            WrappedBigNumber.from(
              formatNumber(
                lowerMaxLimit.stringValue,
                pair.priceDecimal,
                false,
                // pair.isInverse ? BN.ROUND_DOWN : BN.ROUND_CEIL,
                // BN.ROUND_CEIL,
              ),
            ),
          );
        }
      } catch (e) {}
    }
  }, [isTurnOnCrossMarket, pair, sdkContext, tradeSide]);

  useAsyncEffect(async () => {
    await getUpperLowerPrice();
  }, [pair?.fairPrice._hex, pair?.priceDecimal, pair?.markPrice._hex, isTurnOnCrossMarket, tradeSide]);
  return useMemo(() => {
    if (pair) {
      return [lowerPrice, upperPrice];
    }

    return [];
  }, [pair, lowerPrice, upperPrice]);
}
export function useGetAlignedFairPrice(
  pair: WrappedPair | undefined,
): (side: Side) => Promise<WrappedBigNumber | undefined> {
  const sdk = useSDK(pair?.chainId);
  const getAlignedFairPrice = useCallback(
    async (side: Side) => {
      if (pair?.fairPrice && sdk) {
        let newTick = Math.floor(pair?.tick / PEARL_SPACING) * PEARL_SPACING;
        if (pair?.isInverse) {
          if (side == Side.LONG) {
            newTick = newTick + PEARL_SPACING;
          }
          if (side === Side.SHORT) {
            if (newTick === pair?.tick) {
              newTick = newTick - PEARL_SPACING;
            }
          }
        } else {
          if (side == Side.LONG) {
            if (newTick === pair?.tick) {
              newTick = newTick - PEARL_SPACING;
            }
          }
          if (side === Side.SHORT) {
            newTick = newTick + PEARL_SPACING;
          }
        }
        const priceWad = await sdk?.perp?.calc?.getWadAtTick(pair?.instrumentAddr, newTick);
        const adjustPrice = WrappedBigNumber.from(priceWad);
        if (adjustPrice) {
          return WrappedBigNumber.from(
            formatNumber(
              adjustPrice.stringValue,
              pair.priceDecimal,
              false,
              // side === Side.LONG ? BN.ROUND_DOWN : BN.ROUND_CEIL,
            ),
          );
        }
      }
    },
    [pair?.fairPrice, pair?.instrumentAddr, pair?.isInverse, pair?.priceDecimal, pair?.tick, sdk],
  );

  return getAlignedFairPrice;
}
export function usePairLimitPriceRange(
  pair: WrappedPair | undefined,
  side: Side,
  sdkContext: Context | undefined,
  isTurnOnCrossMarket?: boolean,
): [WrappedBigNumber | undefined, WrappedBigNumber | undefined] {
  const [alignedFairPrice, setAlignedFairPrice] = useState<WrappedBigNumber>();
  const getAlignedFairPrice = useGetAlignedFairPrice(pair);
  const [adjustedLowerPrice, adjustedUpperPrice] = usePairAdjustedRange(pair, side, sdkContext, isTurnOnCrossMarket);
  const alignFairPrice = useCallback(async () => {
    if (pair?.fairPrice) {
      const alignedFairPrice = await getAlignedFairPrice(side);
      alignedFairPrice && setAlignedFairPrice(alignedFairPrice);
    }
  }, [getAlignedFairPrice, pair?.fairPrice, side]);
  useEffect(() => {
    alignFairPrice();
    //  only depend on this
    // update aligned fairPrice on fairPrice change
  }, [pair?.fairPrice._hex, pair?.markPrice._hex, side]);
  return useMemo(() => {
    const adjustSide = side;
    if (adjustedLowerPrice && adjustedUpperPrice && alignedFairPrice) {
      if (adjustSide === Side.LONG) {
        return [adjustedLowerPrice, isTurnOnCrossMarket ? adjustedUpperPrice : alignedFairPrice];
      }
      return [isTurnOnCrossMarket ? adjustedLowerPrice : alignedFairPrice, adjustedUpperPrice];
    }
    return [undefined, undefined];
  }, [adjustedLowerPrice, adjustedUpperPrice, alignedFairPrice, isTurnOnCrossMarket, side]);
}
export function usePairLimitPriceRangeTicks(
  pair: WrappedPair | undefined,
  side: Side,
  sdkContext: Context | undefined,
  isTurnOnCrossMarket?: boolean,
): number[] {
  const getAlignPriceWad = useGetAlignedPrice(sdkContext, pair);
  const [lowerUpperTicks, setLowerUpperTicks] = useState<number[]>([]);
  const [lowerPrice, upperPrice] = usePairLimitPriceRange(pair, side, sdkContext, isTurnOnCrossMarket);
  const getUpperLowerTicks = useCallback(async () => {
    if (upperPrice && lowerPrice) {
      const alignedUpper = await getAlignPriceWad(upperPrice?.stringValue, side);
      const alignedLower = await getAlignPriceWad(lowerPrice?.stringValue, side);
      if (alignedLower && alignedUpper) {
        setLowerUpperTicks([
          alignedLower?.tick * (pair?.isInverse ? -1 : 1),
          alignedUpper?.tick * (pair?.isInverse ? -1 : 1),
        ]);
      }
    }
  }, [upperPrice, lowerPrice, getAlignPriceWad, side, pair?.isInverse]);
  useEffect(() => {
    getUpperLowerTicks();
  }, [getUpperLowerTicks]);
  return lowerUpperTicks;
}

export function useGetDefaultLimitPrice(
  currentPair: WrappedPair | undefined,
  side: Side,
  sdkContext: Context | undefined,
): (tradeSide?: Side) => Promise<{ tick: number; adjustPrice: WrappedBigNumber } | undefined> {
  const getAlignPriceWad = useGetAlignedPrice(sdkContext, currentPair);
  const getDefaultLimitPrice = useCallback(
    async (tradeSide?: Side): Promise<{ tick: number; adjustPrice: WrappedBigNumber } | undefined> => {
      if (currentPair?.fairPrice) {
        const adjustSide = tradeSide || side;
        const alignedPrice = await getAlignPriceWad(
          currentPair
            ?.wrapAttribute('fairPrice')
            .mul(
              1 +
                ((MMR_RATIO * currentPair.rootInstrument.metaFutures.setting.maintenanceMarginRatio) /
                  PAIR_RATIO_BASE) *
                  (adjustSide === Side.SHORT ? 1 : -1),
            ),
          tradeSide || side,
        );
        if (alignedPrice) {
          return alignedPrice;
        }
      }
    },
    [currentPair, side, getAlignPriceWad],
  );

  return getDefaultLimitPrice;
}

export function usePairDisabledForLimit(pair: WrappedPair | undefined): {
  inDisabledPairs: boolean | undefined;
  pairDisabledInLimit: boolean | undefined;
} {
  const chainId = useChainId();
  const dappConfig = useBackendChainConfig(chainId);
  const inDisabledPairs = useMemo(
    // read from contract to check if pair is disabled
    () => !!pair?.symbol && (!pair?.withinDeviationLimit || pair?.rootInstrument?.placePaused),
    [pair?.symbol, pair?.withinDeviationLimit, pair?.rootInstrument?.placePaused],
  );
  const pairDisabledInLimit = useMemo(
    () => dappConfig?.trade.isDisableLimitOrder || inDisabledPairs,
    [dappConfig?.trade.isDisableLimitOrder, inDisabledPairs],
  );

  return { inDisabledPairs, pairDisabledInLimit };
}

export function useCurrentPairBaseInfoFromUrl(
  chainId: number | undefined,
  isFilterAbnormalPair = true,
):
  | {
      id: string;
      chainId: CHAIN_ID;
      instrumentAddr: string;
      expiry: number;
      symbol: string;
      maxLeverage: number;
      rootInstrument: {
        marketType: MarketType;
        instrumentAddr: string;
        id: string;
        baseToken: TokenInfo;
        quoteToken: TokenInfo;
        isInverse: boolean;
      };
    }
  | undefined {
  const pairFromChain = useCurrentPairFromUrl(chainId, isFilterAbnormalPair);
  const pairFromApi = useCurrentMarketPairFromUrl(chainId);
  return useMemo(() => {
    if (!chainId) return;
    if (pairFromChain) {
      return pairFromChain;
    }
    if (pairFromApi)
      return {
        chainId: chainId,
        id: getPairId(pairFromApi?.instrumentAddress, pairFromApi?.expiry),
        instrumentAddr: pairFromApi?.instrumentAddress,
        expiry: pairFromApi?.expiry,
        symbol: pairFromApi?.pairSymbol,
        maxLeverage: pairFromApi?.maxLeverage,
        rootInstrument: {
          marketType: pairFromApi?.marketType,
          instrumentAddr: pairFromApi?.instrumentAddress,
          id: pairFromApi?.instrumentAddress,
          baseToken: pairFromApi?.baseToken,
          quoteToken: pairFromApi?.quoteToken,
          isInverse: pairFromApi?.isInverse,
        },
      };
  }, [chainId, pairFromApi, pairFromChain]);
}
