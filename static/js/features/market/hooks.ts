import { useCallback, useEffect, useMemo } from 'react';

import { MARKET_FILTERS } from '@/constants/market';
import { useAppDispatch, useAppSelector } from '@/hooks';
import {
  ALL_SELECTOR,
  CUSTOM_SELECTOR,
  FAV_SELECTOR,
  // ALL_SELECTOR,
  MARGIN_SELECTORS,
  // MARGIN_TYPE,
  PAIR_DATE_TYPE,
  TPairTypeForMobile,
} from '@/types/global';
import { IMarginSearchProps } from '@/types/search';

import {
  CHAIN_ID,
  DISPLAYABLE_CHAIN_ID,
  getAllDisplayableChainMarketCustomPairs,
  SUPPORTED_CHAIN_ID,
} from '@/constants/chain';
import { TVL_THRESHHOLD } from '@/constants/global';
import { QUERY_KEYS } from '@/constants/query';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useFavMarketPairs } from '@/hooks/useFavorites';
import useSocket from '@/hooks/useSocket';
import { useUserAddr } from '@/hooks/web3/useChain';
import { queryClient } from '@/pages/App';
import { CreativePair, IMarketPair, IMarketSummary } from '@/types/pair';
import { MESSAGE_TYPE, SUBSCRIBE_TYPE, UNSUBSCRIBE_TYPE } from '@/types/socket';
import { getChainIdByChainShortName } from '@/utils/chain';
import { getSavedPairChosen } from '@/utils/localstorage';
import { getMarginTypeByFeeder } from '@/utils/pairs';
import { PERP_EXPIRY } from '@synfutures/sdks-perp';
import _ from 'lodash';
import { useParams } from 'react-router-dom';
import { useConfigData } from '../config/hook';
import { useCurrentMarketType } from '../global/hooks';
import { setPartialMarginSearchProps } from './actions';
import { useFetchMarketCreativePairList, useFetchMarketPairList } from './query';

export function useMarginSearch(): {
  marginSearchProps: IMarginSearchProps;
  goToSelectorWithFilter: (
    marginSelector: MARGIN_SELECTORS,
    marginCustomSelectorId?: string,
    filter?: MARKET_FILTERS,
    search?: string,
    selectedChainIds?: number[],
  ) => void;
  resetMarginSearch: (filter?: MARKET_FILTERS) => void;
  pairTypeForMobile: TPairTypeForMobile;
} {
  const dispatch = useAppDispatch();
  const marginSearchProps = useAppSelector((state) => state.market.marginSearchProps);
  const goToSelectorWithFilter = useCallback(
    (
      marginSelector: MARGIN_SELECTORS,
      marginCustomSelectorId?: string,
      filter = MARKET_FILTERS.PERPETUAL,
      search?: string,
      selectedChainIds?: number[],
    ) => {
      dispatch(
        setPartialMarginSearchProps({
          marginSelector: marginSelector || marginSearchProps.marginSelector,
          filter: filter || marginSearchProps.filter || MARKET_FILTERS.ALL,
          marginCustomSelectorId: marginCustomSelectorId || marginSearchProps.marginCustomSelectorId || null,
          search,
          selectedChainIds: selectedChainIds !== undefined ? selectedChainIds : marginSearchProps.selectedChainIds,
        }),
      );
    },
    [dispatch, marginSearchProps],
  );
  const resetMarginSearch = useCallback(
    (filter = MARKET_FILTERS.PERPETUAL) => {
      dispatch(
        setPartialMarginSearchProps({
          // marginSelector: undefined,
          filter,
          marginSelector: ALL_SELECTOR.ALL,
          marginCustomSelectorId: null,
        }),
      );
    },
    [dispatch],
  );
  const pairTypeForMobile: TPairTypeForMobile = useMemo(() => {
    const { filter } = marginSearchProps;
    if (filter == MARKET_FILTERS.DATED) {
      return PAIR_DATE_TYPE.DATED;
    }
    if (filter == MARKET_FILTERS.PERPETUAL) {
      return PAIR_DATE_TYPE.PERPETUAL;
    }
    // if (marginSelector === ALL_SELECTOR.ALL) return undefined;
    // if (marginSelector === MARGIN_TYPE.COIN || marginSelector === MARGIN_TYPE.USD) {
    //   return marginSelector as TPairTypeForMobile;
    // }
    return undefined;
  }, [marginSearchProps]);

  return {
    goToSelectorWithFilter,
    marginSearchProps,
    resetMarginSearch,
    pairTypeForMobile,
  };
}

export function useMarketList(chainIds?: (CHAIN_ID | undefined)[], exclude?: boolean) {
  const { data: marketChainPairList, isFetched } = useFetchMarketPairList();
  const { backendChainsConfig } = useConfigData();
  const pairsToBeExcluded: string[] = useMemo(
    () =>
      _.flatMap(
        chainIds?.map((chainId) => _.get(backendChainsConfig, [chainId || ''])?.pairsToBeFilteredInMarketAndEarn),
      ),
    [backendChainsConfig, chainIds],
  );
  const marketPairList = useMemo(() => {
    return _.flatMap(
      marketChainPairList
        ?.filter((item) => SUPPORTED_CHAIN_ID.includes(Number(item.chainId)))
        ?.filter((item) => (!!chainIds?.length ? chainIds.includes(item.chainId) : true))
        .map((v) => v.pairs),
    )?.filter((item) => (exclude ? !pairsToBeExcluded?.includes(item.pairSymbol) : true));
  }, [chainIds, marketChainPairList, pairsToBeExcluded, exclude]);
  return { marketPairList, marketChainPairList, isFetched };
}

export function useFilteredTradingPairs(): IMarketPair[] | undefined {
  const {
    marginSearchProps: { marginSelector, filter, marginCustomSelectorId, search, selectedChainIds },
  } = useMarginSearch();
  const { backendChainsConfig } = useConfigData();
  const { marketPairList } = useMarketList(selectedChainIds);
  const favPairs = useFavMarketPairs(selectedChainIds);
  const marginPairs = useMemo(() => {
    if (marginSelector === CUSTOM_SELECTOR.CUSTOM) {
      return marketPairList?.filter((pair) =>
        getAllDisplayableChainMarketCustomPairs(backendChainsConfig)
          .find((item) => item.id === marginCustomSelectorId && Number(item.chainId) === Number(pair.chainId))
          ?.pairs.includes(pair.pairSymbol),
      );
    }

    return marketPairList?.filter((pair) => {
      {
        if (!marginSelector) return true;
        return getMarginTypeByFeeder(pair.feederType) === marginSelector;
      }
    });
  }, [marginSelector, marketPairList, backendChainsConfig, marginCustomSelectorId]);
  const pairsToBeFiltered = useMemo(
    () =>
      _.flatMap(
        (selectedChainIds || DISPLAYABLE_CHAIN_ID)?.map(
          (id) => backendChainsConfig[id]?.pairsToBeFilteredInMarketAndEarn || [],
        ),
      ),
    [backendChainsConfig, selectedChainIds],
  );
  const filteredPairs = useMemo(() => {
    if (marginSelector === FAV_SELECTOR.FAVORITE) return favPairs;
    const requiredPairs = marginSelector === ALL_SELECTOR.ALL ? marketPairList : marginPairs;
    return requiredPairs
      ?.filter(
        (p) =>
          !search ||
          p.baseToken?.symbol.toLowerCase().includes(search.toLowerCase()) ||
          p.quoteToken?.symbol.toLowerCase().includes(search.toLowerCase()),
      )
      .filter((p) => !pairsToBeFiltered?.includes(p.pairSymbol))
      .filter((pair) => {
        switch (filter) {
          case MARKET_FILTERS.PERPETUAL:
            return pair.expiry === PERP_EXPIRY;
          case MARKET_FILTERS.DATED:
            return pair.expiry !== PERP_EXPIRY;
          default:
            return true;
        }
      })
      .filter((p) => WrappedBigNumber.from(p.tvlUsd).gte(TVL_THRESHHOLD));
  }, [marginSelector, favPairs, marketPairList, marginPairs, search, pairsToBeFiltered, filter]);

  return filteredPairs;
}

export function useCurrentMarketPairFromUrl(chainId: number | undefined): IMarketPair | undefined {
  const { pairSymbol, chainShortName } = useParams();
  const chainIdFromUrl = useMemo(() => {
    return chainShortName ? getChainIdByChainShortName(chainShortName) : undefined;
  }, [chainShortName]);
  const symbolInStorage = useDefaultPairSymbolFromUrlOrFallbackLocalOrApi(chainId);
  const { marketPairList } = useMarketList(chainId ? [chainId] : undefined);
  const pair = useMemo(() => {
    if (chainIdFromUrl !== chainId) return undefined;
    const symbol = pairSymbol || symbolInStorage;
    return [...(marketPairList || [])].find((wp) => wp.pairSymbol === symbol);
  }, [chainId, chainIdFromUrl, marketPairList, pairSymbol, symbolInStorage]);
  return pair;
}

export function useDefaultPairSymbolFromUrlOrFallbackLocalOrApi(chainId: number | undefined): string | undefined {
  const userAddr = useUserAddr();
  const marketType = useCurrentMarketType();
  const { marketPairList } = useMarketList(chainId ? [chainId] : undefined);
  const symbolInStorage = marketType ? getSavedPairChosen(userAddr, chainId, marketType) : undefined;
  return useMemo(() => {
    const symbol = symbolInStorage || (marketPairList?.length ? marketPairList[0].pairSymbol : undefined);
    return symbol;
  }, [marketPairList, symbolInStorage]);
}

export function useMarketSummary(chainIds: number[] | undefined): IMarketSummary | undefined {
  const { marketChainPairList } = useMarketList(chainIds);

  return useMemo(() => {
    return _.reduce(
      _.values(marketChainPairList).filter((list) => (!!chainIds?.length ? chainIds.includes(list.chainId) : true)),
      (acc, curr) => {
        return {
          totalTvlUsd: acc.totalTvlUsd.add(curr.totalTvlUsd),
          totalVolume24Usd: acc.totalVolume24Usd.add(curr.totalVolume24Usd),
          totalOpenInterestsUsd: acc.totalOpenInterestsUsd.add(curr.totalOpenInterestsUsd),
          totalEffectLiqTvlUsd: acc.totalEffectLiqTvlUsd.add(curr.totalEffectLiqTvlUsd),
        };
      },
      {
        totalTvlUsd: WrappedBigNumber.ZERO,
        totalVolume24Usd: WrappedBigNumber.ZERO,
        totalOpenInterestsUsd: WrappedBigNumber.ZERO,
        totalEffectLiqTvlUsd: WrappedBigNumber.ZERO,
      },
    );
  }, [chainIds, marketChainPairList]);
}

export function useCreativePairList(chainId: CHAIN_ID | undefined): CreativePair[] {
  // const pairList = useDisplayPairList(CHAIN_ID.BLAST, false);
  const { data: marketCreativePairs } = useFetchMarketCreativePairList();
  const creativePairs = useMemo(() => {
    const values = _.values(marketCreativePairs).filter((v) => {
      return SUPPORTED_CHAIN_ID.includes(Number(v.chainId));
    });
    return !!chainId ? values.filter((v) => v.chainId.toString() === chainId.toString()) : values;
  }, [chainId, marketCreativePairs]);
  return useMemo(() => creativePairs, [creativePairs]);
}

export function useWatchMarketListChange(chainId: number | undefined): void {
  const { socket } = useSocket();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!socket || !chainId) return;
    socket.emit(SUBSCRIBE_TYPE.MARKET, { chainId: chainId });

    socket.on(MESSAGE_TYPE.marketListChanged, (data) => {
      console.record('event', MESSAGE_TYPE.marketListChanged, data);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MARKET.PAIR_LIST() });
    });

    socket.on(MESSAGE_TYPE.marketFeaturePairsUpdated, (data) => {
      console.record('event', MESSAGE_TYPE.marketFeaturePairsUpdated, data);
      // setMarketFeaturePairsChanged(data);
    });

    return () => {
      socket.off(MESSAGE_TYPE.marketListChanged);
      socket.off(MESSAGE_TYPE.marketFeaturePairsUpdated);
      socket.emit(UNSUBSCRIBE_TYPE.MARKET, { chainId: chainId });
    };
  }, [chainId, dispatch, socket]);
}
