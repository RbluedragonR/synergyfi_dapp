/**
 * @description Component-TradeMarketForm
 */
import // Trans,
'react-i18next';
import './index.less';

import { Side } from '@synfutures/sdks-perp';
import { useDebounceFn } from 'ahooks';
import { Form } from 'antd';
import classNames from 'classnames';
import React, { FC, useCallback, useEffect, useMemo } from 'react';

// import Alert from '@/components/Alert';
// import { ExternalLink } from '@/components/Link';
import { FETCHING_STATUS } from '@/constants';
import { TRADE_LEVERAGE_THRESHOLDS } from '@/constants/global';
// import { FAQ_LINKS } from '@/constants/links';
import { LEVERAGE_ADJUST_TYPE, TRADE_TYPE } from '@/constants/trade';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useMainPosition } from '@/features/account/positionHook';
import { useAvailableTokenBalance } from '@/features/balance/hook';
import { useGlobalConfig } from '@/features/global/hooks';
import { useCurrentPairFromUrl } from '@/features/pair/hook';
import {
  clearMarketTradeSimulation,
  setTradeFormLeverage,
  setTradeFormLeverageAndMargin,
  setTradeFormSide,
  setTradeFormType,
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
// import TradeMarginRequire from '@/pages/components/TradeMarginRequire';
import { getSavedPairLeverage, savePairLeverage } from '@/utils/localstorage';
// import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { toBN, toWad } from '@/utils/numberUtil';

import { useIsFetchedSinglePortfolio } from '@/features/portfolio/hook';
import { LEVERAGE_ADJUST } from '@/types/storage';
import TradeFormDetails from '../TradeDetail/TradeFormDetails';
import TradeFormAlert from '../TradeFormAlert';
import TradeFormBase from '../TradeFormBase';
import TradeFormSide from '../TradeFormBase/TradeFormSide';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}

const TradeMarketForm: FC<IPropTypes> = function ({ className }) {
  const dispatch = useAppDispatch();
  // const { t } = useTranslation();
  const chainId = useChainId();
  const tradeSide = useTradeSide(chainId);
  const marketFormState = useMarketFormState(chainId);
  const currentPair = useCurrentPairFromUrl(chainId);
  const sdkContext = useSDK(chainId);
  useTradeDefaultSide(currentPair);
  const maxLeverage = useTradeMaxLeverage(currentPair?.maxLeverage);
  const defaultLeverage = useTradeDefaultLeverage(currentPair?.maxLeverage);
  const userAddr = useUserAddr();
  const marketFormStatus = useMarketFormStateStatus(chainId);
  const currentPosition = useMainPosition(chainId, userAddr, currentPair?.id);
  const tradeSimulation = useMarketSimulation(chainId);
  const { slippage } = useGlobalConfig(chainId);
  const isFetchedPortfolio = useIsFetchedSinglePortfolio(
    chainId,
    userAddr,
    currentPair?.instrumentAddr,
    currentPair?.expiry,
  );

  const availableBalance = useAvailableTokenBalance(currentPair?.rootInstrument?.marginToken?.address, chainId, true);
  const getIsClosing = useCallback(
    (amount?: string) => {
      amount = amount || marketFormState.baseAmount;
      if (currentPair && currentPosition) {
        const adjustTradeSide = tradeSide;
        return currentPosition?.side !== adjustTradeSide && currentPosition?.wrappedSize.abs().eq(amount);
      }
    },
    [currentPair, currentPosition, marketFormState.baseAmount, tradeSide],
  );
  const isClosing = useMemo(() => getIsClosing(), [getIsClosing]);

  // const isShowLeverageWarning = useMemo(() => {
  //   return (tradeSimulation?.data?.exceedMaxLeverage && !tradeSimulation.data.leverage.eq(0)) || false;
  // }, [tradeSimulation?.data?.exceedMaxLeverage, tradeSimulation?.data?.leverage]);
  const fetchSimulation = useCallback(() => {
    if (chainId && currentPosition && sdkContext && userAddr) {
      if (WrappedBigNumber.from(marketFormState?.baseAmount).lte(0) || (!marketFormState.marginAmount && !isClosing)) {
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
          margin: isClosing ? '0' : marketFormState.marginAmount || '0',
          slippage: Number(slippage),
          userAddr,
          maxLeverage,
        }),
      );
    }
  }, [
    chainId,
    currentPosition,
    sdkContext,
    userAddr,
    marketFormState?.baseAmount,
    marketFormState.marginAmount,
    isClosing,
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
    if (!toBN(marketFormState.baseAmount || 0).eq(0)) {
      if (marketFormState.leverageAdjustType === LEVERAGE_ADJUST_TYPE.BY_AMOUNT || isClosing) {
        simulateTradeDebounced();
      } else {
        simulateTradeWithLeverageDebounced();
      }
    }
  }, [
    marketFormState.baseAmount,
    marketFormState.leverageAdjustType,
    isClosing,
    simulateTradeDebounced,
    simulateTradeWithLeverageDebounced,
  ]);
  const onSideChange = useCallback(
    (key: string) => {
      chainId &&
        dispatch(
          setTradeFormSide({
            chainId,
            tradeSide: Number(key) as Side,
          }),
        );
      // re simulate only when amount exists
      simulateFn();
    },
    [chainId, dispatch, simulateFn],
  );

  const amountStrChanged = useCallback(
    (amount?: string) => {
      // location storage is more accurate than slice when leverage adjust type changes
      const adjustType = getSavedPairLeverage(userAddr, chainId, currentPair?.id, LEVERAGE_ADJUST);
      if (adjustType === LEVERAGE_ADJUST_TYPE.BY_AMOUNT || getIsClosing(amount)) {
        simulateTradeDebounced();
      } else {
        simulateTradeWithLeverageDebounced();
      }
    },
    [chainId, currentPair?.id, getIsClosing, simulateTradeDebounced, simulateTradeWithLeverageDebounced, userAddr],
  );

  useEffect(() => {
    if (chainId && userAddr && currentPair?.id && isFetchedPortfolio) {
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
    // must dep on all three
  }, [chainId, currentPosition?.rootPair.id, currentPosition?.id, isFetchedPortfolio]);

  const onNativeTokenDepositClick = useCallback(() => {
    chainId &&
      dispatch(
        setTradeFormType({
          chainId,
          tradeType: TRADE_TYPE.DEPOSIT_NATIVE,
        }),
      );
  }, [chainId, dispatch]);

  const onMaxBalanceClick = useCallback(
    (balance: WrappedBigNumber) => {
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
            base: marketFormState.baseAmount,
            tradeSide,
            slippage: Number(slippage),
            userAddr,
            margin: balance.stringValue,
            maxLeverage,
          }),
        );
      }
    },
    [
      chainId,
      currentPosition,
      dispatch,
      marketFormState.baseAmount,
      sdkContext,
      slippage,
      tradeSide,
      userAddr,
      maxLeverage,
    ],
  );

  useEffect(() => {
    // re simulate only when amount exists
    if (marketFormStatus !== FETCHING_STATUS.FETCHING) {
      simulateFn();
    }
  }, [slippage]);

  useEffect(() => {
    //  simulate when fairPrice change
    if (marketFormStatus !== FETCHING_STATUS.FETCHING) {
      simulateFn();
    }
    // only dep on this
  }, [currentPair?.fairPrice._hex]);

  useEffect(() => {
    if (marketFormStatus !== FETCHING_STATUS.FETCHING) {
      //  simulate when balance change
      simulateFn();
    }
  }, [availableBalance?.stringValue]);

  return (
    <Form className={classNames('syn-trade-market-form', className)}>
      <TradeFormSide
        disabled={marketFormStatus === FETCHING_STATUS.FETCHING}
        chainId={chainId}
        onSideChange={onSideChange}
      />

      <TradeFormBase
        price={currentPair?.fairPrice ? WrappedBigNumber.from(currentPair?.fairPrice).stringValue : undefined}
        state={marketFormState}
        baseToken={currentPair?.rootInstrument.baseToken}
        pair={currentPair}
        disabled={marketFormStatus === FETCHING_STATUS.FETCHING}
        tradeSide={tradeSide}
        leverageChanged={leverageChanged}
        quoteToken={currentPair?.rootInstrument.quoteToken}
        amountStrChanged={amountStrChanged}
        showLeverageSwitch={true}
        hideLeverage={isClosing}
        adjustTypeChanged={() => {
          amountStrChanged();
        }}
        marginToken={currentPair?.rootInstrument.marginToken}
        simulationMessage={tradeSimulation?.message}
        simulationErrorData={tradeSimulation?.errorData}
      />

      {/* {leverageSwitched && (
        <TradeMarginRequire
          margin={WrappedBigNumber.from(tradeSimulation?.data?.margin || 0)}
          quote={currentPair?.rootInstrument?.marginToken}></TradeMarginRequire>
      )} */}

      {/* {toBN(marketFormState.baseAmount || 0).gt(0) && !tradeSimulation?.message && ( */}
      {toBN(marketFormState.baseAmount || 0).gt(0) && (
        <TradeFormDetails
          simulation={tradeSimulation?.data}
          marginToken={currentPair?.rootInstrument.marginToken}
          fairPrice={currentPair?.wrapAttribute('fairPrice')}
          isLoading={false}
          chainId={chainId}
          tradeSide={tradeSide}
        />
      )}
      {/* {isShowLeverageWarning && (
        <Alert
          message={
            <>
              <Trans
                t={t}
                i18nKey={'common.tradePage.exceedMaxLeverage'}
                values={{
                  leverage: WrappedBigNumber.from(tradeSimulation?.data?.leverage || 0).formatLeverageString(),
                }}
                components={{ b: <b /> }}
              />
              <ExternalLink href={FAQ_LINKS.PNL_FAQ}>{t('common.learnMore')}</ExternalLink>
            </>
          }
          type="warning"
          showIcon></Alert>
      )} */}
      <TradeFormAlert
        chainId={chainId}
        tradeType={TRADE_TYPE.MARKET}
        isClosing={isClosing}
        tradeSimulation={tradeSimulation}
        marginToken={currentPair?.rootInstrument?.marginToken}
        onMaxBalanceClick={onMaxBalanceClick}
        onNativeTokenDepositClick={onNativeTokenDepositClick}
      />
    </Form>
  );
};

export default TradeMarketForm;
