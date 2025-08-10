import { CHAIN_ID } from '@derivation-tech/context';
import { TickMath } from '@synfutures/sdks-perp';
import { BigNumber } from 'ethers';
import _ from 'lodash';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { FETCHING_STATUS } from '@/constants';
import { EARN_TYPE } from '@/constants/earn';
import { TABLE_TYPES } from '@/constants/global';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useAppDispatch, useAppSelector } from '@/hooks';
import {
  IAddLiquidityFormState,
  IAddLiquiditySimulation,
  IRemoveLiquidityFormState,
  IRemoveLiquiditySimulation,
} from '@/types/earn';
import { ILiquidityFilters } from '@/types/liquidity';
import { getLeftRatio, getRightRatio } from '@/utils/pair';
import { getAdjustTradePrice } from '@/utils/pairs';

import { WrappedPair } from '@/entities/WrappedPair';
import { useUserAddr } from '@/hooks/web3/useChain';
import { TokenInfo } from '@/types/token';
import { useWrappedRangeList } from '../account/rangeHook';
import { useMarketList } from '../market/hooks';
import { useCombinedPairFromUrl } from '../pair/hook';
import { useSDK } from '../web3/hook';
import { fetchEarnWhitelistConfig, setIsAddLiquidityInputRisky } from './action';
import {
  selectAddLiquidityFormStateByChainId,
  selectAddLiquidityFormStatusByChainId,
  selectAddLiquiditySimulation,
  selectAllowUnauthorizedLPs,
  selectChainPoolFilters,
  selectEarnFormType,
  selectEarnPortfolioTab,
  selectRemoveLiquidityFormStateByChainId,
  selectRemoveLiquidityFormStatusByChainId,
  selectRemoveLiquiditySimulation,
  selectRemoveLiquiditySuccess,
  selectWhiteList,
  selectWhiteListFetchingStatus,
} from './slice';

export function useAddLiquidationSimulation(chainId: CHAIN_ID | undefined): IAddLiquiditySimulation | undefined {
  const simulation = useAppSelector(selectAddLiquiditySimulation(chainId));
  const { t } = useTranslation();
  const currentPair = useCombinedPairFromUrl(chainId);
  const addLiqState = useAddLiquidityFormState(chainId);
  const minMargin = WrappedBigNumber.from(simulation?.data?.minMargin || 0);
  const { marketPairList } = useMarketList(chainId ? [chainId] : undefined);

  const isNewPair = useMemo(() => {
    return !(currentPair instanceof WrappedPair);
  }, [currentPair]);

  const isNewInstrument = useMemo(() => {
    if (!isNewPair) return false;
    if (marketPairList.length) {
      const pair = marketPairList.find(
        (pair) =>
          pair.baseToken.symbol === currentPair?.rootInstrument.baseToken.symbol &&
          pair.quoteToken.symbol === currentPair?.rootInstrument.quoteToken.symbol &&
          pair.marketType === currentPair.rootInstrument.marketType,
      );
      return !pair;
    }
    return true;
  }, [currentPair?.rootInstrument, marketPairList, isNewPair]);

  const newInstrumentLimitMsg = useMemo(() => {
    if (
      isNewInstrument &&
      simulation?.data?.minEffectiveQuoteAmount &&
      WrappedBigNumber.from(addLiqState?.amount || 0).gt(0) &&
      WrappedBigNumber.from(addLiqState?.amount || 0).lt(
        WrappedBigNumber.from(simulation?.data?.minEffectiveQuoteAmount),
      )
    ) {
      return t('common.earn.newInstrumentNotEnoughMargin', {
        amount: WrappedBigNumber.from(simulation?.data?.minEffectiveQuoteAmount)?.formatDisplayNumber() || '',
        quote: currentPair?.rootInstrument.quoteToken.symbol,
      });
    }
    return '';
  }, [
    addLiqState?.amount,
    currentPair?.rootInstrument.quoteToken.symbol,
    isNewInstrument,
    simulation?.data?.minEffectiveQuoteAmount,
    t,
  ]);

  return useMemo(() => {
    if (simulation) {
      return {
        ...simulation,
        message:
          newInstrumentLimitMsg ||
          simulation.message ||
          (minMargin.gt(addLiqState?.amount || '')
            ? t('common.earn.notEnoughMargin', {
                minAmount: minMargin.formatDisplayNumber(),
                // TODO get this from sdk
                minEffectiveLiquidity:
                  WrappedBigNumber.from(simulation?.data?.minEffectiveQuoteAmount || 0)?.formatDisplayNumber() || '',
                quote: currentPair?.rootInstrument.quoteToken.symbol,
              })
            : undefined),
      };
    }
    return simulation;
  }, [
    simulation,
    newInstrumentLimitMsg,
    minMargin,
    addLiqState?.amount,
    t,
    currentPair?.rootInstrument.quoteToken.symbol,
  ]);
}
export function useAddLiquidationSimulationData(chainId: CHAIN_ID | undefined): IAddLiquiditySimulation | undefined {
  const simulation = useAppSelector(selectAddLiquiditySimulation(chainId));
  return useMemo(() => simulation, [simulation]);
}

export function useAddLiquidityFormState(chainId: CHAIN_ID | undefined): IAddLiquidityFormState | undefined {
  return useAppSelector(selectAddLiquidityFormStateByChainId(chainId));
}
export function useAddLiquidityFormStateStatus(chainId: CHAIN_ID | undefined): FETCHING_STATUS {
  return useAppSelector(selectAddLiquidityFormStatusByChainId(chainId));
}

export function useIsAddLiquidityInputRisky() {
  const isAddLiquidityInputRisky = useAppSelector((state) => {
    return state.earn.isAddLiquidityInputRisky;
  });
  const dispatch = useAppDispatch();
  const setIsAddLiquidityInputRiskyCb = useCallback(
    (isAddLiquidityInputRisky: boolean) => dispatch(setIsAddLiquidityInputRisky(isAddLiquidityInputRisky)),
    [dispatch],
  );
  return {
    isAddLiquidityInputRisky,
    setIsAddLiquidityInputRisky: setIsAddLiquidityInputRiskyCb,
  };
}

export function usePairPriceRange(
  alpha: BigNumber,
  curTick: number,
  isInverse: boolean | undefined,
): { prices: number[]; ticks: number[] } {
  return useMemo(() => {
    if (alpha) {
      const [min, max] = TickMath.getTickRangeByAlpha(alpha, curTick);
      const minPrice = getAdjustTradePrice(WrappedBigNumber.from(TickMath.getWadAtTick(min)), !!isInverse).toNumber();
      const maxPrice = getAdjustTradePrice(WrappedBigNumber.from(TickMath.getWadAtTick(max)), !!isInverse).toNumber();
      return {
        prices: isInverse ? [maxPrice, minPrice] : [minPrice, maxPrice],
        ticks: [min, max],
      };
    }
    return { prices: [], ticks: [] };
  }, [alpha, curTick, isInverse]);
}
export function useRemoveLiquidationSimulation(chainId: CHAIN_ID | undefined): IRemoveLiquiditySimulation | undefined {
  return useAppSelector(selectRemoveLiquiditySimulation(chainId));
}
export function useRemoveLiquidationSuccess(chainId: CHAIN_ID | undefined, earnType: EARN_TYPE): boolean {
  const isSuccess = useAppSelector(selectRemoveLiquiditySuccess(chainId));
  return useMemo(() => {
    return isSuccess && earnType === EARN_TYPE.REMOVE_LIQ;
  }, [earnType, isSuccess]);
}
export function useRemoveLiquidityFormState(chainId: CHAIN_ID | undefined): IRemoveLiquidityFormState | undefined {
  return useAppSelector(selectRemoveLiquidityFormStateByChainId(chainId));
}
export function useRemoveLiquidityFormStateStatus(chainId: CHAIN_ID | undefined): FETCHING_STATUS {
  return useAppSelector(selectRemoveLiquidityFormStatusByChainId(chainId));
}

export function useEarnFormType(chainId: CHAIN_ID | undefined): EARN_TYPE {
  return useAppSelector(selectEarnFormType(chainId));
}
export function useEarnPortFolioTab(): TABLE_TYPES {
  return useAppSelector(selectEarnPortfolioTab);
}

export function useAllowUnauthorizedLPs(chainId: CHAIN_ID | undefined, quoteAddr: string | undefined): boolean {
  return useAppSelector(selectAllowUnauthorizedLPs(chainId, quoteAddr));
}

export function useWhiteListConfig(chainId: CHAIN_ID | undefined, quoteAddr: string | undefined): string[] {
  return useAppSelector(selectWhiteList(chainId, quoteAddr));
}

export function useWhiteListFetchingStatus(
  chainId: CHAIN_ID | undefined,
  quoteAddr: string | undefined,
): FETCHING_STATUS {
  const userAddr = useUserAddr();
  const status = useAppSelector(selectWhiteListFetchingStatus(chainId, quoteAddr));
  return useMemo(() => {
    if (!userAddr) return FETCHING_STATUS.DONE;
    return status;
  }, [status, userAddr]);
}

export function useIsInWhiteList(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
  quote: TokenInfo | undefined,
): boolean {
  const allowUnauthorizedLPs = useAllowUnauthorizedLPs(chainId, quote?.address);
  const whiteList = useWhiteListConfig(chainId, quote?.address);
  const fetchStatus = useWhiteListFetchingStatus(chainId, quote?.address);
  useFetchInWhiteList(chainId, userAddr, quote);
  return useMemo(() => {
    if (fetchStatus !== FETCHING_STATUS.DONE) {
      return true;
    }
    if (allowUnauthorizedLPs) {
      return true;
    }
    if (userAddr && whiteList) {
      return !!whiteList.find((addr) => addr.toLowerCase() === userAddr.toLowerCase());
    }
    return true;
  }, [allowUnauthorizedLPs, fetchStatus, userAddr, whiteList]);
}
export function usePairRangesMaxMin(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
  pairId: string | undefined,
  currentPrice: number,
): number {
  const rangeList = useWrappedRangeList(chainId, userAddr, pairId);
  return useMemo(() => {
    if (rangeList?.length) {
      return _.reduce(
        rangeList,
        (ratio, cur) => {
          const leftRatio = getLeftRatio(cur.wrapAttribute('lowerPrice').toNumber(), currentPrice);
          const rightRatio = getRightRatio(cur.wrapAttribute('upperPrice').toNumber(), currentPrice);
          return Math.max(leftRatio, rightRatio, ratio);
        },
        Math.max(
          getLeftRatio(rangeList[0].wrapAttribute('lowerPrice').toNumber(), currentPrice),
          getRightRatio(rangeList[0].wrapAttribute('upperPrice').toNumber(), currentPrice),
        ),
      );
    }
    return 1;
  }, [currentPrice, rangeList]);
}
export function useChainPoolListFilters(chainId: number | undefined): ILiquidityFilters | undefined {
  const filters = useAppSelector(selectChainPoolFilters(chainId));
  return useMemo(() => filters, [filters]);
}

export function useFetchInWhiteList(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
  quote: TokenInfo | undefined,
): void {
  const dispatch = useAppDispatch();
  const sdkContext = useSDK(chainId);
  const fetchWhiteListConfig = useCallback(async () => {
    if (chainId && userAddr && sdkContext && quote) {
      await dispatch(fetchEarnWhitelistConfig({ chainId: chainId, userAddr: userAddr, sdkContext, quote }));
    }
    // must check sdkContext
  }, [chainId, userAddr, dispatch, sdkContext, quote]);

  useEffect(() => {
    fetchWhiteListConfig();
  }, [fetchWhiteListConfig]);
}
