import { PERP_EXPIRY } from '@synfutures/sdks-perp';
import _ from 'lodash';
import { useEffect, useMemo } from 'react';

import { CHAIN_ID } from '@/constants/chain';
import { WrappedPortfolio } from '@/entities/WrappedPortfolio';
import { WrappedRange } from '@/entities/WrappedRange';
import { useAppSelector } from '@/hooks';
import { IMetaRange } from '@/types/account';

import { selectCurrentRangeId } from '../earn/slice';
import { useWrappedPortfolio, useWrappedPortfolioByPairId, useWrappedPortfolioMap } from './portfolioHook';
import { selectMetaRange, selectMetaRangeByPairId, selectRangeMap } from './slice';

//#region  redux meta range selector

export function useMetaRangeMap(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
): { [rangeId: string]: IMetaRange } {
  const metaRangeMap = useAppSelector(selectRangeMap(chainId, userAddr));

  return metaRangeMap;
}

export function useMetaRange(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
  rangeId: string | undefined,
): IMetaRange | undefined {
  const metaRange = useAppSelector(selectMetaRange(chainId, userAddr, rangeId));

  return metaRange;
}

export function useMetaRangeByPairId(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
  pairId: string | undefined,
): { [rangeId: string]: IMetaRange } | undefined {
  const metaRangeMap = useAppSelector(selectMetaRangeByPairId(chainId, userAddr, pairId));
  return useMemo(() => metaRangeMap, [metaRangeMap]);
}

export function useIsWrappingRange(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
  pairId?: string,
): boolean {
  const metaRangeMap = useMetaRangeMap(chainId, userAddr);
  const metaRangePairMap = useMetaRangeByPairId(chainId, userAddr, pairId);
  const metaRanges = useMemo(() => {
    if (pairId) return metaRangePairMap;
    return metaRangeMap;
  }, [metaRangeMap, metaRangePairMap, pairId]);
  const instances = WrappedRange.getInstanceMap(chainId);
  return useMemo(() => {
    if (!chainId || !userAddr) return false;

    return Object.keys(metaRanges || {}).length > 0 && Object.keys(instances || {}).length === 0;
  }, [chainId, userAddr, metaRanges, instances]);
}

//#endregion ------------------ redux meta range selector

function useBlendWrappedRange({
  metaRange,
  chainId,
  rootPortfolio,
}: {
  metaRange: IMetaRange | undefined;
  chainId: CHAIN_ID | undefined;
  rootPortfolio: WrappedPortfolio | undefined;
}): WrappedRange | undefined {
  return useMemo(() => {
    if (!chainId || !rootPortfolio) return undefined;
    const origin = metaRange;
    if (origin) {
      const wrappedRange = WrappedRange.getInstance(origin.id, chainId);
      if (!wrappedRange) {
        const instance = WrappedRange.wrapInstance({ metaRange: origin, rootPortfolio });
        rootPortfolio.connectRange(instance);
        return instance;
      } else {
        wrappedRange.fillField(origin);
      }
      return wrappedRange;
    }
    return undefined;
  }, [chainId, metaRange, rootPortfolio]);
}

/**
 * get wrapped range by range id
 * @param chainId
 * @param userAddr
 * @param rangeId
 * @returns
 */
export function useWrappedRange(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
  rangeId: string | undefined,
): WrappedRange | undefined {
  const metaRange = useMetaRange(chainId, userAddr, rangeId);
  const rootPortfolio = useWrappedPortfolio(chainId, userAddr, metaRange?.portfolioId);
  useEffect(() => {
    // remove range from portfolio if metaRange is undefined
    if (!metaRange && rootPortfolio && userAddr && rangeId) {
      rootPortfolio.removeRange(rangeId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metaRange, rangeId, userAddr, rootPortfolio]);
  return useBlendWrappedRange({ metaRange, chainId, rootPortfolio });
}

export function useCurrentRange(chainId: number | undefined, userAddr: string | undefined): WrappedRange | undefined {
  const currentRangeId = useAppSelector(selectCurrentRangeId(chainId));
  return useWrappedRange(chainId, userAddr, currentRangeId);
}

/***
 * get wrapped order list by pair id
 */
export function useWrappedRangeList(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
  pairId: string | undefined,
): WrappedRange[] | undefined {
  const metaRangeMap = useMetaRangeByPairId(chainId, userAddr, pairId);
  const rootPortfolio = useWrappedPortfolioByPairId(chainId, userAddr, pairId);
  return useMemo(() => {
    if (!chainId || !rootPortfolio || !metaRangeMap) return undefined;

    return _.orderBy(
      _.reduce(
        metaRangeMap,
        (acc: WrappedRange[], metaRange: IMetaRange) => {
          const wrappedRange = WrappedRange.getInstance(metaRange.id, chainId);
          if (!wrappedRange) {
            const newWrappedRange = WrappedRange.wrapInstance({ metaRange, rootPortfolio });
            rootPortfolio.connectRange(newWrappedRange);
            acc.push(newWrappedRange);
          } else {
            acc.push(wrappedRange);
          }
          return acc;
        },
        [],
      ),
      [(o) => o.wrapAttribute('valueLocked').toNumber()],
      ['desc'],
    );
  }, [chainId, metaRangeMap, rootPortfolio]);
}

export function useWrappedRangeListByUser(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
  isShowNormalPair = true,
): WrappedRange[] | undefined {
  const metaRangeMap = useMetaRangeMap(chainId, userAddr);
  const rootPortfolioMap = useWrappedPortfolioMap(chainId, userAddr);
  return useMemo(() => {
    if (!chainId || !rootPortfolioMap || !metaRangeMap) return undefined;

    return _.orderBy(
      _.reduce(
        metaRangeMap,
        (acc: WrappedRange[], metaRange: IMetaRange) => {
          const wrappedRange = WrappedRange.getInstance(metaRange.id, chainId);
          const rootPortfolio = rootPortfolioMap[metaRange.portfolioId];

          function pushRange(range: WrappedRange) {
            if (!isShowNormalPair || range.rootPair.isNormalPair) {
              acc.push(range);
            }
          }

          if (rootPortfolio) {
            if (!wrappedRange) {
              const newWrappedRange = WrappedRange.wrapInstance({ metaRange, rootPortfolio: rootPortfolio });
              rootPortfolio.connectRange(newWrappedRange);
              pushRange(newWrappedRange);
            } else {
              pushRange(wrappedRange);
            }
          }
          return acc;
        },
        [],
      ),
      [
        (o) => {
          return o.rootInstrument.displayBaseToken.symbol;
        },
        (o) => {
          return o.rootPair.expiry === PERP_EXPIRY ? 0 : o.rootPair.expiry;
        },
        (o) => o.wrapAttribute('valueLocked').toNumber(),
      ],
      ['asc', 'asc', 'desc'],
    );
  }, [chainId, isShowNormalPair, metaRangeMap, rootPortfolioMap]);
}
