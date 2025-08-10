import { InstrumentInfo, Side, TickMath, alignPriceToTick, wdiv } from '@synfutures/sdks-perp';
import { FundingChartInterval, KlineInterval } from '@synfutures/sdks-perp-datasource';
import BN from 'bignumber.js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { FETCHING_STATUS } from '@/constants';
import { CHAIN_ID } from '@/constants/chain';
import { EARN_TYPE } from '@/constants/earn';
import { TABLE_TYPES, TRADE_LEVERAGE_THRESHOLDS } from '@/constants/global';
import {
  DEFAULT_IMR,
  LEVERAGE_ADJUST_TYPE,
  TRADE_TYPE,
  getImrStepRatio,
  getScaleLimitStepRatio,
} from '@/constants/trade';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { WrappedOrder } from '@/entities/WrappedOrder';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { TokenInfo } from '@/types/token';
import {
  IAdjustMarginFormState,
  IAdjustMarginSimulation,
  ICancelFormState,
  IClosePositionFormState,
  ICrossMarketOrderSimulation,
  ILimitFormState,
  IMarketFormState,
  IOrderCancelStatus,
  IOrderSimulation,
  IPnlParams,
  IScaleFormState,
  IScaledOrderSimulation,
  ISimulation,
  ISimulationData,
  getDefaultSimulation,
} from '@/types/trade';
import { inputNumChecker, toWad } from '@/utils/numberUtil';

import { ERROR_MSG_EXCEED_WALLET_BALANCE } from '@/constants/simulation';
import { WrappedPair } from '@/entities/WrappedPair';
import { getAdjustTradePrice } from '@/utils/pairs';
import { calcBaseSizeByQuote, calcTradeValue, isUsePlaceCrossMarketOrder } from '@/utils/trade';
import { useAsyncEffect, useDebounceEffect } from 'ahooks';
import { BigNumber } from 'ethers';
import { useWrappedOrderList } from '../account/orderHook';
import { useMainPosition } from '../account/positionHook';
import { useAvailableTokenBalance, useTokenBalance, useTokenGateBalanceByChainIdAndAddress } from '../balance/hook';
import { useBackendChainConfig } from '../config/hook';
import { useAddLiquidationSimulationData, useEarnFormType, useRemoveLiquidationSimulation } from '../earn/hook';
import { useGlobalConfig } from '../global/hooks';
import { useCurrentPairByDevice, usePairLimitPriceRange } from '../pair/hook';
import { useSDK } from '../web3/hook';
import {
  setLimitPrice,
  setScaleLimitPrice,
  setTradeFormSide,
  simulateCrossMarketOrder,
  simulateMarketTrade,
} from './actions';
import {
  selectAdjustMarginFormState,
  selectAdjustMarginFormStatus,
  selectAdjustMarginSimulation,
  selectBulkCancelStatus,
  selectCancelFormState,
  selectCancelFormStatus,
  selectChartDurationByChainId,
  selectCloseFormStatus,
  selectClosePositionFormState,
  selectCloseSimulation,
  selectCloseSimulationStatus,
  selectCrossMarketSimulation,
  selectCurrentFutures,
  selectFundingChartDurationByChainId,
  selectIsChosenOrder,
  selectLimitFormState,
  selectLimitFormStatus,
  selectLimitSimulation,
  selectMarketFormStateByChainId,
  selectMarketFormStatusByChainId,
  selectMarketSimulation,
  selectPairLeverageSwitchChecked,
  selectPnlShare,
  selectScaleFormStateByChainId,
  selectScaleFormStatusByChainId,
  selectScaleSimulationByChainId,
  selectStepRatioByChainId,
  selectTradeDrawerTypeByChainId,
  selectTradeFormLeverageByChainIdAndFormType,
  selectTradePortfolioTab,
  selectTradeTypeByChainId,
} from './slice';

export function useScaleFormState(chainId: CHAIN_ID | undefined): IScaleFormState {
  const scaleFormState = useAppSelector(selectScaleFormStateByChainId(chainId));

  return useMemo(() => scaleFormState || {}, [scaleFormState]);
}
export function useScaleFormStateStatus(chainId: CHAIN_ID | undefined): FETCHING_STATUS {
  const scaleFormStatus = useAppSelector(selectScaleFormStatusByChainId(chainId));

  return useMemo(() => scaleFormStatus, [scaleFormStatus]);
}
export function useScaleSimulation(chainId: CHAIN_ID | undefined): IScaledOrderSimulation | undefined {
  const simulation = useAppSelector(selectScaleSimulationByChainId(chainId));
  const { baseAmount } = useScaleFormState(chainId);
  const { t } = useTranslation();
  const currentPair = useCurrentPairByDevice(chainId);

  return useMemo(() => {
    const baseAmountWad = baseAmount ? WrappedBigNumber.from(baseAmount) : undefined;
    if (baseAmountWad && baseAmountWad.eq(0)) {
      return;
    }
    const minAmount = WrappedBigNumber.from(simulation?.data?.totalMinSize || 0);
    return {
      ...simulation,
      message:
        baseAmountWad && baseAmountWad.lt(minAmount)
          ? t('common.tradePage.lessThanMinOrder', {
              orderValue: WrappedBigNumber.from(minAmount || 0).formatDisplayNumber({
                roundingMode: BN.ROUND_UP,
              }),
              base: currentPair?.rootInstrument.baseToken.symbol,
            })
          : t(simulation?.message || ''),
    };
  }, [baseAmount, currentPair?.rootInstrument.baseToken.symbol, simulation, t]);
}
export function useMarketFormState(chainId: CHAIN_ID | undefined): IMarketFormState {
  const tradeFormState = useAppSelector(selectMarketFormStateByChainId(chainId));

  return useMemo(() => tradeFormState || {}, [tradeFormState]);
}
export function useMarketFormStateStatus(chainId: CHAIN_ID | undefined): FETCHING_STATUS {
  const tradeFormStatus = useAppSelector(selectMarketFormStatusByChainId(chainId));

  return useMemo(() => tradeFormStatus, [tradeFormStatus]);
}

export function useTradeFormLeverage(
  chainId: CHAIN_ID | undefined,
  formType: TRADE_TYPE,
  maxLeverage?: number,
): string {
  const leverage = useAppSelector(selectTradeFormLeverageByChainIdAndFormType(chainId, formType));
  return useMemo(() => {
    if (leverage) {
      if (WrappedBigNumber.from(leverage).lt(TRADE_LEVERAGE_THRESHOLDS.MIN)) {
        return TRADE_LEVERAGE_THRESHOLDS.MIN.toString();
      } else if (maxLeverage && WrappedBigNumber.from(leverage).gt(maxLeverage)) {
        return maxLeverage.toString();
      }
    }
    return leverage;
  }, [leverage, maxLeverage]);
}

export function useTradeType(chainId: CHAIN_ID | undefined): TRADE_TYPE {
  return useAppSelector(selectTradeTypeByChainId(chainId));
}
export function useTradeDrawerType(chainId: CHAIN_ID | undefined): TRADE_TYPE {
  return useAppSelector(selectTradeDrawerTypeByChainId(chainId));
}

export function useTradeSide(chainId: CHAIN_ID | undefined): Side {
  const tradeType = useTradeType(chainId);
  const marketFormState = useMarketFormState(chainId);
  const limitFormState = useLimitFormState(chainId);
  const scaleLimitFormState = useScaleFormState(chainId);
  return useMemo(() => {
    let side = Side.LONG;
    if (tradeType === TRADE_TYPE.MARKET) {
      side = marketFormState.tradeSide;
    } else if (tradeType === TRADE_TYPE.SCALE_LIMIT) {
      side = scaleLimitFormState.tradeSide;
    } else {
      side = limitFormState.tradeSide;
    }
    return side || Side.LONG;
  }, [limitFormState.tradeSide, marketFormState.tradeSide, scaleLimitFormState.tradeSide, tradeType]);
}

export function useAdjustMarginFormState(chainId: CHAIN_ID | undefined): IAdjustMarginFormState {
  const tradeFormState = useAppSelector(selectAdjustMarginFormState(chainId));

  return useMemo(() => tradeFormState || {}, [tradeFormState]);
}
export function useAdjustMarginSimulation(chainId: CHAIN_ID | undefined): IAdjustMarginSimulation | undefined {
  const simulation = useAppSelector(selectAdjustMarginSimulation(chainId));

  return useMemo(() => simulation, [simulation]);
}
export function useAdjustMarginFormStatus(chainId: CHAIN_ID | undefined): FETCHING_STATUS {
  const fetchingStatus = useAppSelector(selectAdjustMarginFormStatus(chainId));

  return useMemo(() => fetchingStatus || FETCHING_STATUS.DONE, [fetchingStatus]);
}

export function useClosePositionFormState(chainId: CHAIN_ID | undefined): IClosePositionFormState {
  const tradeFormState = useAppSelector(selectClosePositionFormState(chainId));

  return useMemo(() => tradeFormState || {}, [tradeFormState]);
}
export function useCloseFormStatus(chainId: CHAIN_ID | undefined): FETCHING_STATUS {
  const fetchingStatus = useAppSelector(selectCloseFormStatus(chainId));

  return useMemo(() => fetchingStatus || FETCHING_STATUS.DONE, [fetchingStatus]);
}

export function useLimitFormState(chainId: CHAIN_ID | undefined): ILimitFormState {
  const limitFormState = useAppSelector(selectLimitFormState(chainId));

  return useMemo(() => limitFormState || {}, [limitFormState]);
}
export function useLimitFormStatus(chainId: CHAIN_ID | undefined): FETCHING_STATUS {
  const limitFormStatus = useAppSelector(selectLimitFormStatus(chainId));

  return useMemo(() => limitFormStatus, [limitFormStatus]);
}
export function useLimitSimulationRaw(chainId: CHAIN_ID | undefined): IOrderSimulation | undefined {
  const limitSimulation = useAppSelector(selectLimitSimulation(chainId));
  return useMemo(() => limitSimulation, [limitSimulation]);
}

export function useLimitSimulation(chainId: CHAIN_ID | undefined): IOrderSimulation | undefined {
  const { baseAmount, limitPrice } = useLimitFormState(chainId);
  const { t } = useTranslation();

  const currentPair = useCurrentPairByDevice(chainId);
  const limitSimulation = useAppSelector(selectLimitSimulation(chainId));
  const sdkContext = useSDK(chainId);
  const [minAmount, setMinAmount] = useState<BigNumber | undefined>(undefined);

  useAsyncEffect(async () => {
    if (currentPair) {
      if (WrappedBigNumber.from(limitPrice || 0).lte(0)) return;
      const price = getAdjustTradePrice(WrappedBigNumber.from(limitPrice || 0), !!currentPair?.isInverse);
      const result = alignPriceToTick(
        // currentPair.instrumentAddr,
        price.wadValue,
        // WrappedBigNumber.from(limitPrice || currentPair?.fairPrice || 0).wadValue,
      );
      if (result) {
        const price = TickMath.getWadAtTick(result.tick);
        if (price.gt(0)) {
          const min = wdiv(currentPair.rootInstrument.minOrderValue, price);
          setMinAmount(min);
        }
      }
    }
  }, [currentPair?.isInverse, limitPrice, sdkContext]);

  return useMemo(() => {
    try {
      const baseAmountWad = baseAmount ? toWad(baseAmount) : undefined;
      if (baseAmountWad && baseAmountWad.eq(0)) {
        return;
      }
      return {
        ...limitSimulation,
        message:
          baseAmountWad && baseAmountWad.lt(minAmount || 0)
            ? t('common.tradePage.lessThanMinOrder', {
                orderValue: WrappedBigNumber.from(minAmount || 0).formatDisplayNumber({
                  roundingMode: BN.ROUND_UP,
                }),
                base: currentPair?.rootInstrument.baseToken.symbol,
              })
            : t(limitSimulation?.message || ''),
      };
    } catch (error) {
      return undefined;
    }
  }, [baseAmount, currentPair?.rootInstrument.baseToken.symbol, limitSimulation, minAmount, t]);
}
export function useMarketSimulationRaw(chainId: CHAIN_ID | undefined): ISimulation | undefined {
  const markSimulation = useAppSelector(selectMarketSimulation(chainId));
  return useMemo(() => markSimulation, [markSimulation]);
}
export function useMarketSimulation(chainId: CHAIN_ID | undefined): ISimulation | undefined {
  const dispatch = useAppDispatch();
  const { baseAmount, tradeSide, leverage, marginAmount } = useMarketFormState(chainId);

  const { t } = useTranslation();
  const currentPair = useCurrentPairByDevice(chainId);
  const userAddr = useUserAddr();
  const markSimulation = useAppSelector(selectMarketSimulation(chainId));
  const sdkContext = useSDK(chainId);
  const position = useMainPosition(chainId, userAddr, currentPair?.id);
  const [minAmount, setMinAmount] = useState(toWad(0));
  const [minSimulate, setMinSimulate] = useState<ISimulation | undefined>(undefined);
  const { slippage } = useGlobalConfig(chainId);
  const maxLeverage = useTradeMaxLeverage(currentPair?.maxLeverage);
  const leverageType = useLeverageAdjustType(chainId);

  const isTradeByLeverage = useMemo(() => {
    return leverageType === LEVERAGE_ADJUST_TYPE.BY_LEVERAGE;
  }, [leverageType]);

  const getMinAmount = useCallback(async () => {
    if (position?.hasPosition) {
      setMinAmount(toWad(0));
    } else if (sdkContext && currentPair) {
      // try {
      //   // const adjustTradeSide = getAdjustTradeSide(tradeSide, currentPair.isInverse);
      //   const adjustTradeSide = tradeSide;
      //   const { baseAmount } = await sdkContext?.perp?.observer.inquireByQuote(
      //     currentPair.instrumentAddr,
      //     currentPair.expiry,
      //     adjustTradeSide,
      //     currentPair?.rootInstrument.minTradeValue,
      //   );

      //   setMinAmount(baseAmount);
      // } catch (error) {
      //   const baseAmount = await calcBaseSizeByQuote(
      //     currentPair?.rootInstrument.minTradeValue,
      //     currentPair.fairPrice,
      //     currentPair.isInverse,
      //   );
      //   baseAmount && setMinAmount(baseAmount.wadValue);
      // }
      const baseAmount = await calcBaseSizeByQuote(
        currentPair?.rootInstrument.minTradeValue,
        currentPair.fairPrice,
        currentPair.isInverse,
      );
      baseAmount && setMinAmount(baseAmount.wadValue);
    }
  }, [currentPair, position?.hasPosition, sdkContext, tradeSide]);
  useAsyncEffect(async () => {
    await getMinAmount();
  }, [getMinAmount, position?.hasPosition]);

  useDebounceEffect(
    () => {
      if (position && !position?.hasPosition && isTradeByLeverage) {
        const amountBN = WrappedBigNumber.from(baseAmount || 0);
        if (chainId && minAmount.gt(0) && amountBN.gt(0) && amountBN.wadValue.lte(minAmount)) {
          userAddr &&
            dispatch(
              simulateMarketTrade({
                chainId,
                sdkContext,
                position: position,
                base: WrappedBigNumber.from(minAmount || 0).stringValue,
                margin: undefined,
                leverage: leverage,
                tradeSide,
                slippage: Number(slippage),
                userAddr,
                maxLeverage,
                onlyCallFuncMode: true,
              }),
            )
              .unwrap()
              .then((res) => {
                res && setMinSimulate(res);
              });
        }
      }
      // return () => {
      //   setMinSimulate(undefined);
      // };
    },
    [currentPair?.id, dispatch, leverage, minAmount, position, sdkContext, slippage, tradeSide, userAddr, baseAmount],
    { wait: 500 },
  );

  return useMemo(() => {
    let message = markSimulation?.message;
    const baseWad = baseAmount ? toWad(baseAmount || 0) : undefined;
    if (baseWad && baseWad.eq(0)) {
      return;
    }

    if (baseWad && baseWad.lt(minAmount || 0)) {
      message = t(
        isTradeByLeverage && minSimulate?.data?.margin
          ? 'common.tradePage.lessThanMinTradeWithLeverage'
          : 'common.tradePage.lessThanMinTrade',
        {
          tradeValue: WrappedBigNumber.from(minAmount || 0).formatDisplayNumber({
            roundingMode: BN.ROUND_UP,
          }),
          base: currentPair?.rootInstrument.baseToken.symbol,
          minMargin: minSimulate?.data?.margin?.formatDisplayNumber(),
          baseValue: calcTradeValue(minAmount, currentPair?.fairPrice || 1, currentPair?.isInverse || false)
            .mul(currentPair?.rootInstrument?.quoteToken?.price || 0)
            .formatDisplayNumber(),
          quote: currentPair?.rootInstrument.quoteToken.symbol,
          leverage: WrappedBigNumber.from(minSimulate?.data?.leverage || 0).formatLeverageString(),
        },
      );
      return {
        ...markSimulation,
        message,
      };
    }
    // const dynamic = getSavedPairLeverage(userAddr, chainId, currentPair?.id, DYNAMIC);

    if (baseAmount) {
      if (
        marginAmount &&
        markSimulation?.data?.margin &&
        markSimulation.data.margin.gt(0) &&
        markSimulation.data.margin.gt(marginAmount)
      ) {
        return {
          chainId,
          message: t('common.tradePage.lessThanMinMargin', {
            margin: markSimulation.data.margin.formatDisplayNumber({
              roundingMode: BN.ROUND_UP,
            }),
            quote: currentPair?.rootInstrument.quoteToken.symbol,
          }),
        };
      }
      return {
        ...markSimulation,
        message,
      };
    } else {
      return chainId ? getDefaultSimulation(chainId) : undefined;
    }

    // must depend on minAmount._hex
  }, [
    markSimulation,
    baseAmount,
    minAmount?._hex,
    t,
    isTradeByLeverage,
    minSimulate?.data?.margin,
    minSimulate?.data?.leverage,
    currentPair?.rootInstrument.baseToken.symbol,
    currentPair?.rootInstrument.quoteToken?.price,
    currentPair?.rootInstrument.quoteToken.symbol,
    marginAmount,
    chainId,
  ]);
}

export function useCloseSimulation(chainId: CHAIN_ID | undefined): ISimulation | undefined {
  const closeSimulation = useAppSelector(selectCloseSimulation(chainId));

  return useMemo(() => closeSimulation, [closeSimulation]);
}
export function useCloseSimulationStatus(chainId: CHAIN_ID | undefined): FETCHING_STATUS {
  const closeSimulationStatus = useAppSelector(selectCloseSimulationStatus(chainId));

  return useMemo(() => closeSimulationStatus, [closeSimulationStatus]);
}

export function usePnsShareParams(chainId: CHAIN_ID | undefined): IPnlParams | undefined {
  const params = useAppSelector(selectPnlShare(chainId));
  return useMemo(() => params, [params]);
}
export function useCancelFormState(chainId: CHAIN_ID | undefined): ICancelFormState {
  const cancelFormState = useAppSelector(selectCancelFormState(chainId));
  return useMemo(() => cancelFormState || {}, [cancelFormState]);
}

export function useCancelFormStatus(chainId: CHAIN_ID | undefined): IOrderCancelStatus | undefined {
  const cancelFormStatus = useAppSelector(selectCancelFormStatus(chainId));

  return useMemo(() => cancelFormStatus, [cancelFormStatus]);
}
export function useBulkCancelStatus(chainId: CHAIN_ID | undefined): boolean | undefined {
  const status = useAppSelector(selectBulkCancelStatus(chainId));

  return useMemo(() => status, [status]);
}
export function useCancelItems(
  chainId: CHAIN_ID | undefined,
  userAddr: string | undefined,
  pairId: string | undefined,
): WrappedOrder[] | undefined {
  const orders = useWrappedOrderList(chainId, userAddr, pairId);
  const { ids } = useCancelFormState(chainId);
  return useMemo(() => {
    return orders?.filter((p) => ids?.includes(p.id));
  }, [ids, orders]);
}
export function useCurrentFutures(chainId: CHAIN_ID | undefined): InstrumentInfo {
  const currentFuture = useAppSelector(selectCurrentFutures(chainId));

  return useMemo(() => currentFuture || {}, [currentFuture]);
}
// History related tab use useTradePortfolioTab, Non History related tab use useSetTradePortfolioTab
export function useTradePortfolioTab(): TABLE_TYPES {
  return useAppSelector(selectTradePortfolioTab);
}

export function useIsChosenOrder(): boolean {
  return useAppSelector(selectIsChosenOrder);
}

export function useChartDuration(chainId: CHAIN_ID | undefined): KlineInterval {
  const chartDuration = useAppSelector(selectChartDurationByChainId(chainId));
  const dappConfig = useBackendChainConfig(chainId);
  return useMemo(() => {
    if (!chartDuration) {
      return (dappConfig?.trade?.klineInterval?.default as KlineInterval) || KlineInterval.HOUR;
    }
    return chartDuration;
  }, [chartDuration, dappConfig?.trade?.klineInterval?.default]);
}

export function useFundingChartDuration(chainId: CHAIN_ID | undefined): FundingChartInterval {
  const chartDuration = useAppSelector(selectFundingChartDurationByChainId(chainId));
  const dappConfig = useBackendChainConfig(chainId);
  return useMemo(() => {
    const defaultInterval =
      (dappConfig?.trade.fundingChartInterval.default as FundingChartInterval) || FundingChartInterval.HOUR;
    if (!chartDuration) {
      return defaultInterval;
    }
    return chartDuration;
  }, [chartDuration, dappConfig?.trade.fundingChartInterval.default]);
}

export function useStepRatio(chainId: CHAIN_ID | undefined): number {
  const stepRatio = useAppSelector(selectStepRatioByChainId(chainId));
  return stepRatio;
}

export function useSimulationBalanceChange(
  chainId: CHAIN_ID | undefined,
  marginToken: TokenInfo | undefined,
): {
  isShowVaultChange: boolean;
  isShowBalanceChange: boolean;
  gateBalanceBefore: WrappedBigNumber | undefined;
  gateBalanceAfter: WrappedBigNumber | undefined;
  walletBalanceBefore: WrappedBigNumber | undefined;
  walletBalanceAfter: WrappedBigNumber | undefined;
  isShowTotalBalanceChange: boolean;
  totalBalanceBefore: WrappedBigNumber | undefined;
  totalBalanceAfter: WrappedBigNumber | undefined;
} {
  const { pathname } = useLocation();
  const tradeTypeOrigin = useTradeType(chainId);
  const tradeDrawerType = useTradeDrawerType(chainId);
  // adapt for mobile trade drawer
  const tradeType = useMemo(() => {
    if (tradeDrawerType) {
      return tradeDrawerType;
    }
    return tradeTypeOrigin;
  }, [tradeDrawerType, tradeTypeOrigin]);
  const earnType = useEarnFormType(chainId);
  const gateBalance = useTokenGateBalanceByChainIdAndAddress(chainId, marginToken?.address);
  const walletBalance = useTokenBalance(marginToken?.address, chainId);
  const adjustMarginSimulation = useAdjustMarginSimulation(chainId);
  const marketSimulation = useMarketSimulation(chainId);
  const limitSimulation = useLimitSimulationRaw(chainId);
  const scaleLimitSimulation = useScaleSimulation(chainId);
  const addLiquiditySimulation = useAddLiquidationSimulationData(chainId);
  const removeLiquiditySimulation = useRemoveLiquidationSimulation(chainId);
  const closeSimulation = useCloseSimulation(chainId);
  const crossMarginSimulation = useCrossMarketSimulation(chainId);
  const canPlaceCrossMarketOrder = useCanPlaceCrossMarketOrder(chainId);

  //  const simulation = useMemo(() => {
  //   if (tradeType === TRADE_TYPE.MARKET) {
  //     return marketSimulation;
  //   }
  //   else if (tradeType === TRADE_TYPE.LIMIT) {
  //     return limitSimulation;
  //   }else if (tradeType === TRADE_TYPE.ADJUST_MARGIN) {
  //     return adjustMarginSimulation;

  //   }
  //  }, [adjustMarginSimulation, limitSimulation, marketSimulation, tradeType]);

  const transferAmountWad = useMemo(() => {
    if (pathname.includes('/earn')) {
      if (earnType === EARN_TYPE.ADD_LIQ) return addLiquiditySimulation?.data?.margin?.wadValue;
      if (earnType === EARN_TYPE.REMOVE_LIQ) return removeLiquiditySimulation?.data?.margin?.wadValue;
    } else if (tradeType === TRADE_TYPE.MARKET) {
      return marketSimulation?.data?.margin.wadValue;
    } else if (tradeType === TRADE_TYPE.LIMIT) {
      return canPlaceCrossMarketOrder
        ? crossMarginSimulation?.data?.margin.wadValue
        : limitSimulation?.data?.margin?.wadValue;
    } else if (tradeType === TRADE_TYPE.SCALE_LIMIT) {
      return scaleLimitSimulation?.data?.margin?.wadValue;
    } else if (tradeType === TRADE_TYPE.ADJUST_MARGIN) {
      return adjustMarginSimulation?.data?.transferAmount;
    } else if (tradeType === TRADE_TYPE.CLOSE_POSITION) {
      return closeSimulation?.data?.margin.wadValue;
    }
  }, [
    pathname,
    tradeType,
    earnType,
    addLiquiditySimulation?.data?.margin?.wadValue,
    removeLiquiditySimulation?.data?.margin?.wadValue,
    marketSimulation?.data?.margin.wadValue,
    canPlaceCrossMarketOrder,
    crossMarginSimulation?.data?.margin.wadValue,
    limitSimulation?.data?.margin?.wadValue,
    scaleLimitSimulation?.data?.margin?.wadValue,
    adjustMarginSimulation?.data?.transferAmount,
    closeSimulation?.data?.margin.wadValue,
  ]);

  const marginToDepositWad = useMemo(() => {
    if (pathname.includes('/earn') && earnType === EARN_TYPE.ADD_LIQ) {
      return addLiquiditySimulation?.data?.marginToDeposit?.wadValue;
    } else if (tradeType === TRADE_TYPE.MARKET) {
      return marketSimulation?.data?.marginToDeposit?.wadValue;
    } else if (tradeType === TRADE_TYPE.LIMIT) {
      return canPlaceCrossMarketOrder
        ? crossMarginSimulation?.data?.marginToDeposit.wadValue
        : limitSimulation?.data?.marginToDeposit.wadValue;
    } else if (tradeType === TRADE_TYPE.SCALE_LIMIT) {
      return scaleLimitSimulation?.data?.marginToDeposit.wadValue;
    } else if (tradeType === TRADE_TYPE.ADJUST_MARGIN) {
      return adjustMarginSimulation?.data?.marginToDepositWad;
    } else if (tradeType === TRADE_TYPE.CLOSE_POSITION) {
      return closeSimulation?.data?.marginToDeposit?.wadValue;
    }
  }, [
    addLiquiditySimulation?.data?.marginToDeposit?.wadValue,
    adjustMarginSimulation?.data?.marginToDepositWad,
    canPlaceCrossMarketOrder,
    closeSimulation?.data?.marginToDeposit?.wadValue,
    crossMarginSimulation?.data?.marginToDeposit.wadValue,
    earnType,
    limitSimulation?.data?.marginToDeposit,
    marketSimulation?.data?.marginToDeposit?.wadValue,
    pathname,
    scaleLimitSimulation?.data?.marginToDeposit,
    tradeType,
  ]);

  const gateBalanceBefore = useMemo(() => {
    return gateBalance?.balance;
  }, [gateBalance?.balance]);

  const tokenBalanceBefore = useMemo(() => {
    return walletBalance;
  }, [walletBalance]);

  const totalBalanceBefore = useMemo(() => {
    return gateBalanceBefore?.add(tokenBalanceBefore || 0);
  }, [tokenBalanceBefore, gateBalanceBefore]);

  const totalBalanceAfter = useMemo(() => {
    const after = gateBalanceBefore?.add(tokenBalanceBefore || 0)?.min(transferAmountWad || 0);

    if (after?.lt(WrappedBigNumber.ZERO)) {
      return WrappedBigNumber.ZERO;
    }
    return after;
  }, [tokenBalanceBefore, transferAmountWad, gateBalanceBefore]);

  const gateBalanceAfter = useMemo(() => {
    if (totalBalanceAfter?.eq(0)) {
      return WrappedBigNumber.ZERO;
    }
    if (gateBalanceBefore) {
      const gateChange = transferAmountWad?.sub(marginToDepositWad || 0);

      if (gateBalanceBefore.lt(WrappedBigNumber.from(gateChange || 0))) {
        return WrappedBigNumber.ZERO;
      }
      return gateBalanceBefore.min(WrappedBigNumber.from(gateChange || 0));
    }
  }, [marginToDepositWad, totalBalanceAfter, transferAmountWad, gateBalanceBefore]);

  const isShowVaultChange = useMemo(() => {
    return (
      (gateBalanceAfter?.notEq(gateBalanceBefore || 0) && (gateBalanceBefore?.gt(0) || gateBalanceAfter?.gt(0))) ||
      false
    );
  }, [gateBalanceBefore, gateBalanceAfter]);

  const tokenBalanceAfter = useMemo(() => {
    if (totalBalanceAfter?.eq(0)) {
      return WrappedBigNumber.ZERO;
    }
    const after = tokenBalanceBefore?.min(WrappedBigNumber.from(marginToDepositWad || 0));
    if (after?.lt(WrappedBigNumber.ZERO)) {
      return WrappedBigNumber.ZERO;
    }
    return after;
  }, [marginToDepositWad, tokenBalanceBefore, totalBalanceAfter]);

  const isShowBalanceChange = useMemo(() => {
    return (tokenBalanceBefore?.notEq(tokenBalanceAfter) && tokenBalanceBefore?.gt(0)) || false;
  }, [tokenBalanceBefore, tokenBalanceAfter]);

  const isShowTotalBalanceChange = useMemo(() => {
    return isShowVaultChange || isShowBalanceChange;
  }, [isShowBalanceChange, isShowVaultChange]);

  return {
    isShowVaultChange,
    isShowBalanceChange,
    gateBalanceBefore,
    gateBalanceAfter,
    walletBalanceBefore: tokenBalanceBefore,
    walletBalanceAfter: tokenBalanceAfter,
    isShowTotalBalanceChange,
    totalBalanceBefore,
    totalBalanceAfter,
  };
}

export function useLimitPriceChangeWhenOutOfRange(
  chainId: CHAIN_ID | undefined,
  priceInputFocused: boolean,
  isTurnOnCrossMarket?: boolean,
) {
  const { limitPrice: LimitPriceInput, tradeSide } = useLimitFormState(chainId);
  const currentPair = useCurrentPairByDevice(chainId);
  const dispatch = useAppDispatch();
  const sdkContext = useSDK(chainId);
  const [lowerPrice, upperPrice] = usePairLimitPriceRange(currentPair, tradeSide, sdkContext, isTurnOnCrossMarket);
  // When lowerPrice, upperPrice change and user didn't focus price input, change range
  useEffect(() => {
    if (!priceInputFocused) {
      changelimitPriceWhenOutOfRange();
    }
  }, [lowerPrice, upperPrice, priceInputFocused]);
  const lowerPriceChecked = useMemo(
    () => WrappedBigNumber.from(inputNumChecker(lowerPrice?.stringValue || '', currentPair?.priceDecimal) || ''),
    [currentPair?.priceDecimal, lowerPrice?.stringValue],
  );
  const upperPriceChecked = useMemo(
    () => WrappedBigNumber.from(inputNumChecker(upperPrice?.stringValue || '', currentPair?.priceDecimal) || ''),
    [currentPair?.priceDecimal, upperPrice?.stringValue],
  );
  const changelimitPriceWhenOutOfRange = useCallback(() => {
    let updatedLimitPrice: WrappedBigNumber | undefined = undefined;
    if (LimitPriceInput && currentPair && sdkContext) {
      const adjustTradeSide = tradeSide;
      if (adjustTradeSide === Side.LONG) {
        if (lowerPriceChecked?.gt(LimitPriceInput)) {
          updatedLimitPrice = lowerPrice;
        }
        if (upperPriceChecked?.lt(LimitPriceInput)) {
          updatedLimitPrice = upperPrice;
        }
      }
      if (adjustTradeSide === Side.SHORT) {
        if (lowerPriceChecked?.gt(LimitPriceInput)) {
          updatedLimitPrice = lowerPrice;
        }
        if (upperPriceChecked?.lt(LimitPriceInput)) {
          updatedLimitPrice = upperPrice;
        }
      }
    }
    if (updatedLimitPrice && chainId) {
      dispatch(
        setLimitPrice({
          chainId,
          limitPrice: updatedLimitPrice?.stringValue,
          alignedPrice: updatedLimitPrice?.stringValue,
        }),
      );
    }
  }, [
    chainId,
    currentPair,
    LimitPriceInput,
    dispatch,
    lowerPrice,
    lowerPriceChecked,
    sdkContext,
    tradeSide,
    upperPrice,
    upperPriceChecked,
  ]);

  return changelimitPriceWhenOutOfRange;
}
export function useScaleLimitPriceChangeWhenOutOfRange(chainId: CHAIN_ID | undefined, priceInputFocused: boolean) {
  const { lowerPrice: lowerInput, upperPrice: upperInput, tradeSide } = useScaleFormState(chainId);
  const currentPair = useCurrentPairByDevice(chainId);
  const dispatch = useAppDispatch();
  const sdkContext = useSDK(chainId);
  const [lowerPrice, upperPrice] = usePairLimitPriceRange(currentPair, tradeSide, sdkContext);
  // When lowerPrice, upperPrice change and user didn't focus price input, change range
  useEffect(() => {
    if (!priceInputFocused) {
      changeLimitPriceWhenOutOfRange();
    }
  }, [lowerPrice, upperPrice, priceInputFocused]);
  const lowerPriceChecked = useMemo(
    () => WrappedBigNumber.from(inputNumChecker(lowerPrice?.stringValue || '', currentPair?.priceDecimal) || ''),
    [currentPair?.priceDecimal, lowerPrice?.stringValue],
  );
  const upperPriceChecked = useMemo(
    () => WrappedBigNumber.from(inputNumChecker(upperPrice?.stringValue || '', currentPair?.priceDecimal) || ''),
    [currentPair?.priceDecimal, upperPrice?.stringValue],
  );
  const changeLimitPriceWhenOutOfRange = useCallback(() => {
    let updatedLowerPrice: WrappedBigNumber | undefined = lowerInput ? WrappedBigNumber.from(lowerInput) : undefined;
    let updatedUpperPrice: WrappedBigNumber | undefined = upperInput ? WrappedBigNumber.from(upperInput) : undefined;
    if (lowerInput && currentPair && sdkContext) {
      if (lowerPriceChecked?.gt(lowerInput)) {
        updatedLowerPrice = lowerPrice;
      }
      if (upperPriceChecked?.lt(upperInput)) {
        updatedUpperPrice = upperPrice;
      }
    }
    if (updatedLowerPrice && chainId && updatedUpperPrice) {
      dispatch(
        setScaleLimitPrice({
          chainId,
          lowerPrice: updatedLowerPrice?.stringValue,
          alignedLowerPrice: updatedLowerPrice?.stringValue,
          upperPrice: updatedUpperPrice.stringValue,
          alignedUpperPrice: updatedUpperPrice.stringValue,
        }),
      );
    }
  }, [
    lowerInput,
    upperInput,
    currentPair,
    sdkContext,
    chainId,
    lowerPriceChecked,
    upperPriceChecked,
    lowerPrice,
    upperPrice,
    dispatch,
  ]);

  return changeLimitPriceWhenOutOfRange;
}

export function useLimitPriceWarning(
  chainId: CHAIN_ID | undefined,
): { msg: string; price: WrappedBigNumber | undefined } | undefined {
  const { limitPrice, tradeSide } = useLimitFormState(chainId);
  const currentPair = useCurrentPairByDevice(chainId);
  const { t } = useTranslation();
  const sdkContext = useSDK(chainId);
  const [lowerPrice, upperPrice] = usePairLimitPriceRange(currentPair, tradeSide, sdkContext);
  const lowerPriceChecked = useMemo(
    () => WrappedBigNumber.from(inputNumChecker(lowerPrice?.stringValue || '', currentPair?.priceDecimal) || ''),
    [currentPair?.priceDecimal, lowerPrice?.stringValue],
  );
  const upperPriceChecked = useMemo(
    () => WrappedBigNumber.from(inputNumChecker(upperPrice?.stringValue || '', currentPair?.priceDecimal) || ''),
    [currentPair?.priceDecimal, upperPrice?.stringValue],
  );
  const limitPriceMsg = useMemo(() => {
    if (limitPrice && currentPair && sdkContext) {
      const adjustTradeSide = tradeSide;
      if (adjustTradeSide === Side.LONG) {
        if (lowerPriceChecked?.gt(limitPrice)) {
          return { msg: t('errors.trade.useMin'), price: lowerPrice };
        }
        if (upperPriceChecked?.lt(limitPrice)) {
          return { msg: t('errors.trade.useBest'), price: upperPrice };
        }
      }
      if (adjustTradeSide === Side.SHORT) {
        if (lowerPriceChecked?.gt(limitPrice)) {
          return { msg: t('errors.trade.useBestAsk'), price: lowerPrice };
        }
        if (upperPriceChecked?.lt(limitPrice)) {
          return { msg: t('errors.trade.useMaxAsk'), price: upperPrice };
        }
      }
    }
    return undefined;
  }, [limitPrice, currentPair, sdkContext, tradeSide, lowerPriceChecked, upperPriceChecked, t, lowerPrice, upperPrice]);
  return limitPriceMsg;
}
export function useLeverageInputWarningMessage(simulation: ISimulation): string | undefined {
  const { t } = useTranslation();
  if (
    WrappedBigNumber.from(simulation.data?.simulationMainPosition.leverageWad || 0).gt(TRADE_LEVERAGE_THRESHOLDS.MAX)
  ) {
    return t('common.tradePage.leverageMoreThan');
  }
  return undefined;
}

export function useSimulationAdditionalFeeUSD(
  simulation: ISimulationData | undefined,
  coinPrice: WrappedBigNumber | undefined,
): WrappedBigNumber {
  const tradeFeeUSD = useMemo(() => {
    if (coinPrice && simulation?.additionalFee) {
      return simulation?.additionalFee.mul(coinPrice);
    }
    return WrappedBigNumber.ZERO;
  }, [coinPrice, simulation?.additionalFee]);

  return tradeFeeUSD;
}

export function useTradeDefaultLeverage(maxLeverage: number | undefined): number {
  return useMemo(() => {
    if (maxLeverage) {
      return Math.floor(maxLeverage / 2);
    }
    return TRADE_LEVERAGE_THRESHOLDS.DEFAULT;
  }, [maxLeverage]);
}

export function useTradeMaxLeverage(maxLeverage: number | undefined): number {
  return useMemo(() => maxLeverage ?? TRADE_LEVERAGE_THRESHOLDS.DEFAULT, [maxLeverage]);
}
export function usePairStepRatios(imr = DEFAULT_IMR, withBaseBPs = false): number[] {
  return useMemo(() => (withBaseBPs ? getScaleLimitStepRatio(imr) : getImrStepRatio(imr)), [imr, withBaseBPs]);
}
export function usePairLeverageSwitchChecked(
  chainId: number | undefined,
  userAddr: string | undefined,
  pairId: string | undefined,
): boolean {
  return useAppSelector(selectPairLeverageSwitchChecked(chainId, userAddr, pairId));
}
export function useLeverageAdjustType(chainId: CHAIN_ID | undefined): LEVERAGE_ADJUST_TYPE {
  const tradeType = useTradeType(chainId);
  const marketFormState = useMarketFormState(chainId);
  return useMemo(
    () =>
      tradeType === TRADE_TYPE.MARKET
        ? marketFormState.leverageAdjustType || LEVERAGE_ADJUST_TYPE.BY_LEVERAGE
        : LEVERAGE_ADJUST_TYPE.BY_LEVERAGE,
    [marketFormState.leverageAdjustType, tradeType],
  );
}

/**
 * Checks if a cross-market order can be placed.
 * @param isTurnOnCrossMarket - A boolean indicating whether cross-market trading is turned on.
 * @param pair - The wrapped pair object representing the trading pair.
 * @param targetPrice - The target price for the order.
 * @param side - The side of the order (buy or sell).
 * @returns A boolean indicating whether a cross-market order can be placed.
 */
export function useCanPlaceCrossMarketOrder(chainId: CHAIN_ID | undefined): boolean {
  const { limitPrice, isTurnOnCrossMarket } = useLimitFormState(chainId);
  const currentPair = useCurrentPairByDevice(chainId);
  const tradeSide = useTradeSide(chainId);
  return useMemo(() => {
    if (!currentPair?.fairPrice || !limitPrice) return false;
    return isUsePlaceCrossMarketOrder(
      currentPair?.wrapAttribute('fairPrice'),
      WrappedBigNumber.from(limitPrice),
      tradeSide,
      isTurnOnCrossMarket || false,
    );
  }, [isTurnOnCrossMarket, currentPair?.fairPrice?._hex, tradeSide, limitPrice]);
}

export function useCallSimulateCrossMarketOrder({
  chainId,
  userAddr,
  tradeSide,
  currentPair,
  baseAmount,
  limitPrice,
  onlyCallFuncMode,
}: {
  chainId: CHAIN_ID | undefined;
  userAddr: string | undefined;
  tradeSide: Side;
  currentPair: WrappedPair | undefined;
  baseAmount: WrappedBigNumber | undefined;
  limitPrice: string | undefined;
  onlyCallFuncMode?: boolean;
}) {
  const dispatch = useAppDispatch();
  const sdkContext = useSDK(chainId);
  const currentPosition = useMainPosition(chainId, userAddr, currentPair?.id);
  const { slippage } = useGlobalConfig(chainId);

  return useCallback(
    (leverage: string) => {
      if (sdkContext && chainId && limitPrice)
        return dispatch(
          simulateCrossMarketOrder({
            chainId,
            sdkContext,
            base: WrappedBigNumber.from(baseAmount || 0),
            tradeSide,
            limitPrice: limitPrice,
            position: currentPosition,
            leverage: leverage ? WrappedBigNumber.from(leverage) : undefined,
            slippage: Number(slippage),
            onlyCallFuncMode,
          }),
        ).unwrap();
    },
    [baseAmount, chainId, currentPosition, dispatch, limitPrice, onlyCallFuncMode, sdkContext, slippage, tradeSide],
  );
}

export function useCrossMarketSimulation(chainId: CHAIN_ID | undefined): ICrossMarketOrderSimulation | undefined {
  const { baseAmount } = useLimitFormState(chainId);
  const { t } = useTranslation();

  const currentPair = useCurrentPairByDevice(chainId);
  const crossMarginSimulation = useAppSelector(selectCrossMarketSimulation(chainId));
  const canPlaceCrossMarketOrder = useCanPlaceCrossMarketOrder(chainId);
  const availableTokenBalance = useAvailableTokenBalance(currentPair?.rootInstrument.quoteToken.address, chainId, true);

  const minAmount = useMemo(() => {
    return crossMarginSimulation?.data?.totalMinSize;
  }, [crossMarginSimulation?.data?.totalMinSize]);

  return useMemo(() => {
    try {
      const baseAmountWad = baseAmount ? toWad(baseAmount) : undefined;
      if (baseAmountWad && baseAmountWad.eq(0)) {
        return;
      }
      if (!canPlaceCrossMarketOrder) return;
      if (baseAmountWad && WrappedBigNumber.from(baseAmountWad).lt(minAmount || 0)) {
        return {
          ...crossMarginSimulation,
          errorData: undefined,
          data: undefined,
          message: t('common.tradePage.lessThanMinOrder', {
            orderValue: WrappedBigNumber.from(minAmount || 0).formatDisplayNumber({
              roundingMode: BN.ROUND_UP,
            }),
            base: currentPair?.rootInstrument.baseToken.symbol,
          }),
        };
      }
      if (crossMarginSimulation?.data?.margin?.gt(0)) {
        const balance = availableTokenBalance;
        if (balance) {
          if (crossMarginSimulation?.data?.margin.gt(balance)) {
            return {
              ...crossMarginSimulation,
              errorData: ERROR_MSG_EXCEED_WALLET_BALANCE.errorData,
              message: ERROR_MSG_EXCEED_WALLET_BALANCE.errorMsg,
            };
          }
        }
      }
      return crossMarginSimulation;
    } catch (error) {
      return undefined;
    }
  }, [
    baseAmount,
    canPlaceCrossMarketOrder,
    minAmount,
    crossMarginSimulation,
    t,
    currentPair?.rootInstrument.baseToken.symbol,
    // must use string value
    availableTokenBalance?.stringValue,
  ]);
}

export function useSimulateCrossMarketMinMarginAndAmount(
  chainId: CHAIN_ID | undefined,
): ICrossMarketOrderSimulation | undefined {
  const limitFormState = useLimitFormState(chainId);
  const userAddr = useUserAddr();

  const currentPair = useCurrentPairByDevice(chainId);
  const canPlaceCrossMarketOrder = useCanPlaceCrossMarketOrder(chainId);
  const [minSimulate, setMinSimulate] = useState<ICrossMarketOrderSimulation | undefined>(undefined);
  const callSimulateCrossMarketOrder = useCallSimulateCrossMarketOrder({
    chainId,
    userAddr,
    currentPair,

    baseAmount: WrappedBigNumber.from(1 / 1e18),
    limitPrice: limitFormState.limitPrice,
    tradeSide: limitFormState.tradeSide,
    onlyCallFuncMode: true,
  });

  useDebounceEffect(
    () => {
      if (!canPlaceCrossMarketOrder) {
        setMinSimulate(undefined);
      }

      if (currentPair && canPlaceCrossMarketOrder && chainId && userAddr && limitFormState.limitPrice) {
        const proms = callSimulateCrossMarketOrder(limitFormState?.leverage || '0');
        if (proms)
          proms.then((res) => {
            res && setMinSimulate(res);
          });
      }
      // return () => {
      //   setMinSimulate(undefined);
      // };
    },
    [currentPair?.id, limitFormState?.leverage, limitFormState?.tradeSide, userAddr, limitFormState?.limitPrice],
    { wait: 500 },
  );
  return minSimulate;
}
export function useTradeDefaultSide(currentPair: WrappedPair | undefined) {
  const dispatch = useAppDispatch();
  useEffect(() => {
    currentPair &&
      dispatch(
        setTradeFormSide({
          chainId: currentPair.chainId,
          tradeSide: currentPair?.fairPrice.gt(currentPair?.markPrice) ? Side.SHORT : Side.LONG,
        }),
      );
    // only the id
  }, [currentPair?.id]);
}

export function useUpdatePriceByTicks(): (lowerTick: number, upperTick: number, pair: WrappedPair) => void {
  const dispatch = useAppDispatch();
  const chainId = useChainId();
  const updatePricesByTicks = useCallback(
    (lowerTick: number, upperTick: number, pair: WrappedPair) => {
      if (!chainId) return;
      const newLowerPrice = WrappedBigNumber.from(TickMath.getWadAtTick(lowerTick));
      const checkedLowerValue = inputNumChecker(newLowerPrice.stringValue, pair?.priceDecimal);
      const newUpperPrice = WrappedBigNumber.from(TickMath.getWadAtTick(upperTick));
      const checkedUpperValue = inputNumChecker(newUpperPrice.stringValue, pair?.priceDecimal);
      dispatch(
        setScaleLimitPrice({
          chainId,
          lowerTick,
          lowerPrice: checkedLowerValue,
          alignedLowerPrice: checkedLowerValue,
          upperTick,
          upperPrice: checkedUpperValue,
          alignedUpperPrice: checkedUpperValue,
        }),
      );
    },
    [chainId, dispatch],
  );
  return updatePricesByTicks;
}
