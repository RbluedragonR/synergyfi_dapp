/**
 * @description Component-OrderBook
 */
import './index.less';

import { CHAIN_ID } from '@derivation-tech/context';
import classNames from 'classnames';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { EmptyDataWrap } from '@/components/EmptyDataWrap';
import { useMediaQueryDevice } from '@/components/MediaQuery';
import { TRADE_TYPE } from '@/constants/trade';
import { WrappedBigNumber, WrappedBigNumberLike } from '@/entities/WrappedBigNumber';
import { WrappedOrder } from '@/entities/WrappedOrder';
import { WrappedPair } from '@/entities/WrappedPair';
import { useWrappedOrderList } from '@/features/account/orderHook';
import {
  useCurrentPairByDevice,
  useGetAlignedFairPrice,
  usePairAdjustedRange,
  usePairDisabledForLimit,
} from '@/features/pair/hook';
import { updateLimitPriceFromOrderBook } from '@/features/trade/actions';
import { useLimitFormState, useTradeSide } from '@/features/trade/hooks';
import { useSDK } from '@/features/web3/hook';
import { useAppDispatch } from '@/hooks';
import { useUserAddr } from '@/hooks/web3/useChain';
import { formatNumber } from '@/utils/numberUtil';

import { ChangeIcon } from '@/assets/svg';
import { ReactComponent as IconArrowFall } from '@/assets/svg/icon_arrow_fall_16.svg';
import { ReactComponent as IconArrowRise } from '@/assets/svg/icon_arrow_rise_16.svg';
import { useMockDevTool } from '@/components/Mock';
import { DAPP_CHAIN_CONFIGS } from '@/constants/chain';
import { useFuturesOrderBookWithStepRatio, useIsFetchedFuturesOrderBook } from '@/features/futures/hooks';
import { IExtendDepthChartData } from '@/types/chart';
import { IFuturesOrderBookItem } from '@/types/futures';
import { getOrderBookSizeInQuote } from '@/utils/trade/orderBook';
import { Side } from '@synfutures/sdks-perp';
import { usePrevious } from 'ahooks';
import { useNavigate } from 'react-router-dom';
import OrderBookSkeleton from './OrderBookSkeleton';

// let depthPolling: NodeJS.Timeout | undefined = undefined;

interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  isMobile?: boolean;
  pair: WrappedPair | undefined;
  chainId: CHAIN_ID | undefined;
  stepRatio?: number;
}

const OrderBook: FC<IPropTypes> = function ({ pair, chainId, stepRatio = 5 }) {
  // const depthData = useOrderBookData(chainId, pair, stepRatio);
  const depthDataFromApi = useFuturesOrderBookWithStepRatio(chainId, pair?.instrumentAddr, pair?.expiry, stepRatio);
  const isFetched = useIsFetchedFuturesOrderBook(chainId, pair?.instrumentAddr, pair?.expiry, stepRatio);

  // const fetchingStatus = useOrderBookDataStatus(chainId, pair?.id, stepRatio);
  const sdkContext = useSDK(chainId);
  const dispatch = useAppDispatch();
  const userAddr = useUserAddr();

  // const currentPairBaseInfo = useCurrentPairBaseInfoFromUrl(chainId);
  const currentPair = useCurrentPairByDevice(chainId);
  // const marketPairInfo = useMarketPairInfo(chainId, currentPairBaseInfo?.instrumentAddr, currentPairBaseInfo?.expiry);
  // console.log('🚀 ~ marketPairInfo:', marketPairInfo);
  // const currentBaseInfo = useCurrentPairBaseInfoFromUrl(chainId);

  const prevPrice = usePrevious(currentPair?.wrapAttribute('fairPrice')?.toNumber());

  const { pairDisabledInLimit } = usePairDisabledForLimit(currentPair);
  const tradeSide = useTradeSide(chainId);
  const orders = useWrappedOrderList(chainId, userAddr, pair?.id);
  const [adjustedLowerPrice, adjustedUpperPrice] = usePairAdjustedRange(currentPair, tradeSide, sdkContext);
  const { isMobile, deviceType } = useMediaQueryDevice();
  const { t } = useTranslation();
  const getAlignedFairPrice = useGetAlignedFairPrice(currentPair);
  const { isTurnOnCrossMarket } = useLimitFormState(chainId);
  const [isUnitInBaseToken, setIsUnitInBaseToken] = useState<boolean>(true);
  const { isMockSkeleton } = useMockDevTool();
  const navigage = useNavigate();
  const setLimitPriceToTrade = useCallback(
    async (price: WrappedBigNumberLike, side: Side) => {
      if (pairDisabledInLimit) {
        return;
      }
      if (currentPair && !isMobile) {
        navigage(`/trade/${DAPP_CHAIN_CONFIGS[currentPair?.chainId]?.network?.shortName}/${currentPair?.symbol}`);
      }
      gtag('event', 'adjust_price', {
        adjust_price: 'click_order_book', //plus_or_mins, enter, click_order_book
      });
      if (currentPair) {
        const alignedFairPrice = await getAlignedFairPrice(side);
        let priceFinal = WrappedBigNumber.from(price);
        const adjustTradeSide = side;
        if (chainId) {
          if (adjustTradeSide === Side.LONG) {
            if (adjustedLowerPrice && priceFinal.lt(adjustedLowerPrice)) {
              priceFinal = adjustedLowerPrice;
            }
            if (alignedFairPrice && priceFinal.gt(alignedFairPrice)) {
              priceFinal = alignedFairPrice;
            }
          }
          if (adjustTradeSide === Side.SHORT) {
            if (adjustedUpperPrice && priceFinal.gt(adjustedUpperPrice || 0)) {
              priceFinal = adjustedUpperPrice;
            }
            if (alignedFairPrice && alignedFairPrice.gt(priceFinal)) {
              priceFinal = alignedFairPrice;
            }
          }
          const checkedPrice = formatNumber(priceFinal.stringValue, currentPair?.priceDecimal, false);
          dispatch(
            updateLimitPriceFromOrderBook({
              limitState: {
                chainId,
                limitPrice: checkedPrice,
                alignedPrice: checkedPrice,
                tradeSide: isTurnOnCrossMarket ? tradeSide : side,
              },
              formType: TRADE_TYPE.LIMIT,
            }),
          );
        }
      }
    },
    [
      adjustedLowerPrice,
      adjustedUpperPrice,
      chainId,
      currentPair,
      dispatch,
      getAlignedFairPrice,
      isMobile,
      isTurnOnCrossMarket,
      navigage,
      pairDisabledInLimit,
      tradeSide,
    ],
  );
  useEffect(() => {
    setIsUnitInBaseToken(true);
  }, [pair?.id]);
  // useEffect(() => {
  //   if (currentBaseInfo && chainId && sdkContext && stepRatio) {
  //     try {
  //       depthPolling && clearInterval(depthPolling);
  //       depthPolling = pollingFunc(() => {
  //         dispatch(
  //           getPairOrderBookData({
  //             chainId,
  //             instrumentAddr: currentBaseInfo.instrumentAddr,
  //             expiry: currentBaseInfo.expiry,
  //             sdkContext,
  //             stepRatio,
  //           }),
  //         );
  //       }, POLLING_ORDER_BOOK);
  //     } catch (e) {
  //       console.log('🚀 ~ file: index.tsx:140 ~ useEffect ~ e:', e);
  //     }
  //   }
  //   return () => {
  //     depthPolling && clearInterval(depthPolling);
  //   };
  //   // only these two
  // }, [pair?.fairPrice._hex, stepRatio, currentBaseInfo?.id]);

  useEffect(() => {
    setIsUnitInBaseToken(
      pair?.isInverse ? !!pair?.wrapAttribute('fairPrice').gt(1) : !!pair?.wrapAttribute('fairPrice').lt(1),
    );
  }, [pair?.id]);

  const findClosest = useCallback(
    (array: (IFuturesOrderBookItem & { isShowIcon?: boolean })[], order: WrappedOrder, side: Side) => {
      if (side === Side.LONG) {
        const orderedArr = array;

        const best = orderedArr.find((item) =>
          order.isInverse
            ? WrappedBigNumber.from(item.tick).gte(order.tick)
            : WrappedBigNumber.from(item.tick).lte(order.tick),
        );
        return best;
      } else if (side === Side.SHORT) {
        const orderedArr = array;
        const best = orderedArr.find((item) =>
          order.isInverse
            ? WrappedBigNumber.from(item.tick).lte(order.tick)
            : WrappedBigNumber.from(item.tick).gte(order.tick),
        );

        return best;
      }
    },
    [],
  );

  const sellDataWithOrder = useMemo(() => {
    // data must be mapped to become immutable
    const data: (IFuturesOrderBookItem & { isShowIcon?: boolean })[] | undefined = depthDataFromApi?.right.map((d) => ({
      ...d,
    }));
    if (data && orders) {
      const sellOrders = orders.filter((order) => order.side === Side.SHORT);
      sellOrders.forEach((order) => {
        const closest = findClosest(data, order, order.side);
        if (closest) {
          //console.log('🚀 ~ sellOrders.forEach ~ closest:', { closest, order, sellOrders, orders, depthDataFromApi });
          closest.isShowIcon = true;
        }
      });
    }
    return data?.slice(0, isMobile ? 5 : 8);
  }, [depthDataFromApi?.right, findClosest, orders, isMobile]);

  const buyDataWithOrder = useMemo(() => {
    const data: (IFuturesOrderBookItem & { isShowIcon?: boolean })[] | undefined = depthDataFromApi?.left.map((d) => ({
      ...d,
    }));
    if (data && orders) {
      const buyOrders = orders.filter((order) => order.side === Side.LONG);
      buyOrders.forEach((order) => {
        const closest = findClosest(data, order, order.side);
        if (closest) {
          closest.isShowIcon = true;
        }
      });
    }
    return data?.slice(0, isMobile ? 5 : 8);
  }, [depthDataFromApi?.left, findClosest, orders, isMobile]);

  const sellData = useMemo(() => {
    const data = sellDataWithOrder;
    if (data && pair) {
      const dataWithSumAndQuote = data.map((item, index) => {
        const currQuote = getOrderBookSizeInQuote(item.base, item.price, !pair.isInverse);
        if (index > 0) {
          const prevList = data.slice(0, index);
          const sum = prevList.reduce((prev, cur) => {
            return prev + (cur?.base || 0) || 0;
          }, item?.base || 0);
          return {
            ...item,
            sum,
            quote: currQuote,
          };
        }
        return {
          ...item,
          sum: item?.base || 0,
          quote: currQuote,
        };
      });
      const dataWithSumAndQuoteAndQuoteSum = dataWithSumAndQuote.map((item, index) => {
        if (index > 0) {
          const prevList = dataWithSumAndQuote.slice(0, index);
          const sumQuote = prevList.reduce((prev, cur) => {
            return prev + (cur?.quote || 0) || 0;
          }, item?.quote || 0);
          return {
            ...item,
            sumQuote,
          };
        }
        return {
          ...item,
          sum: item?.base || 0,
          sumQuote: item.quote,
        };
      });
      return [...dataWithSumAndQuoteAndQuoteSum].reverse();
    }

    return new Array(isMobile ? 5 : 8).fill({
      sum: 0,
      tick: 0,
      price: 0,
      base: 0,
      quote: 0,
      sumQuote: 0,
      isShowIcon: false,
    }) as IExtendDepthChartData[];
  }, [sellDataWithOrder, pair, isMobile]);

  const buyData: IExtendDepthChartData[] = useMemo(() => {
    const data = buyDataWithOrder;
    if (data && pair) {
      const dataWithSumAndQuote = data.map((item, index) => {
        const currQuote = getOrderBookSizeInQuote(item.base, item.price, !pair.isInverse);
        if (index > 0) {
          const prevList = data.slice(0, index);
          const sum = prevList.reduce((prev, cur) => {
            return prev + (cur?.base || 0) || 0;
          }, item?.base || 0);
          return {
            ...item,
            sum,
            quote: currQuote,
          };
        }
        return {
          ...item,
          sum: item?.base || 0,
          quote: currQuote,
        };
      });
      const dataWithSumAndQuoteAndQuoteSum = dataWithSumAndQuote.map((item, index) => {
        if (index > 0) {
          const prevList = dataWithSumAndQuote.slice(0, index);
          const sumQuote = prevList.reduce((prev, cur) => {
            return prev + (cur?.quote || 0) || 0;
          }, item?.quote || 0);
          return {
            ...item,
            sumQuote,
          };
        }
        return {
          ...item,
          sum: item?.base || 0,
          sumQuote: item.quote,
        };
      });
      return dataWithSumAndQuoteAndQuoteSum;
    }

    return new Array(isMobile ? 5 : 8).fill({
      sum: 0,
      tick: 0,
      price: 0,
      base: 0,
      quote: 0,
      sumQuote: 0,
      isShowIcon: false,
    }) as IExtendDepthChartData[];
  }, [buyDataWithOrder, pair, isMobile]);
  const maxSum = useMemo(() => {
    return Math.max(
      ...sellData.map((item) => (isUnitInBaseToken ? item.sum : item.sumQuote)),
      ...buyData.map((item) => (isUnitInBaseToken ? item.sum : item.sumQuote)),
    );
  }, [buyData, isUnitInBaseToken, sellData]);

  const getWidth = (sum: number, max: number) => {
    return `calc(${WrappedBigNumber.from(sum).div(max).mul(100).stringValue}%)`;
  };
  const loading = isMockSkeleton || !isFetched;

  return (
    <div className={classNames('syn-order-book', deviceType)}>
      {!isMobile && (
        <div className="syn-order-book-head">
          <div className="syn-order-book-item">
            <div className="syn-order-book-item_price">{t('common.orderBook.price')}</div>
            <div className="syn-order-book-item_size">
              {t('common.orderBook.size')}
              {currentPair?.rootInstrument && (
                <span onClick={() => setIsUnitInBaseToken((prev) => !prev)} className="suffix">
                  (
                  <span className="symbol">
                    {isUnitInBaseToken
                      ? currentPair?.rootInstrument.baseToken.symbol
                      : currentPair?.rootInstrument.quoteToken.symbol}
                  </span>
                  <ChangeIcon />)
                </span>
              )}
            </div>
            <div className="syn-order-book-item_sum">{t('common.orderBook.sum')}</div>
          </div>
        </div>
      )}
      <OrderBookSkeleton isLoading={loading}>
        <div className="syn-order-book-body">
          <div className="syn-order-book-table syn-order-book-table_sell">
            {sellData.map((sell, i) => (
              <div
                className="syn-order-book-item"
                onClick={() => setLimitPriceToTrade(sell.price, Side.SHORT)}
                key={sell.tick?.toString() + sell.price.toString() + i}>
                <div className="syn-order-book-item_price">
                  <EmptyDataWrap isLoading={!sell.price}>
                    {WrappedBigNumber.from(sell.price).formatPriceNumberWithTooltip()}
                  </EmptyDataWrap>
                </div>
                <div className="syn-order-book-item_size">
                  <EmptyDataWrap isLoading={!sell?.base}>
                    {WrappedBigNumber.from(isUnitInBaseToken ? sell?.base : sell.quote).formatNumberWithTooltip({
                      isShowTBMK: true,
                    })}
                  </EmptyDataWrap>
                </div>
                {!isMobile && (
                  <div className="syn-order-book-item_sum">
                    <EmptyDataWrap isLoading={!sell.sum}>
                      {WrappedBigNumber.from(isUnitInBaseToken ? sell.sum : sell.sumQuote).formatNumberWithTooltip({
                        isShowTBMK: true,
                      })}
                    </EmptyDataWrap>
                  </div>
                )}
                <div className="syn-order-book-item-bg-wrap">
                  <div
                    className="syn-order-book-item-bg"
                    style={{
                      width: getWidth(isUnitInBaseToken ? sell.sum : sell.sumQuote, maxSum),
                    }}></div>
                </div>
                {sell.isShowIcon && (
                  <div className={classNames('syn-order-book-item-ordered', 'syn-order-book-item-ordered_sell')}></div>
                )}
              </div>
            ))}
          </div>
          <div className="syn-order-book-price-wrap">
            <div
              className={classNames(
                'syn-order-book-price',
                pair?.wrapAttribute('fairPrice')?.gte(prevPrice || 0) ? 'text-success' : 'text-danger',
              )}>
              <span>{pair?.wrapAttribute('fairPrice').formatPriceNumberWithTooltip()}</span>

              {pair?.wrapAttribute('fairPrice')?.gte(prevPrice || 0) ? <IconArrowRise /> : <IconArrowFall />}
            </div>
            {!isMobile && (
              <div className="syn-order-book-price-secondary">
                {pair?.wrapAttribute('markPrice').formatPriceNumberWithTooltip()}
              </div>
            )}
          </div>
          <div className="syn-order-book-table syn-order-book-table_buy">
            {buyData.map((buy, i) => (
              <div
                onClick={() => setLimitPriceToTrade(buy.price, Side.LONG)}
                className="syn-order-book-item"
                key={buy.tick?.toString() + buy.price.toString() + i}>
                <div className="syn-order-book-item_price">
                  <EmptyDataWrap isLoading={!buy.price}>
                    {WrappedBigNumber.from(buy.price).formatPriceNumberWithTooltip()}
                  </EmptyDataWrap>
                </div>
                <div className="syn-order-book-item_size">
                  {
                    <EmptyDataWrap isLoading={!buy.base}>
                      {WrappedBigNumber.from(isUnitInBaseToken ? buy.base : buy.quote).formatNumberWithTooltip({
                        isShowTBMK: true,
                      })}
                    </EmptyDataWrap>
                  }
                </div>
                {!isMobile && (
                  <div className="syn-order-book-item_sum">
                    {
                      <EmptyDataWrap isLoading={!buy.sum}>
                        {WrappedBigNumber.from(isUnitInBaseToken ? buy.sum : buy.sumQuote).formatNumberWithTooltip({
                          isShowTBMK: true,
                        })}
                      </EmptyDataWrap>
                    }
                  </div>
                )}
                <div className="syn-order-book-item-bg-wrap">
                  <div
                    className="syn-order-book-item-bg"
                    style={{
                      width: getWidth(isUnitInBaseToken ? buy.sum : buy.sumQuote, maxSum),
                    }}></div>
                </div>
                {buy.isShowIcon && (
                  <div className={classNames('syn-order-book-item-ordered', 'syn-order-book-item-ordered_buy')}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </OrderBookSkeleton>
    </div>
  );
};

export default OrderBook;
