import _ from 'lodash';
import { useCallback, useMemo } from 'react';

import { CHAIN_ID } from '@/constants/chain';
import { WrappedPair } from '@/entities/WrappedPair';
import { saveChainPairFavorite } from '@/features/pair/actions';
import { useChainPairFavorites, useDisplayPairList } from '@/features/pair/hook';
import { IFavorites, IMarketPair } from '@/types/pair';

import { useMarketList } from '@/features/market/hooks';
import { useAppDispatch } from '.';

export function useFavorites(chainId: number | undefined): IFavorites {
  const chainPairFavorites = useChainPairFavorites();
  return useMemo(
    () =>
      !!chainId
        ? _.get(chainPairFavorites, [chainId || ''], {} as IFavorites)
        : _.merge({}, ..._.values(chainPairFavorites)),
    [chainId, chainPairFavorites],
  );
}

export function useFavorite(
  chainId: number | undefined,
  instrumentAddr: string | undefined,
  expiry: string | undefined,
): boolean {
  const favorites = useFavorites(chainId);
  return useMemo(
    () => _.get(favorites, [`${instrumentAddr}-${expiry}-${chainId}`]),
    [favorites, instrumentAddr, expiry, chainId],
  );
}

export function useSaveFavorite(
  chainId: number | undefined,
): (instrumentAddr: string, expiry: string, value: boolean) => void {
  const dispatch = useAppDispatch();
  return useCallback(
    (instrumentAddr: string, expiry: string, value: boolean) => {
      chainId &&
        dispatch(
          saveChainPairFavorite({
            chainId,
            key: `${instrumentAddr}-${expiry}-${chainId}`,
            value,
          }),
        );
    },
    [chainId, dispatch],
  );
}

export function useFavPairs(chainId: CHAIN_ID | undefined): WrappedPair[] {
  const pairs = useDisplayPairList(chainId);
  const favorites = useFavorites(chainId);
  return useMemo(() => {
    return pairs.filter((p) => _.get(favorites, [`${p?.rootInstrument.instrumentAddr}-${p.expiry}-${p.chainId}`]));
  }, [favorites, pairs]);
}
export function useFavMarketPairs(chainIds: CHAIN_ID[] | undefined): IMarketPair[] | undefined {
  const { marketPairList } = useMarketList(chainIds);
  const favorites = useFavorites(undefined);
  return useMemo(() => {
    return marketPairList?.filter((p) => _.get(favorites, [`${p?.instrumentAddress}-${p.expiry}-${p.chainId}`]));
  }, [favorites, marketPairList]);
}
