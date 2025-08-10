/**
 * @description Component-TradeLimitFormMobile
 */
import './index.less';

import { PEARL_SPACING } from '@synfutures/sdks-perp';
import { useDebounceFn } from 'ahooks';
// import BN from 'bignumber.js';
import classNames from 'classnames';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import SynInputNumber from '@/components/SynInputNumber';
import { FETCHING_STATUS } from '@/constants';
import { TRADE_TYPE } from '@/constants/trade';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useWrappedPortfolioByPairId } from '@/features/account/portfolioHook';
import { useCurrentPairFromUrl, useGetAlignedPrice, usePairLimitPriceRange } from '@/features/pair/hook';
import { orderSimulate, setLimitPrice, setTradeFormLeverage } from '@/features/trade/actions';
import {
  useLimitFormState,
  useLimitFormStatus,
  useLimitPriceChangeWhenOutOfRange,
  useTradeDefaultLeverage,
  useTradeMaxLeverage,
  useTradeSide,
} from '@/features/trade/hooks';
import { useSDK } from '@/features/web3/hook';
import { useAppDispatch } from '@/hooks';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import FloatingInput from '@/pages/components/FloatingInput';
import { getSavedPairLeverage } from '@/utils/localstorage';
import { formatNumber, inputNumChecker, toWad } from '@/utils/numberUtil';

import { useWrappedOrderList } from '@/features/account/orderHook';
import { useAvailableTokenBalance } from '@/features/balance/hook';
import TradeFormBaseMobile from '../TradeFormMobile/TradeFormbaseMobile';
import TradeLimitInputMessages from './TradeLimitInputMessages';
interface IPropTypes {
  className?: string;
  inputTouchedChange: (entering: boolean) => void;
  inputTouched: boolean;
}
const TradeLimitFormMobile: FC<IPropTypes> = function ({ className, inputTouchedChange, inputTouched }) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const tradeSide = useTradeSide(chainId);
  const limitFormState = useLimitFormState(chainId);
  const limitFormStatus = useLimitFormStatus(chainId);
  const currentPair = useCurrentPairFromUrl(chainId);
  const sdkContext = useSDK(chainId);
  const orders = useWrappedOrderList(chainId, userAddr, currentPair?.id);
  const maxLeverage = useTradeMaxLeverage(currentPair?.maxLeverage);
  const tokenBalance = useAvailableTokenBalance(currentPair?.rootInstrument.marginToken?.address, chainId);
  const portfolio = useWrappedPortfolioByPairId(chainId, userAddr, currentPair?.id);
  const defaultLeverage = useTradeDefaultLeverage(maxLeverage);
  const [lowerPrice, upperPrice] = usePairLimitPriceRange(currentPair, tradeSide, sdkContext);
  const getAlignPriceWad = useGetAlignedPrice(sdkContext, currentPair);
  const [priceInputFocused, setPriceInputFocused] = useState(false);
  const changelimitPriceWhenOutOfRange = useLimitPriceChangeWhenOutOfRange(chainId, priceInputFocused);
  const limitPriceStrChanged = useCallback(
    async (inputAmountStr: string) => {
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

  const limitPercentageChanged = useCallback(
    async (multiple: number) => {
      try {
        if (currentPair && sdkContext) {
          gtag('event', 'adjust_price', {
            adjust_price: 'enter', //plus_or_mins, enter, click_order_book
          });

          const alignedPrice = await getAlignPriceWad(limitFormState.limitPrice || 0, tradeSide);
          if (alignedPrice) {
            const newPrice = WrappedBigNumber.from(
              await sdkContext.perp.calc.getWadAtTick(
                currentPair.instrumentAddr,
                alignedPrice.tick + PEARL_SPACING * multiple * (currentPair.isInverse ? -1 : 1),
              ),
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
                  alignedPrice: inputNumChecker(alignedPrice?.adjustPrice.stringValue || '', currentPair?.priceDecimal),
                }),
              );
          }
        }
      } catch (error) {
        console.log('🚀 ~ file: index.tsx:132 ~ error:', error);
      }
    },
    [chainId, currentPair, dispatch, getAlignPriceWad, limitFormState.limitPrice, sdkContext, tradeSide],
  );

  const fetchSimulation = useCallback(
    (leverage?: string) => {
      if (chainId && portfolio && sdkContext) {
        dispatch(
          orderSimulate({
            chainId,
            sdkContext,
            base: toWad(limitFormState.baseAmount || 0),
            tradeSide,
            limitPrice: limitFormState.limitPrice,
            portfolio,
            leverage: leverage ? toWad(leverage) : undefined,
          }),
        );
      }
    },
    [chainId, portfolio, sdkContext, dispatch, limitFormState.baseAmount, limitFormState.limitPrice, tradeSide],
  );

  const { run: debouncedSimulateOrder } = useDebounceFn(
    (leverage: string | undefined) => {
      fetchSimulation(leverage);
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

  const adjustLimitPrice = useMemo(() => {
    return limitFormState?.limitPrice ? inputNumChecker(limitFormState?.limitPrice, currentPair?.priceDecimal) : '';
  }, [currentPair?.priceDecimal, limitFormState?.limitPrice]);

  const alignLimitPrice = useMemo(() => {
    console.log(
      '🚀 ~ alignLimitPrice ~ limitFormState?.limitPrice:',
      currentPair?.isInverse,
      limitFormState?.limitPrice,
    );
    if (currentPair?.isInverse && WrappedBigNumber.from(limitFormState?.limitPrice || 0).gt(0)) {
      // const price = getAdjustTradePrice(
      //   WrappedBigNumber.from(limitFormState?.limitPrice || 0),
      //   currentPair?.isInverse || false,
      // );
      // console.log('🚀 ~ alignLimitPrice ~ price:', price, currentPair?.isInverse, limitFormState?.limitPrice);
      // return price.stringValue;
    }
    return limitFormState?.limitPrice;
  }, [currentPair?.isInverse, limitFormState?.limitPrice]);

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

  useEffect(() => {
    debouncedSimulateOrder(limitFormState.leverage);
    // when limit price change or base amount change or orders or tokenbalance change
  }, [
    limitFormState.limitPrice,
    orders?.length,
    tokenBalance?.stringValue,
    limitFormState.baseAmount,
    debouncedSimulateOrder,
  ]);

  return (
    <div className={classNames('syn-trade-limit-form-mobile', className)}>
      <FloatingInput
        disabled={limitFormStatus === FETCHING_STATUS.FETCHING}
        onBlur={() => {
          inputTouchedChange(true);
          setPriceInputFocused(false);
          changelimitPriceWhenOutOfRange();
        }}
        onFocus={() => {
          inputTouchedChange(false);

          setPriceInputFocused(true);
        }}
        label={t('common.price') + `(${currentPair?.rootInstrument.priceToken.symbol})`}
        value={adjustLimitPrice}
        decimals={currentPair?.priceDecimal}
        onChange={limitPriceStrChanged}
        suffix={
          <SynInputNumber
            disabled={limitFormStatus === FETCHING_STATUS.FETCHING}
            inputChanged={limitPercentageChanged}
            lowerPrice={lowerPrice}
            upperPrice={upperPrice}
            limitPrice={adjustLimitPrice}
            className={classNames('syn-trade-limit-form-mobile-number-tick')}
          />
        }
      />
      <TradeLimitInputMessages inputTouched={inputTouched} inputTouchedChange={inputTouchedChange} />
      <TradeFormBaseMobile
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
    </div>
  );
};
export default TradeLimitFormMobile;
