import { CHAIN_ID } from '@derivation-tech/context';
import { useDebounceEffect } from 'ahooks';
import _ from 'lodash';
import { useMemo } from 'react';

import { POLLING_USER_BALANCE } from '@/constants/polling';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { WrappedPosition } from '@/entities/WrappedPosition';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { useDappChainConfig, useUserAddr } from '@/hooks/web3/useChain';
import { IGateAccountState, IGateBalanceInfo, ITokenBalanceInfo, ITokenBalanceInfoMap } from '@/types/balance';
import { bigNumberObjectCheck, pollingFunc } from '@/utils';
import { isNativeTokenAddr } from '@/utils/token';

import { QUERY_KEYS } from '@/constants/query';
import { queryClient } from '@/pages/App';
import { utils } from '@synfutures/sdks-perp';
import { useMarginTokenInfoMap, useNativeToken, useQuoteTokens } from '../chain/hook';
import { fetchAllTokenBalanceAction, resetChainDefaultBalanceMapAction } from './actions';
import { selectBalanceMapState, selectGateAccountState, selectTokenBalanceByChainIdAndAddress } from './balanceSlice';
import { useFetchUserGateBalanceList } from './query';

export function useTokenBalanceMapState(chainId: CHAIN_ID | undefined): ITokenBalanceInfoMap {
  const chainBalanceMap = useAppSelector(selectBalanceMapState);
  const account = useUserAddr();

  const allTokenBalanceInfoMapState = useMemo(() => {
    let res: ITokenBalanceInfoMap = {};
    if (chainId && account) {
      if (chainBalanceMap[chainId] && chainBalanceMap[chainId][account]) {
        res = chainBalanceMap[chainId][account];
      }
    }
    return res;
  }, [chainId, account, chainBalanceMap]);

  return allTokenBalanceInfoMapState;
}

export function useTokenBalanceList(chainId: CHAIN_ID | undefined): ITokenBalanceInfo[] {
  const allTokenBalanceInfoMapState = useTokenBalanceMapState(chainId);
  const nativeToken = useNativeToken(chainId);
  const balancesArr = useMemo(() => {
    const list = Object.values(allTokenBalanceInfoMapState);
    return list.map((balance) => {
      return {
        ...balance,
      } as ITokenBalanceInfo;
    });
  }, [allTokenBalanceInfoMapState]);

  const tokenBalanceList = useMemo(() => {
    if (!nativeToken) return [];
    const coinBalanceList = _.orderBy(
      [...balancesArr],
      [
        (coin): number => {
          if (coin.address === nativeToken.address) {
            return -1;
          }
          return coin.symbol?.toLowerCase().charCodeAt(0);
        },
      ],
      ['asc'],
    ).map((coin) => {
      return coin;
    });

    return coinBalanceList;
  }, [balancesArr, nativeToken]);
  return tokenBalanceList;
}

let polling_balance: NodeJS.Timeout | null = null;

export function useDefaultChainBalanceState(chainId: CHAIN_ID | undefined): void {
  const userAddr = useUserAddr();
  const marginTokenMap = useMarginTokenInfoMap(chainId);
  const dispatch = useAppDispatch();
  const nativeToken = useNativeToken(chainId);
  useDebounceEffect(
    () => {
      if (!chainId || !userAddr) return;
      if (!marginTokenMap || !nativeToken) return;

      async function resetBalanceAndFetchBalance(chainId: CHAIN_ID, account: string): Promise<void> {
        if (!marginTokenMap || !nativeToken) return;
        await dispatch(
          resetChainDefaultBalanceMapAction({
            chainId,
            traderAddress: account,
            quoteTokenInfoMap: { ...marginTokenMap, [nativeToken?.address]: nativeToken },
          }),
        );
        // await onFetchAllWalletBalance(chainId, account);
      }
      resetBalanceAndFetchBalance(chainId, userAddr);
      // setResult(chainId);
    },
    [chainId, userAddr, dispatch, marginTokenMap],
    { wait: 300 },
  );

  useDebounceEffect(
    () => {
      if (chainId && userAddr && marginTokenMap && nativeToken) {
        // const tokens = Object.values(marginTokenMap);
        if (polling_balance) clearInterval(polling_balance);
        polling_balance = pollingFunc(() => {
          // dispatch(
          //   fetchGateBalanceAction({
          //     chainId,
          //     userAddr: userAddr,
          //     tokens,
          //   }),
          // );
          queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.BALANCE.GATE(chainId, userAddr),
          });
          dispatch(
            fetchAllTokenBalanceAction({
              chainId: chainId,
              userAddr,
              marginTokenMap,
            }),
          );
        }, POLLING_USER_BALANCE);
      }

      return () => {
        if (polling_balance) {
          clearInterval(polling_balance);
        }
      };
    },
    [marginTokenMap, chainId, dispatch, userAddr],
    { wait: 400 },
  );
}

/**
 * get token balance(return limit balance of native token)
 * @param tokenAddress token address
 * @param chainId
 * @param needLimitNativeTokenBalance limit the balance of native token for send tx gas,default true
 * @returns balance of token
 */
export function useTokenBalance(
  tokenAddress: string | undefined,
  chainId: CHAIN_ID | undefined,
  needLimitNativeTokenBalance = false,
): WrappedBigNumber {
  const tokenBalance = useTokenBalanceByChainIdAndAddress(tokenAddress, chainId);
  const dappConfig = useDappChainConfig(chainId);
  return useMemo(() => {
    //  limit the balance of native token
    if (
      dappConfig?.minNativeTokenKeep &&
      needLimitNativeTokenBalance &&
      tokenBalance?.balance &&
      isNativeTokenAddr(tokenBalance?.address)
    ) {
      const nativeTokenMinGasPriceLimit = dappConfig?.minNativeTokenKeep;
      if (nativeTokenMinGasPriceLimit) {
        return tokenBalance?.balance.min(nativeTokenMinGasPriceLimit).keepPositive();
      }
    }
    return tokenBalance?.balance || WrappedBigNumber.ZERO;
  }, [
    dappConfig?.minNativeTokenKeep,
    needLimitNativeTokenBalance,
    tokenBalance?.address,
    tokenBalance?.balance?.stringValue,
  ]);
}
export function useTokenBalanceByChainIdAndAddress(
  tokenAddress: string | undefined,
  chainId: CHAIN_ID | undefined,
): ITokenBalanceInfo {
  const account = useUserAddr();
  const tokenBalance = useAppSelector(selectTokenBalanceByChainIdAndAddress(chainId, account, tokenAddress));
  return useMemo(() => bigNumberObjectCheck(tokenBalance), [tokenBalance]);
}
export function useTokenGateBalanceByChainIdAndAddress(
  chainId: CHAIN_ID | undefined,
  tokenAddress: string | undefined,
): IGateBalanceInfo | undefined {
  const account = useUserAddr();
  // const tokenBalance = useAppSelector(selectTokenGateBalanceByChainIdAndAddress(chainId, account, tokenAddress));
  // return useMemo(() => bigNumberObjectCheck(tokenBalance), [tokenBalance]);
  const gateBalances = useUserGateBalanceList(chainId, account);

  return useMemo(() => {
    return gateBalances.find((b) => b.address === tokenAddress);
  }, [gateBalances, tokenAddress]);
}

// export function useTokenGateBalanceMap(
//   chainId: CHAIN_ID | undefined,
//   userAddr: string | undefined,
// ): ITokenBalanceInfoMap {
//   const tokenBalanceMap = useAppSelector(selectTokenGateBalanceByChainId(chainId, userAddr));
//   return useMemo(() => bigNumberObjectCheck(tokenBalanceMap), [tokenBalanceMap]);
// }

export function useGateAccountState(chainId: CHAIN_ID | undefined): IGateAccountState {
  const chainTradeAccountState = useAppSelector(selectGateAccountState);

  return useMemo(() => {
    if (chainId && chainTradeAccountState[chainId]) return chainTradeAccountState[chainId];
    return {} as IGateAccountState;
  }, [chainId, chainTradeAccountState]);
}

/**
 * get all balance of token and vault balance
 * @param tokenAddress
 * @param chainId
 * @param plusGateBalance
 * @param needLimitNativeTokenBalance
 * @returns
 */
export function useAvailableTokenBalance(
  tokenAddress: string | undefined,
  chainId: CHAIN_ID | undefined,
  plusGateBalance = true,
  needLimitNativeTokenBalance = true,
): WrappedBigNumber {
  const tokenBalance = useTokenBalance(tokenAddress, chainId, needLimitNativeTokenBalance);
  const gateBalance = useTokenGateBalanceByChainIdAndAddress(chainId, tokenAddress);
  return useMemo(() => {
    let balance = tokenBalance;
    if (plusGateBalance && tokenBalance) {
      balance = tokenBalance.add(gateBalance?.balance || WrappedBigNumber.ZERO);
    }
    return balance || WrappedBigNumber.ZERO;
  }, [plusGateBalance, tokenBalance, gateBalance?.balance?.wadValue?._hex]);
}

export function useDisplayBalance(
  position: WrappedPosition | undefined,
  transferIn: boolean,
  chainId: CHAIN_ID | undefined,
  tokenAddress: string | undefined,
): WrappedBigNumber {
  const tokenBalance = useAvailableTokenBalance(tokenAddress || '', chainId);
  const availablePositionMargin = useMemo(() => {
    if (!transferIn && position?.size) {
      const margin = utils.positionMaxWithdrawableMargin(
        position,
        position.rootPair,
        position.rootInstrument.initialMarginRatio,
      );
      if (margin) {
        return WrappedBigNumber.from(margin);
      }
    }
    return WrappedBigNumber.ZERO;
  }, [transferIn, position?.size, position?.unrealizedPnl, position?.balance]);
  const displayBalance = useMemo(() => {
    if (!transferIn) {
      return availablePositionMargin;
    }
    return tokenBalance;
  }, [tokenBalance?.wadValue?._hex, availablePositionMargin, transferIn]);
  return displayBalance;
}

export function useUserGateBalanceList(chainId: number | undefined, userAddr: string | undefined): IGateBalanceInfo[] {
  const { data: balances } = useFetchUserGateBalanceList(chainId, userAddr);
  const tokens = useQuoteTokens(chainId);
  const userGateBalanceList = useMemo(() => {
    if (balances && tokens) {
      return tokens.map((token) => {
        const balance = balances.find((b) => b.address === token.address);
        const info: IGateBalanceInfo = {
          ...token,
          balance: WrappedBigNumber.from(balance?.balance || '0'),
          decimals: Number(token.decimals),
          address: token.address,
        };
        return info;
      });
    }
    return [];
  }, [balances, tokens]);
  return userGateBalanceList;
}

export function useUserIsFetchedGateBalanceList(chainId: number | undefined, userAddr: string | undefined): boolean {
  const { isFetched } = useFetchUserGateBalanceList(chainId, userAddr);
  return isFetched;
}
