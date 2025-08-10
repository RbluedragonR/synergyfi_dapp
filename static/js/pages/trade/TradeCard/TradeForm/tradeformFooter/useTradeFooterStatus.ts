import { usePnlShareNotification } from '@/components/PnlShareNotification';
import { GlobalModalType } from '@/constants';
import { TRADE_TYPE } from '@/constants/trade';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { WrappedPair } from '@/entities/WrappedPair';
import { useMainPosition } from '@/features/account/positionHook';
import { useTokenBalance } from '@/features/balance/hook';
import { useGlobalConfig, useToggleModal } from '@/features/global/hooks';
import {
  placeCrossMarketOrder,
  placeLimitOrder,
  setPairLeverageSwitchChecked,
  setPnlShare,
  trade,
} from '@/features/trade/actions';
import {
  useCanPlaceCrossMarketOrder,
  useCrossMarketSimulation,
  useLimitFormState,
  useLimitPriceWarning,
  useLimitSimulation,
  useMarketFormState,
  useMarketSimulation,
  useScaleSimulation,
  useTradeSide,
} from '@/features/trade/hooks';
import { useAppProvider, useSDK } from '@/features/web3/hook';
import { useAppDispatch } from '@/hooks';
import { usePriceBasisForPnl } from '@/hooks/usePriceBasisForPnl';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { useWalletSigner } from '@/hooks/web3/useWalletNetwork';
import { DYNAMIC } from '@/types/storage';
import { IPnlParams } from '@/types/trade';
import { savePairLeverage } from '@/utils/localstorage';
import { toWad } from '@/utils/numberUtil';
import { Side } from '@synfutures/sdks-perp';
import { BigNumber } from 'ethers';
import { useCallback, useMemo } from 'react';

export function useTradeFooterFormState(tradeType: TRADE_TYPE, currentPair: WrappedPair | undefined) {
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const toggleScaleLimitPreview = useToggleModal(GlobalModalType.ORDER_PREVIEW);
  const scaleLimitSimulation = useScaleSimulation(chainId);
  const limitSimulation = useLimitSimulation(chainId);
  const tradeSimulation = useMarketSimulation(chainId);
  const crossMarginSimulation = useCrossMarketSimulation(chainId);
  const canPlaceCrossMarketOrder = useCanPlaceCrossMarketOrder(chainId);
  const limitPriceMsg = useLimitPriceWarning(chainId);
  const provider = useAppProvider();
  const sdk = useSDK(chainId);
  const dispatch = useAppDispatch();
  const currentPosition = useMainPosition(chainId, userAddr, currentPair?.id);
  const { slippage, deadline } = useGlobalConfig(chainId);
  const signer = useWalletSigner();
  const marketFormState = useMarketFormState(chainId);
  const limitFormState = useLimitFormState(chainId);
  const tradeSide = useTradeSide(chainId);
  const { priceBasisForPnl } = usePriceBasisForPnl();
  const pnlShare = usePnlShareNotification();

  const tradePrice = useMemo(() => {
    if (tradeType === TRADE_TYPE.MARKET && tradeSimulation?.data?.tradePrice) {
      return tradeSimulation?.data?.tradePrice;
    } else if (tradeType === TRADE_TYPE.LIMIT) {
      return canPlaceCrossMarketOrder
        ? crossMarginSimulation?.data
          ? WrappedBigNumber.from(crossMarginSimulation?.data?.orderSimulation?.limitPrice || 0)
          : WrappedBigNumber.from(limitFormState.alignedPrice || 0)
        : limitSimulation?.data
        ? WrappedBigNumber.from(limitSimulation?.data?.limitPrice || limitFormState.alignedPrice || 0)
        : WrappedBigNumber.from(limitFormState.alignedPrice || 0);
    }
    return undefined;
  }, [
    canPlaceCrossMarketOrder,
    crossMarginSimulation?.data,
    limitFormState.alignedPrice,
    limitSimulation?.data,
    tradeSimulation?.data?.tradePrice,
    tradeType,
  ]);

  const marginToDeposit = useMemo(() => {
    if (tradeType === TRADE_TYPE.MARKET) {
      return tradeSimulation?.data?.marginToDeposit;
    } else if (tradeType === TRADE_TYPE.SCALE_LIMIT) {
      return scaleLimitSimulation?.data?.marginToDeposit;
    } else {
      return canPlaceCrossMarketOrder
        ? crossMarginSimulation?.data?.marginToDeposit
        : limitSimulation?.data?.marginToDeposit;
    }
  }, [
    tradeType,
    tradeSimulation?.data?.marginToDeposit,
    scaleLimitSimulation?.data?.marginToDeposit,
    canPlaceCrossMarketOrder,
    crossMarginSimulation?.data?.marginToDeposit,
    limitSimulation?.data?.marginToDeposit,
  ]);
  const walletBalance = useTokenBalance(currentPair?.rootInstrument?.quoteToken?.address, chainId);

  const walletNoBalance = useMemo(() => {
    return walletBalance.lt(marginToDeposit || 0);
  }, [marginToDeposit, walletBalance]);

  const isDisableBtn = useMemo(() => {
    if (walletNoBalance) return true;
    if (tradeType === TRADE_TYPE.LIMIT) {
      if (canPlaceCrossMarketOrder) return !!crossMarginSimulation?.message;
      return !!limitSimulation?.message || !!limitPriceMsg;
    }
    if (tradeType === TRADE_TYPE.SCALE_LIMIT) return !!scaleLimitSimulation?.message;

    return !!tradeSimulation?.message || tradeSimulation?.data?.additionalFee?.gt(0);
  }, [
    canPlaceCrossMarketOrder,
    crossMarginSimulation?.message,
    limitPriceMsg,
    limitSimulation?.message,
    scaleLimitSimulation?.message,
    tradeSimulation?.message,
    tradeType,
    walletNoBalance,
    tradeSimulation?.data?.additionalFee,
  ]);

  const onTradeMarket = useCallback(
    async (originalSize: BigNumber) => {
      if (!chainId || !userAddr || !sdk || !currentPair || !signer) return;
      if (tradeType === TRADE_TYPE.MARKET && tradeSimulation?.data) {
        // const pnlRatio = currentPosition?.getUnrealizedPnlPercentage(priceBasisForPnl);
        const hasPosition = currentPosition?.hasPosition;
        const currentSide = currentPosition?.wrappedSide;
        const positionAverageP = currentPosition?.wrapAttribute('entryPrice');
        const positionLeverage = currentPosition?.wrapAttribute('leverageWad');
        const positionSide = Side[currentPosition?.wrappedSide || Side.FLAT].toString();
        const pnlRatio = tradeSimulation.data.realized
          .div(tradeSimulation.data.estimatedTradeValue || 1)
          .mul(positionLeverage || 1);
        const result = await dispatch(
          trade({
            chainId,
            userAddr,
            signer,
            sdk: sdk,
            pair: currentPair,
            side: tradeSide,
            baseAmount: toWad(marketFormState.baseAmount),
            slippage: Number(slippage),
            deadline: Number(deadline),
            simulation: tradeSimulation,
            tradePrice: tradeSimulation?.data?.tradePrice,
            provider,
          }),
        ).unwrap();
        // set pair to dynamic when turning for zero to size after trading
        if (result && tradeType === TRADE_TYPE.MARKET && originalSize.eq(0)) {
          savePairLeverage(userAddr, chainId, currentPair?.id, DYNAMIC, DYNAMIC);
          chainId &&
            userAddr &&
            dispatch(setPairLeverageSwitchChecked({ chainId, userAddr, pairId: currentPair.id, checked: false }));
        }
        if (result?.status === 1 && hasPosition && currentSide !== tradeSide) {
          const pnlParams = {
            chainId,
            tradePrice: WrappedBigNumber.from(tradeSimulation?.data?.tradePrice),
            averagePrice: positionAverageP,
            pair: currentPair,
            pnl: tradeSimulation.data.realized,
            pnlRatio,
            leverage: positionLeverage,
            side: positionSide,
            tx: result?.transactionHash,
            size: WrappedBigNumber.from(marketFormState.baseAmount),
          } as IPnlParams;
          dispatch(setPnlShare(pnlParams));
          pnlShare(pnlParams);
        }
      }
    },
    [
      chainId,
      userAddr,
      sdk,
      currentPair,
      signer,
      tradeType,
      tradeSimulation,
      dispatch,
      tradeSide,
      marketFormState.baseAmount,
      slippage,
      deadline,
      provider,
      currentPosition,
      priceBasisForPnl,
      pnlShare,
    ],
  );

  const onTradeLimit = useCallback(async () => {
    if (!chainId || !userAddr || !sdk || !currentPair || !signer) return;
    if (tradeType === TRADE_TYPE.LIMIT && limitSimulation?.data) {
      dispatch(
        placeLimitOrder({
          chainId,
          signer,
          userAddr,
          sdkContext: sdk,
          pair: currentPair,
          simulation: limitSimulation?.data,
          deadline: Number(deadline),
          provider,
          side: tradeSide,
        }),
      );
    }
  }, [
    chainId,
    currentPair,
    deadline,
    dispatch,
    tradeSide,
    limitSimulation?.data,
    provider,
    sdk,
    signer,
    tradeType,
    userAddr,
  ]);

  const onTradeScaledLimit = useCallback(async () => {
    if (tradeType === TRADE_TYPE.SCALE_LIMIT && scaleLimitSimulation?.data) {
      toggleScaleLimitPreview(true);
      return;
    }
  }, [scaleLimitSimulation?.data, toggleScaleLimitPreview, tradeType]);

  const onTradeCrossMarket = useCallback(async () => {
    if (!chainId || !userAddr || !sdk || !currentPair || !signer) return;
    if (tradeType === TRADE_TYPE.LIMIT && crossMarginSimulation?.data) {
      dispatch(
        placeCrossMarketOrder({
          chainId,
          signer,
          userAddr,
          sdkContext: sdk,
          pair: currentPair,
          simulation: crossMarginSimulation?.data,
          provider,
          side: tradeSide,
          slippage: Number(slippage),
          deadline: Number(deadline),
        }),
      );
    }
  }, [
    chainId,
    crossMarginSimulation?.data,
    currentPair,
    deadline,
    dispatch,
    provider,
    sdk,
    signer,
    slippage,
    tradeSide,
    tradeType,
    userAddr,
  ]);

  return {
    marginToDeposit,
    isDisableBtn,
    tradePrice,
    onTradeMarket,
    onTradeLimit,
    onTradeScaledLimit,
    onTradeCrossMarket,
  };
}
