/**
 * @description Component-TradeLimitForm
 */
import './index.less';

import { PEARL_SPACING, Side, TickMath } from '@synfutures/sdks-perp';
import { useDebounceFn } from 'ahooks';
import { Form } from 'antd';
// import BN from 'bignumber.js';
import classNames from 'classnames';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import Alert from '@/components/Alert';
import FormInput from '@/components/FormInput';
import SynInputNumber from '@/components/SynInputNumber';
import { FETCHING_STATUS } from '@/constants';
import { TRADE_TYPE } from '@/constants/trade';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useWrappedPortfolioByPairId } from '@/features/account/portfolioHook';
import {
  useCurrentPairFromUrl,
  useGetAlignedPrice,
  useGetDefaultLimitPrice,
  usePairLimitPriceRange,
} from '@/features/pair/hook';
import {
  orderSimulate,
  setLimitPrice,
  setTradeFormLeverage,
  setTradeFormSide,
  setTradeFormType,
} from '@/features/trade/actions';
import {
  useCallSimulateCrossMarketOrder,
  useCanPlaceCrossMarketOrder,
  useLimitFormState,
  useLimitFormStatus,
  useLimitPriceChangeWhenOutOfRange,
  useLimitSimulation,
  useSimulateCrossMarketMinMarginAndAmount,
  // useLimitSimulationRaw,
  useTradeDefaultLeverage,
  useTradeSide,
} from '@/features/trade/hooks';
import { useSDK } from '@/features/web3/hook';
import { useAppDispatch } from '@/hooks';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
// import TradeMarginRequire from '@/pages/components/TradeMarginRequire';
import { getSavedPairLeverage } from '@/utils/localstorage';
import { formatNumber, inputNumChecker, toBN, toWad } from '@/utils/numberUtil';
import { getAdjustTradePrice } from '@/utils/pairs';

import { useWrappedOrderList } from '@/features/account/orderHook';
import { useAvailableTokenBalance } from '@/features/balance/hook';
import TradeFormAlert from '../TradeFormAlert';
import TradeFormBase from '../TradeFormBase';
import TradeFormSide from '../TradeFormBase/TradeFormSide';
import CrossMarketCheckbox from './CrossMarketCheckbox';
import { CrossMarketDetail } from './CrossMarketDetail';
import { LimitFormDetail } from './LimitFormDetail';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const TradeLimitForm: FC<IPropTypes> = function ({ className }) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const tradeSide = useTradeSide(chainId);
  const limitFormState = useLimitFormState(chainId);
  const limitFormStatus = useLimitFormStatus(chainId);
  const currentPair = useCurrentPairFromUrl(chainId);
  const [inputTouched, setInputTouched] = useState(false);
  const [priceInputFocused, setPriceInputFocused] = useState(false);
  const tokenBalance = useAvailableTokenBalance(currentPair?.rootInstrument.marginToken?.address, chainId);
  const sdkContext = useSDK(chainId);
  const orders = useWrappedOrderList(chainId, userAddr, currentPair?.id);
  const portfolio = useWrappedPortfolioByPairId(chainId, userAddr, currentPair?.id);
  const limitSimulation = useLimitSimulation(chainId);
  const callSimulateCrossMarketOrder = useCallSimulateCrossMarketOrder({
    chainId,
    userAddr,
    tradeSide,
    currentPair,
    baseAmount: WrappedBigNumber.from(limitFormState.baseAmount || 0),
    limitPrice: limitFormState.limitPrice,
  });
  const changelimitPriceWhenOutOfRange = useLimitPriceChangeWhenOutOfRange(
    chainId,
    priceInputFocused,
    limitFormState?.isTurnOnCrossMarket,
  );
  const defaultLeverage = useTradeDefaultLeverage(currentPair?.maxLeverage);
  const [lowerPrice, upperPrice] = usePairLimitPriceRange(
    currentPair,
    tradeSide,
    sdkContext,
    limitFormState?.isTurnOnCrossMarket,
  );
  const getDefaultLimitPrice = useGetDefaultLimitPrice(currentPair, tradeSide, sdkContext);
  const getAlignPriceWad = useGetAlignedPrice(sdkContext, currentPair);
  const canPlaceCrossMarketOrder = useCanPlaceCrossMarketOrder(chainId);
  const crossMarginMinMarginAndAmountSimulation = useSimulateCrossMarketMinMarginAndAmount(chainId);

  // const isCrossMarket = use();
  // const limitSimulation = useLimitSimulationRaw(chainId);
  const limitPriceStrChanged = useCallback(
    async (inputAmountStr: string) => {
      gtag('event', 'adjust_price', {
        adjust_price: 'enter', //plus_or_mins, enter, click_order_book
      });
      inputAmountStr = inputNumChecker(inputAmountStr, currentPair?.priceDecimal);
      const alignedPrice = await getAlignPriceWad(inputAmountStr, tradeSide);
      chainId &&
        dispatch(
          setLimitPrice({
            chainId,
            limitPrice: inputAmountStr,
            alignedPrice: inputNumChecker(alignedPrice?.adjustPrice.stringValue || '', currentPair?.priceDecimal),
          }),
        );
    },
    [chainId, dispatch, getAlignPriceWad, currentPair?.priceDecimal, tradeSide],
  );
  const setDefaultLimitPrice = useCallback(
    async (tradeSide?: Side) => {
      const defaultLimitPrice = await getDefaultLimitPrice(tradeSide);
      defaultLimitPrice &&
        limitPriceStrChanged(
          formatNumber(defaultLimitPrice?.adjustPrice.stringValue, currentPair?.priceDecimal, false),
        );
    },
    [currentPair?.priceDecimal, getDefaultLimitPrice, limitPriceStrChanged],
  );
  const bestBidAsk = useCallback(() => {
    const adjustSide = tradeSide;
    let price;
    if (adjustSide === Side.LONG && upperPrice) {
      price = upperPrice;
    }
    if (adjustSide === Side.SHORT && lowerPrice) {
      price = lowerPrice;
    }
    chainId &&
      price &&
      dispatch(
        setLimitPrice({
          chainId,
          limitPrice: price?.stringValue,
          alignedPrice: price?.stringValue,
        }),
      );
  }, [chainId, dispatch, lowerPrice, tradeSide, upperPrice]);
  const limitPercentageChanged = useCallback(
    async (multiple: number) => {
      try {
        if (currentPair && sdkContext) {
          const result = await getAlignPriceWad(limitFormState.limitPrice || 0, tradeSide);

          if (result) {
            const newPrice = getAdjustTradePrice(
              WrappedBigNumber.from(
                TickMath.getWadAtTick(result.tick + PEARL_SPACING * multiple * (currentPair.isInverse ? -1 : 1)),
              ),
              currentPair.isInverse,
            );
            const limitPrice = formatNumber(
              newPrice.stringValue,
              currentPair?.priceDecimal,
              false,
              // multiple > 0 ? BN.ROUND_DOWN : BN.ROUND_CEIL,
            );
            chainId &&
              dispatch(
                setLimitPrice({
                  chainId,
                  limitPrice,
                  alignedPrice: limitPrice,
                }),
              );
          }
        }
      } catch (error) {
        console.log('🚀 ~ file: index.tsx:132 ~ error:', error);
      }
    },
    [
      chainId,
      currentPair,
      dispatch,
      getAlignPriceWad,
      limitFormState.limitPrice,
      currentPair?.priceDecimal,
      sdkContext,
      tradeSide,
    ],
  );

  const fetchOrderSimulation = useCallback(
    (leverage?: string) => {
      if (chainId && portfolio && sdkContext) {
        if (canPlaceCrossMarketOrder && leverage && WrappedBigNumber.from(limitFormState.baseAmount).gt(0)) {
          callSimulateCrossMarketOrder(leverage);
        } else {
          dispatch(
            orderSimulate({
              chainId,
              sdkContext,
              base: toWad(limitFormState.baseAmount?.trim() || 0),
              tradeSide,
              limitPrice: limitFormState.limitPrice,
              portfolio,
              leverage: leverage ? toWad(leverage) : undefined,
            }),
          );
        }
      }
    },
    [
      chainId,
      portfolio,
      sdkContext,
      canPlaceCrossMarketOrder,
      callSimulateCrossMarketOrder,
      dispatch,
      limitFormState.baseAmount,
      limitFormState.limitPrice,
      tradeSide,
    ],
  );

  const { run: debouncedSimulateOrder } = useDebounceFn(
    (leverage: string | undefined) => {
      fetchOrderSimulation(leverage);
    },
    { wait: 500 },
  );

  const leverageChanged = useCallback(
    (leverage: string) => {
      if (chainId) {
        const baseWad = toWad(limitFormState.baseAmount || 0);
        dispatch(
          setTradeFormLeverage({
            chainId,
            leverage: leverage,
          }),
        );
        // no simulation when base zero
        !baseWad.eq(0) && debouncedSimulateOrder(leverage);
      }
    },
    [chainId, debouncedSimulateOrder, dispatch, limitFormState.baseAmount],
  );

  useEffect(() => {
    debouncedSimulateOrder(limitFormState.leverage);
    // when limit price change or base amount change or order map change or token balance change
  }, [
    limitFormState.limitPrice,
    orders?.length,
    limitFormState.baseAmount,
    tokenBalance?.stringValue,
    debouncedSimulateOrder,
  ]);

  useEffect(() => {
    if (chainId && userAddr && currentPair?.id) {
      const leverageSaved = getSavedPairLeverage(userAddr, chainId, currentPair.id, TRADE_TYPE.LIMIT);

      dispatch(
        setTradeFormLeverage({
          chainId,
          leverage: leverageSaved || defaultLeverage.toString(),
        }),
      );
    }
    //  only depend on chainId userAddr and currentPair.id
  }, [chainId, userAddr, currentPair?.id]);

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
      console.log('🚀 ~ balance:', balance);
      if (chainId && portfolio && sdkContext) {
        // TODO: adapt order simulate with margin
        // dispatch(
        //   orderSimulate({
        //     chainId,
        //     sdkContext,
        //     base: toWad(limitFormState.baseAmount || 0),
        //     tradeSide,
        //     limitPrice: limitFormState.limitPrice,
        //     portfolio,
        //     leverage: undefined,
        //     // margin: balance.stringValue,
        //   }),
        // );
      }
    },
    [chainId, dispatch, limitFormState.baseAmount, limitFormState.limitPrice, portfolio, sdkContext, tradeSide],
  );

  const adjustLimitPrice = useMemo(() => {
    return limitFormState?.limitPrice ? inputNumChecker(limitFormState?.limitPrice, currentPair?.priceDecimal) : '';
  }, [currentPair?.priceDecimal, limitFormState?.limitPrice]);

  const alignLimitPrice = useMemo(() => {
    return limitFormState?.limitPrice;
  }, [limitFormState?.limitPrice]);
  useEffect(() => {
    const crossMarket = document.querySelector('.syn-cross-market-checkbox-text');
    if (lowerPrice && lowerPrice?.formatLiqPriceString().length >= 9 && crossMarket) {
      crossMarket.classList.add('short');
    } else {
      crossMarket?.classList.remove('short');
    }
    // must depend on this
  }, [lowerPrice?.stringValue]);
  return (
    <Form className={classNames('syn-trade-limit-form', className)}>
      <TradeFormSide
        disabled={limitFormStatus === FETCHING_STATUS.FETCHING}
        chainId={chainId}
        onSideChange={(key) => {
          const tradeSide = Number(key) as Side;
          setInputTouched(false);
          setDefaultLimitPrice(tradeSide);
          chainId &&
            dispatch(
              setTradeFormSide({
                chainId,
                tradeSide,
              }),
            );
        }}
      />
      <div className="syn-trade-limit-form-section">
        <div className="syn-trade-limit-form-section-title-wrap" id="priceRange">
          <div className="syn-trade-limit-form-section-title">
            <span className="syn-trade-limit-form-section-title-range">
              {t('common.price')} ({lowerPrice?.formatLiqPriceNumberWithTooltip()} -{' '}
              {upperPrice?.formatLiqPriceNumberWithTooltip()})
            </span>
            {!limitFormState?.isTurnOnCrossMarket && (
              <div className="syn-trade-limit-form-section-title-bid" onClick={bestBidAsk}>
                {tradeSide === Side.LONG ? t('common.tradePage.bestBid') : t('common.tradePage.bestAsk')}
              </div>
            )}
          </div>
          <CrossMarketCheckbox chainId={chainId} />
        </div>
        <div className="syn-trade-limit-form-price-row">
          <FormInput
            disabled={limitFormStatus === FETCHING_STATUS.FETCHING}
            inputProps={{
              type: 'text',
              pattern: '^[0-9]*[.,]?[0-9]*$',
              inputMode: 'decimal',
              autoComplete: 'off',
              autoCorrect: 'off',
              step: 1e18,
              onKeyDown: (e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault(),
            }}
            onFocus={() => {
              setInputTouched(false);
              setPriceInputFocused(true);
            }}
            onBlur={() => {
              setInputTouched(true);
              setPriceInputFocused(false);
              changelimitPriceWhenOutOfRange();
            }}
            tokenInfo={currentPair?.rootInstrument.priceToken}
            inputAmountStr={adjustLimitPrice}
            inputAmountStrChanged={limitPriceStrChanged}
            suffix={currentPair?.rootInstrument.priceToken.symbol}
          />
          <SynInputNumber
            disabled={limitFormStatus === FETCHING_STATUS.FETCHING}
            inputChanged={limitPercentageChanged}
            upperPrice={upperPrice}
            lowerPrice={lowerPrice}
            limitPrice={adjustLimitPrice}
            // pair={currentPair}
            className={classNames('syn-trade-limit-form-number-tick')}
            minDisableTooltip={t('tooltip.tradePage.minLimitDisabled')}
            maxDisableTooltip={t('tooltip.tradePage.maxLimitDisabled')}
          />
        </div>
        {inputTouched &&
          lowerPrice?.lte(limitFormState.limitPrice || 0) &&
          upperPrice?.gte(limitFormState.limitPrice || 0) &&
          limitFormState.limitPrice &&
          WrappedBigNumber.from(limitFormState.alignedPrice || 0)?.notEq(limitFormState.limitPrice) && (
            <Alert
              type="info"
              showIcon
              message={
                <Trans
                  i18nKey="common.tradePage.limitSub"
                  components={{
                    b: <span />,
                  }}
                  values={{
                    price: limitFormState.alignedPrice,
                  }}
                />
              }
            />
          )}
        {canPlaceCrossMarketOrder && (
          <Alert
            type="info"
            showIcon
            message={
              <Trans
                i18nKey={
                  crossMarginMinMarginAndAmountSimulation?.data
                    ? 'tooltip.tradePage.hasBeenCrossedWithMargin'
                    : 'tooltip.tradePage.hasBeenCrossed'
                }
                components={{
                  b: <b />,
                }}
                values={{
                  base: currentPair?.rootInstrument.baseToken.symbol,
                  size: crossMarginMinMarginAndAmountSimulation?.data?.tradeSize?.formatDisplayNumber(),
                }}
              />
            }
          />
        )}
      </div>

      <TradeFormBase
        state={limitFormState}
        price={alignLimitPrice}
        disabled={limitFormStatus === FETCHING_STATUS.FETCHING}
        baseToken={currentPair?.rootInstrument.baseToken}
        quoteToken={currentPair?.rootInstrument.quoteToken}
        tradeSide={tradeSide}
        pair={currentPair}
        leverageChanged={leverageChanged}
        marginToken={currentPair?.rootInstrument.marginToken}
      />
      {/* <TradeMarginRequire
        margin={WrappedBigNumber.from(limitSimulation?.data?.margin || 0)}
        quote={currentPair?.rootInstrument?.marginToken}></TradeMarginRequire> */}

      {/* {toBN(limitFormState.baseAmount || 0).gt(0) && !limitSimulation?.message && ( */}
      {toBN(limitFormState.baseAmount || 0).gt(0) &&
        (canPlaceCrossMarketOrder ? (
          <CrossMarketDetail
            marginToken={currentPair?.rootInstrument.marginToken}
            fairPrice={currentPair?.wrapAttribute('fairPrice')}
            isLoading={false}
            chainId={chainId}
            pairSymbol={currentPair?.symbol}
            tradeSide={tradeSide}
            isInverse={currentPair?.isInverse}
          />
        ) : (
          <LimitFormDetail
            marginToken={currentPair?.rootInstrument.marginToken}
            fairPrice={currentPair?.wrapAttribute('fairPrice')}
            isLoading={false}
            chainId={chainId}
            pairSymbol={currentPair?.symbol}
            tradeSide={tradeSide}
            simulationData={limitSimulation?.data}
          />
        ))}

      <TradeFormAlert
        chainId={chainId}
        tradeType={TRADE_TYPE.LIMIT}
        tradeSimulation={undefined}
        marginToken={currentPair?.rootInstrument?.marginToken}
        onMaxBalanceClick={onMaxBalanceClick}
        onNativeTokenDepositClick={onNativeTokenDepositClick}></TradeFormAlert>
    </Form>
  );
};

export default TradeLimitForm;
