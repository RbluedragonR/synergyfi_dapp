import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { formatUnits } from 'ethers/lib/utils';
import { useCallback, useEffect, useMemo } from 'react';
import { useSpotState } from './store';

import { WRAPPED_ZERO } from '@/constants/bigNumber';
import { CHAIN_ID, DEFAULT_CHAIN_ID, SUPPORTED_CHAIN_ID } from '@/constants/chain';
import { QUERY_KEYS } from '@/constants/query';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useNativeToken } from '@/features/chain/hook';
import { queryClient } from '@/pages/App';
import { RouteBasePath } from '@/pages/routers';
import { TokenInfo } from '@/types/token';
import { getChainShortName } from '@/utils/chain';
import { bothNative, getSearchRanking } from '@/utils/spot';
import _ from 'lodash';
import { NavigateOptions, useNavigate, useParams } from 'react-router-dom';
import { useTokenBalanceMapState } from '../balance/hook';
import { useTokenPrices } from '../global/query';
import { useSimulateBestRoute, useSimulateSwap, useSpotPools, useSpotTokens } from './query';
import { SPOT_TYPE, TokenInfoInSpot } from './types';
export const useSwitchToken = () => {
  const {
    setSellAmount: setAmount,
    token1: buyToken,
    setToken1: setBuyToken,
    token0: sellToken,
    setToken0: setSellToken,
  } = useSpotState();
  const { goToSpot } = useSpotRouter();

  const switchToken = useCallback(() => {
    setSellToken(buyToken);
    setBuyToken(sellToken);
    goToSpot({ buyTokenAddr: sellToken.address, sellTokenAddr: buyToken.address });
    setAmount('');
  }, [buyToken, goToSpot, sellToken, setAmount, setBuyToken, setSellToken]);
  return { switchToken };
};
export function useSimulateBestAmount() {
  const { token1: buyToken, token0: sellToken, sellAmount } = useSpotState();
  const { data: bestRoute, isFetching, isFetched } = useSimulateBestRoute();
  const nativeWrappedNative = useMemo(() => bothNative(buyToken, sellToken), [buyToken, sellToken]);
  const bestAmount = useMemo(() => {
    if (nativeWrappedNative) {
      return sellAmount;
    }
    if (bestRoute?.bestAmount) {
      return formatUnits(bestRoute.bestAmount, buyToken?.decimals);
    }
    return '';
  }, [bestRoute?.bestAmount, buyToken?.decimals, nativeWrappedNative, sellAmount]);
  return useMemo(
    () => ({
      ...(nativeWrappedNative ? {} : bestRoute),
      bestAmount,
      isFetching,
      isFetched,
    }),
    [bestAmount, bestRoute, isFetched, isFetching, nativeWrappedNative],
  );
}
export function useSetSellToken() {
  const { setToken0: setSellToken, token1: buyToken, token0, setToken1: setBuyToken } = useSpotState();
  const { goToSpot } = useSpotRouter();
  const setSellTokenFn = useCallback(
    async (sellToken: TokenInfoInSpot) => {
      // Set the sell token in the state
      let buyTokenFinal = buyToken;
      if (sellToken.address === buyToken.address) {
        buyTokenFinal = token0;
      }
      setSellToken(sellToken);
      setBuyToken(buyTokenFinal);
      goToSpot({ buyTokenAddr: buyTokenFinal.address, sellTokenAddr: sellToken.address });
    },
    [buyToken, goToSpot, setBuyToken, setSellToken, token0],
  );

  return { setSellTokenFn };
}

export function useSetBuyToken() {
  const { setToken1: setBuyToken, token0: sellToken, setToken0, token1 } = useSpotState();
  const { goToSpot } = useSpotRouter();
  // Function to set the buy token and determine the best sell token based on value
  const setBuyTokenFn = useCallback(
    async (buyToken: TokenInfoInSpot) => {
      // Set the selected buy token in the state
      let sellTokenFinal = sellToken;
      if (buyToken.address === sellToken.address) {
        sellTokenFinal = token1;
      }
      setBuyToken(buyToken);
      setToken0(sellTokenFinal);
      goToSpot({ buyTokenAddr: buyToken.address, sellTokenAddr: sellTokenFinal.address });
    },
    [goToSpot, sellToken, setBuyToken, setToken0, token1],
  );

  return { setBuyTokenFn };
}

export const useTokenSymbolQueryParam = () => {
  const { token0, token1 } = useParams();
  const buySymbolOrAddr = token1;
  const sellSymbolOrAddr = token0;

  return { buySymbolOrAddr, sellSymbolOrAddr };
};

export const useTokenSymbolQueryParamEffect = ({ tokens }: { tokens: TokenInfoInSpot[] | null | undefined }) => {
  const { buySymbolOrAddr, sellSymbolOrAddr } = useTokenSymbolQueryParam();
  const { token0, token1, setToken0, setToken1 } = useSpotState();
  const chainId = useChainId();
  const nativeToken = useNativeToken(chainId);
  // Fetch available sell tokens for the selected buy token
  const getBuyTokenInfoAndSetState = useCallback(async () => {
    if (tokens && nativeToken) {
      const sellTokenInfo: TokenInfoInSpot | undefined = [
        { ...nativeToken, isSymbolDuplicated: false },
        ...tokens,
      ].filter((t) => t.symbol === sellSymbolOrAddr || t.address.toLowerCase() === sellSymbolOrAddr?.toLowerCase())[0];
      const buyTokenInfo: TokenInfoInSpot | undefined = [
        { ...nativeToken, isSymbolDuplicated: false },
        ...tokens,
      ].filter((t) => t.symbol === buySymbolOrAddr || t.address.toLowerCase() === buySymbolOrAddr?.toLowerCase())[0];
      if (token0.symbol === sellSymbolOrAddr && token1.symbol === buySymbolOrAddr) {
        return;
      }
      if (sellTokenInfo?.address !== buyTokenInfo?.address) {
        if (sellTokenInfo) {
          setToken0(sellTokenInfo);
        }
        if (buyTokenInfo) {
          setToken1(buyTokenInfo);
        }
      }
    }
  }, [buySymbolOrAddr, nativeToken, sellSymbolOrAddr, setToken0, setToken1, token0.symbol, token1.symbol, tokens]);
  useEffect(() => {
    getBuyTokenInfoAndSetState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buySymbolOrAddr, sellSymbolOrAddr, tokens]);
};

export const getSpotLink = ({
  chainId,
  buySymbolOrAddr,
  sellSymbolOrAddr,
}: {
  chainId?: CHAIN_ID;
  buySymbolOrAddr?: string;
  sellSymbolOrAddr?: string;
}) => {
  const theChainId = chainId || DEFAULT_CHAIN_ID;
  const finalChainId = SUPPORTED_CHAIN_ID.includes(theChainId) ? theChainId : DEFAULT_CHAIN_ID;
  const chainShortName = getChainShortName(finalChainId);
  if (buySymbolOrAddr && sellSymbolOrAddr) {
    return `/${RouteBasePath.spot}/${SPOT_TYPE.SWAP}/${chainShortName}/${sellSymbolOrAddr}/${buySymbolOrAddr}`;
  }
  return `/${RouteBasePath.spot}/${SPOT_TYPE.SWAP}/${chainShortName}`;
};
export default function useSpotRouter() {
  const navigate = useNavigate();
  const chainId = useChainId();
  const { data: tokens } = useSpotTokens({ chainId, includeNativeToken: true });
  const goToSpot = useCallback(
    ({ buyTokenAddr, sellTokenAddr }: { buyTokenAddr?: string; sellTokenAddr?: string }, options?: NavigateOptions) => {
      const buyToken = tokens?.find((t) => t.address.toLowerCase() === buyTokenAddr?.toLowerCase());
      const sellToken = tokens?.find((t) => t.address.toLowerCase() === sellTokenAddr?.toLowerCase());
      const buySymbolOrAddr = buyToken?.isSymbolDuplicated ? buyToken.address : buyToken?.symbol;
      const sellSymbolOrAddr = sellToken?.isSymbolDuplicated ? sellToken.address : sellToken?.symbol;
      navigate(getSpotLink({ buySymbolOrAddr, sellSymbolOrAddr, chainId }), options);
    },
    [chainId, navigate, tokens],
  );

  return { goToSpot, getSpotLink };
}

export const useFilteredSpotPools = (
  chainId: number | undefined,
  token0: TokenInfo | undefined,
  token1: TokenInfo | undefined,
) => {
  const { data: simulation } = useSimulateSwap();
  const queryStates = useSpotPools(chainId, token0?.address, token1?.address);
  const { data: tokens } = useSpotTokens({ chainId, includeNativeToken: true });
  const allTokens = useMemo(() => [token0, token1, ...(tokens || [])], [token0, token1, tokens]);
  const filteredPools = useMemo(() => {
    const newFilteredPools: {
      token0Info: TokenInfo | undefined;
      token1Info: TokenInfo | undefined;
      fee: number;
      tvl: number;
      type: number;
      address: string;
      token0: number;
      token1: number;
      address0: string;
      address1: string;
      price: number;
    }[] = [];
    if (simulation?.data) {
      for (let i = 0; i < simulation.data.route.length; i++) {
        const route = simulation.data.route[i];
        for (let j = 0; j < route.length; j++) {
          const item = route[j];
          const fee = item.fee;
          const poolType = item.poolType;
          const pool = queryStates.data?.find(
            (pool) =>
              pool.type === poolType &&
              WrappedBigNumber.from(fee).eq(pool.fee / 1000000) &&
              pool.address0.toLowerCase() === simulation.data?.tokens[i]?.toLowerCase() &&
              pool.address1.toLowerCase() === simulation.data?.tokens[i + 1]?.toLowerCase(),
          );
          const token0Info = allTokens?.find(
            (t) => t?.address.toLowerCase() === simulation.data?.tokens[i]?.toLowerCase(),
          );
          const token1Info = allTokens?.find(
            (t) => t?.address.toLowerCase() === simulation.data?.tokens[i + 1].toLowerCase(),
          );

          if (pool) {
            newFilteredPools.push({
              ...pool,
              token0Info,
              token1Info,
            });
          }
        }
      }
    }

    return newFilteredPools;
  }, [simulation, queryStates.data, allTokens]);
  return { ...queryStates, data: filteredPools };
};

const useFilteredSpotTokens = ({
  search,
}: // tokenToExclude,
{
  search: string;
  tokenToExclude: TokenInfo | undefined;
}) => {
  const chainId = useChainId();
  const { data: fullTokensWithNative, isFetched } = useSpotTokens({ chainId, includeNativeToken: true });
  const tokenBalanceMap = useTokenBalanceMapState(chainId);
  const { data: tokenPriceMap } = useTokenPrices({ chainId });
  const displayTokensSource = useMemo(() => {
    let tokens = fullTokensWithNative;
    // 1. Filter by search
    if (search?.toLowerCase()?.trim()?.length) {
      tokens = fullTokensWithNative?.filter((t) =>
        search.toLowerCase().startsWith('0x')
          ? t.address.toLowerCase().includes(search.toLowerCase())
          : t.symbol.toLowerCase().includes(search.toLowerCase()),
      );
    } else {
      // 2. Filter by balance and top 100
      const top100Tokens = fullTokensWithNative?.slice(0, 100) || [];
      const hasBalanceTokens = fullTokensWithNative?.filter((t) => tokenBalanceMap[t.address]?.balance?.gt(0)) || [];
      tokens = [...hasBalanceTokens, ...top100Tokens.filter((t) => !hasBalanceTokens.includes(t))];
    }
    return tokens;
    // return tokens?.filter((t) => {
    //   if (tokenToExclude?.address === nativeToken?.address) {
    //     return t.address !== wrappedNativeToken?.address;
    //   }
    //   if (tokenToExclude?.address === wrappedNativeToken?.address) {
    //     return t.address !== nativeToken?.address;
    //   }
    //   return true;
    // });
  }, [
    fullTokensWithNative,
    // nativeToken?.address,
    search,
    tokenBalanceMap,
    // tokenToExclude?.address,
    // wrappedNativeToken?.address,
  ]);

  const filteredTokens = useMemo(() => {
    // Combine and sort by search ranking, balance, price, and symbol
    const result = _.orderBy(
      displayTokensSource,
      [
        (token) => getSearchRanking(search, token.symbol),
        (token) => {
          const balance = _.get(tokenBalanceMap, [token.address.toLowerCase()])?.balance || WRAPPED_ZERO;
          return balance.mul(_.get(tokenPriceMap, [token.address.toLowerCase(), 'current'], 0)).toNumber();
        },
        (token) => {
          const balance = _.get(tokenBalanceMap, [token.address.toLowerCase()])?.balance || WRAPPED_ZERO;
          return balance.toNumber();
        },
        (token) => token.symbol,
      ],
      ['asc', 'desc', 'desc', 'asc'],
    );

    return result;
  }, [displayTokensSource, search, tokenBalanceMap, tokenPriceMap]);

  return { filteredTokens, isFetched };
};

export const useFilteredSellSpotTokens = ({ search }: { search: string }) => {
  const { token1: buyToken } = useSpotState();
  return useFilteredSpotTokens({ search, tokenToExclude: buyToken });
};

export const useFilteredBuySpotTokens = ({ search }: { search: string }) => {
  const { token0: sellToken } = useSpotState();
  return useFilteredSpotTokens({ search, tokenToExclude: sellToken });
};

export const useSwapRefresh = () => {
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const { sellAmount, token1: buyToken, token0: sellToken } = useSpotState();

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.SPOT.SIMULATE_SWAP(chainId, userAddr, sellAmount, sellToken?.address, buyToken?.address),
    });
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.SPOT.SIMULATE_BEST_ROUTE(
        chainId,
        userAddr,
        sellAmount,
        sellToken?.address,
        buyToken?.address,
      ),
    });
  }, [buyToken?.address, chainId, sellAmount, sellToken?.address, userAddr]);
  return { handleRefresh };
};
