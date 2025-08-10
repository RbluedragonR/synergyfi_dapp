/**
 * @description Component-TradeMarketFormMobile
 */
import './index.less';

import { useDebounceFn } from 'ahooks';
import classNames from 'classnames';
import React, { FC, useCallback, useEffect } from 'react';

import { FETCHING_STATUS } from '@/constants';
import { TRADE_LEVERAGE_THRESHOLDS } from '@/constants/global';
import { TRADE_TYPE } from '@/constants/trade';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useMainPosition } from '@/features/account/positionHook';
import { useAvailableTokenBalance } from '@/features/balance/hook';
import { useGlobalConfig } from '@/features/global/hooks';
import { useCurrentPairFromUrl } from '@/features/pair/hook';
import {
  clearMarketTradeSimulation,
  setTradeFormLeverage,
  setTradeFormLeverageAndMargin,
  simulateMarketTrade,
} from '@/features/trade/actions';
import {
  useMarketFormState,
  useMarketFormStateStatus,
  useMarketSimulation,
  useTradeDefaultLeverage,
  useTradeDefaultSide,
  useTradeMaxLeverage,
  useTradeSide,
} from '@/features/trade/hooks';
import { useSDK } from '@/features/web3/hook';
import { useAppDispatch } from '@/hooks';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { DYNAMIC } from '@/types/storage';
import { getSavedPairLeverage, savePairLeverage } from '@/utils/localstorage';
import { toBN, toWad } from '@/utils/numberUtil';

import { useIsFetchedSinglePortfolio } from '@/features/portfolio/hook';
import TradeFormBaseMobile from '../TradeFormMobile/TradeFormbaseMobile';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const TradeMarketFormMobile: FC<IPropTypes> = function () {
  const dispatch = useAppDispatch();
  const chainId = useChainId();
  const tradeSide = useTradeSide(chainId);
  const marketFormState = useMarketFormState(chainId);
  const currentPair = useCurrentPairFromUrl(chainId);
  const sdkContext = useSDK(chainId);
  useTradeDefaultSide(currentPair);
  const maxLeverage = useTradeMaxLeverage(currentPair?.maxLeverage);
  const defaultLeverage = useTradeDefaultLeverage(maxLeverage);
  const userAddr = useUserAddr();
  const marketFormStatus = useMarketFormStateStatus(chainId);
  const currentPosition = useMainPosition(chainId, userAddr, currentPair?.id);
  const tradeSimulation = useMarketSimulation(chainId);
  const { slippage } = useGlobalConfig(chainId);
  const availableBalance = useAvailableTokenBalance(currentPair?.rootInstrument?.marginToken?.address, chainId, true);
  const isFetchedPortfolio = useIsFetchedSinglePortfolio(
    chainId,
    userAddr,
    currentPair?.instrumentAddr,
    currentPair?.expiry,
  );

  const fetchSimulation = useCallback(() => {
    if (chainId && currentPosition && sdkContext && userAddr) {
      if (WrappedBigNumber.from(marketFormState?.baseAmount).lte(0)) {
        dispatch(clearMarketTradeSimulation({ chainId }));
        return;
      }
      dispatch(
        simulateMarketTrade({
          chainId,
          sdkContext,
          position: currentPosition,
          // base: marketFormState.baseAmount,
          tradeSide,
          margin: '0',
          slippage: Number(slippage),
          userAddr,
          maxLeverage,
        }),
      );
    }
  }, [
    chainId,
    userAddr,
    currentPosition,
    sdkContext,
    marketFormState.baseAmount,
    dispatch,
    tradeSide,
    slippage,
    maxLeverage,
  ]);
  const fetchSimulationWitLeverage = useCallback(
    (leverage?: string) => {
      if (chainId && currentPosition && sdkContext && userAddr) {
        if (WrappedBigNumber.from(marketFormState?.baseAmount).lte(0)) {
          dispatch(clearMarketTradeSimulation({ chainId }));

          return;
        }
        const savedLeverage = getSavedPairLeverage(userAddr, chainId, currentPair?.id, TRADE_TYPE.MARKET);
        dispatch(
          simulateMarketTrade({
            chainId,
            sdkContext,
            position: currentPosition,
            // base: marketFormState.baseAmount,
            leverage: leverage || savedLeverage || marketFormState.leverage,
            tradeSide,
            slippage: Number(slippage),
            userAddr,
            maxLeverage,
          }),
        );
      }
    },
    [
      chainId,
      currentPosition,
      sdkContext,
      userAddr,
      marketFormState.baseAmount,
      marketFormState.leverage,
      currentPair?.id,
      dispatch,
      tradeSide,
      slippage,
      maxLeverage,
    ],
  );
  const { run: simulateTradeDebounced } = useDebounceFn(
    () => {
      fetchSimulation();
    },
    { wait: 400 },
  );
  const { run: simulateTradeWithLeverageDebounced } = useDebounceFn(
    (leverage?: string) => {
      fetchSimulationWitLeverage(leverage);
    },
    { wait: 400 },
  );

  const leverageChanged = useCallback(
    (leverage: string) => {
      if (chainId) {
        const baseWad = toWad(marketFormState.baseAmount || 0);

        dispatch(
          setTradeFormLeverageAndMargin({
            chainId,
            leverage: leverage,
            marginAmount: undefined,
          }),
        );
        // no simulation when base zero
        !baseWad.eq(0) && simulateTradeWithLeverageDebounced(leverage);
      }
    },
    [chainId, dispatch, marketFormState.baseAmount, simulateTradeWithLeverageDebounced],
  );
  const simulateFn = useCallback(() => {
    const dynamic = getSavedPairLeverage(userAddr, chainId, currentPosition?.rootPair.id, DYNAMIC);
    if (!toBN(marketFormState.baseAmount || 0).eq(0)) {
      if (dynamic) {
        simulateTradeDebounced();
      } else {
        simulateTradeWithLeverageDebounced();
      }
    }
  }, [
    chainId,
    currentPosition?.rootPair.id,
    marketFormState.baseAmount,
    simulateTradeDebounced,
    simulateTradeWithLeverageDebounced,
    userAddr,
  ]);

  const amountStrChanged = useCallback(() => {
    const dynamic = getSavedPairLeverage(userAddr, chainId, currentPair?.id, DYNAMIC);
    if (dynamic && currentPosition?.hasPosition) {
      simulateTradeDebounced();
    } else {
      simulateTradeWithLeverageDebounced();
    }
  }, [
    chainId,
    currentPair?.id,
    currentPosition?.hasPosition,
    simulateTradeDebounced,
    simulateTradeWithLeverageDebounced,
    userAddr,
  ]);

  useEffect(() => {
    simulateFn();
  }, [tradeSide]);

  useEffect(() => {
    if (
      chainId &&
      userAddr &&
      currentPair?.id &&
      isFetchedPortfolio &&
      maxLeverage !== TRADE_LEVERAGE_THRESHOLDS.DEFAULT
    ) {
      const leverageSaved = getSavedPairLeverage(userAddr, chainId, currentPosition?.rootPair.id, TRADE_TYPE.MARKET);
      let leverage =
        leverageSaved ||
        (currentPosition?.hasPosition
          ? currentPosition?.wrapAttribute('leverageWad').formatNormalNumberString(1)
          : defaultLeverage.toString());
      // make sure leverage is normal number
      if (WrappedBigNumber.from(leverage).lt(TRADE_LEVERAGE_THRESHOLDS.MIN)) {
        leverage = TRADE_LEVERAGE_THRESHOLDS.MIN.toString();
      }
      if (leverage !== leverageSaved && currentPosition?.rootPair.id) {
        savePairLeverage(userAddr, chainId, currentPosition?.rootPair.id, TRADE_TYPE.MARKET, leverage);
      }
      dispatch(
        setTradeFormLeverage({
          chainId,
          leverage,
        }),
      );
    }
    // must dep on all these
  }, [chainId, currentPosition?.rootPair.id, currentPosition?.id, isFetchedPortfolio, maxLeverage, defaultLeverage]);

  useEffect(() => {
    if (marketFormStatus !== FETCHING_STATUS.FETCHING) {
      // re simulate only when amount exists
      simulateFn();
    }
  }, [slippage]);

  useEffect(() => {
    if (marketFormStatus !== FETCHING_STATUS.FETCHING) {
      //  simulate when fairPrice change
      simulateFn();
    }
  }, [currentPair?.fairPrice._hex]);

  useEffect(() => {
    if (marketFormStatus !== FETCHING_STATUS.FETCHING) {
      //  simulate when balance change
      simulateFn();
    }
  }, [availableBalance?.stringValue]);

  return (
    <div className={classNames('syn-trade-market-form-mobile')}>
      <TradeFormBaseMobile
        price={currentPair?.fairPrice ? WrappedBigNumber.from(currentPair?.fairPrice).stringValue : undefined}
        state={marketFormState}
        baseToken={currentPair?.rootInstrument.baseToken}
        pair={currentPair}
        disabled={marketFormStatus === FETCHING_STATUS.FETCHING}
        tradeSide={tradeSide}
        leverageSwitched={() => {
          amountStrChanged();
        }}
        leverageChanged={leverageChanged}
        quoteToken={currentPair?.rootInstrument.quoteToken}
        amountStrChanged={amountStrChanged}
        showLeverageSwitch={currentPosition?.hasPosition}
        marginToken={currentPair?.rootInstrument.marginToken}
        simulationMessage={tradeSimulation?.message}
      />
    </div>
  );
};

export default TradeMarketFormMobile;
