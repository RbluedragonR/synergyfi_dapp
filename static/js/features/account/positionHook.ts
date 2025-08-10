import _ from 'lodash';
import { useEffect, useMemo } from 'react';

import { FETCHING_STATUS } from '@/constants';
import { CHAIN_ID } from '@/constants/chain';
import { WrappedPortfolio } from '@/entities/WrappedPortfolio';
import { WrappedPosition } from '@/entities/WrappedPosition';
import { useAppSelector } from '@/hooks';
import { IMetaPosition } from '@/types/account';

import { useWrappedPair } from '../pair/hook';
import { useMarketFormStateStatus } from '../trade/hooks';
import { useWrappedPortfolio, useWrappedPortfolioMap } from './portfolioHook';
import { selectMetaPosition, selectMetaPositionByPairId, selectPositionMap } from './slice';

//#region  redux meta position selector

export function useMetaPosition(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
  positionId: string | undefined,
): IMetaPosition | undefined {
  const metaPosition = useAppSelector(selectMetaPosition(chainId, userAddr, positionId));
  return metaPosition;
}

export function useIsWrappingPosition(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
  pairId?: string,
): boolean {
  const metaPositionMap = useMetaPositionMap(chainId, userAddr);
  const metaPositionPairMap = useMetaPositionByPairId(chainId, userAddr, pairId);
  const metaPositons = useMemo(() => {
    return pairId ? metaPositionPairMap : metaPositionMap;
  }, [metaPositionMap, metaPositionPairMap, pairId]);
  const instances = WrappedPosition.getInstanceMap(chainId);
  return useMemo(() => {
    if (!chainId || !userAddr) return false;

    return Object.keys(metaPositons || {}).length > 0 && Object.keys(instances || {}).length === 0;
  }, [chainId, userAddr, metaPositons, instances]);
}

export function useMetaPositionByPairId(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
  pairId: string | undefined,
): IMetaPosition | undefined {
  const metaPosition = useAppSelector(selectMetaPositionByPairId(chainId, userAddr, pairId));
  return metaPosition;
}

export function useMetaPositionMap(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
): { [positionId: string]: IMetaPosition } {
  const chainMetaPosition = useAppSelector(selectPositionMap(chainId, userAddr));
  return chainMetaPosition;
}

//#endregion ------------------ redux meta position selector

function useBlendWrappedPosition({
  metaPosition,
  wrappedPortfolio,
  chainId,
  userAddr,
}: {
  metaPosition: IMetaPosition | undefined;
  wrappedPortfolio: WrappedPortfolio | undefined;
  chainId: CHAIN_ID | undefined;
  userAddr: string | undefined;
}): WrappedPosition | undefined {
  const marketFormStatus = useMarketFormStateStatus(chainId);
  return useMemo(() => {
    if (!chainId || !userAddr || !wrappedPortfolio) return undefined;
    const origin = metaPosition;
    if (origin) {
      const wrappedPosition = WrappedPosition.getInstance(origin.id, chainId);
      if (marketFormStatus !== FETCHING_STATUS.FETCHING) {
        if (!wrappedPosition) {
          const instance = WrappedPosition.wrapInstance({
            metaPosition: origin,
            rootPortfolio: wrappedPortfolio,
            chainId,
          });
          wrappedPortfolio.connectPosition(instance);
          return instance;
        } else {
          wrappedPosition.fillField(origin);
        }
      }
      return wrappedPosition;
    }
    return undefined;
  }, [chainId, metaPosition, userAddr, wrappedPortfolio, marketFormStatus]);
}

/**
 * get wrapped position by positionId
 * @param chainId
 * @param userAddr
 * @param portfolioId
 * @param positionId
 * @returns
 */
export function useWrappedPositionById(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
  portfolioId: string | undefined,
  positionId: string | undefined,
): WrappedPosition | undefined {
  const metaPosition = useMetaPosition(chainId, userAddr, positionId);
  const wrappedPortfolio = useWrappedPortfolio(chainId, userAddr, portfolioId);

  return useBlendWrappedPosition({ metaPosition, wrappedPortfolio, chainId, userAddr });
}

/**
 * get wrapped position by pairId
 * @param chainId
 * @param userAddr
 * @param pairId
 * @returns
 */
export function useWrappedPosition(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
  pairId: string | undefined,
): WrappedPosition | undefined {
  const metaPosition = useMetaPositionByPairId(chainId, userAddr, pairId);
  const wrappedPortfolio = useWrappedPortfolio(chainId, userAddr, userAddr && pairId ? `${userAddr}-${pairId}` : '');
  const wrappedPosition = useBlendWrappedPosition({ metaPosition, wrappedPortfolio, chainId, userAddr });
  useEffect(() => {
    // remove position from portfolio if metaPosition is undefined
    if (!metaPosition && wrappedPortfolio && userAddr && pairId) {
      wrappedPortfolio.removePosition(`${userAddr}-${pairId}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metaPosition, pairId, userAddr, wrappedPortfolio]);

  return wrappedPosition;
}

/**
 * get wrapped main position by pairId
 * @param chainId
 * @param userAddr
 * @param pairId
 * @returns
 */
export function useMainPosition(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
  pairId: string | undefined,
): WrappedPosition | undefined {
  const mainPosition = useWrappedPosition(chainId, userAddr, pairId);
  const wrappedPair = useWrappedPair(chainId, pairId);
  return useMemo(() => {
    const hasWrappedPosition = WrappedPosition.hasAnyInstance(chainId);
    if (!mainPosition && userAddr && wrappedPair && hasWrappedPosition) {
      return WrappedPosition.fromEmptyWrappedPosition(wrappedPair, userAddr);
    }

    return mainPosition;
  }, [chainId, mainPosition, userAddr, wrappedPair]);
}

/**
 * get wrapped position list
 * @param chainId
 * @param userAddr
 * @returns
 */
export function usePositionListByUser(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
  isShowNormalPair = true,
): WrappedPosition[] | undefined {
  const metaPositionMap = useMetaPositionMap(chainId, userAddr);

  const wrappedPortfolioMap = useWrappedPortfolioMap(chainId, userAddr);
  const wrappedPositionList = useMemo(() => {
    if (!chainId || !userAddr || !wrappedPortfolioMap || !metaPositionMap) return undefined;
    return _.reduce(
      metaPositionMap,
      (res: WrappedPosition[], metaPosition) => {
        let wrappedPosition = WrappedPosition.getInstance(metaPosition.id, chainId);
        const rootPortfolio = wrappedPortfolioMap[metaPosition.portfolioId];
        if (rootPortfolio?.rootPair) {
          if (!wrappedPosition) {
            wrappedPosition = WrappedPosition.wrapInstance({
              metaPosition: metaPosition,
              rootPortfolio: rootPortfolio,
              chainId,
            });
            rootPortfolio.connectPosition(wrappedPosition);
          } else {
            wrappedPosition.fillField(metaPosition);
          }
        }

        if (wrappedPosition && wrappedPosition.hasPosition) {
          if (!isShowNormalPair || wrappedPosition.rootPair.isNormalPair) {
            res.push(wrappedPosition);
          }
        }

        return res;
      },
      [],
    );
  }, [chainId, isShowNormalPair, metaPositionMap, userAddr, wrappedPortfolioMap]);
  return wrappedPositionList;
}
