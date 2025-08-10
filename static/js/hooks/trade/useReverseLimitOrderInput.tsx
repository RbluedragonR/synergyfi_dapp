import { TRADE_TYPE } from '@/constants/trade';
import { WrappedPosition } from '@/entities/WrappedPosition';
import { useCurrentPairFromUrl, useGetDefaultLimitPrice } from '@/features/pair/hook';
import { setLimitPrice, setTradeFormAmount, setTradeFormSide, setTradeFormType } from '@/features/trade/actions';
import { useLimitFormState, useTradeType } from '@/features/trade/hooks';
import { useSDK } from '@/features/web3/hook';
import { sleep } from '@/utils/common';
import { formatNumber } from '@/utils/numberUtil';
import { Side } from '@synfutures/sdks-perp';
import { useCallback } from 'react';
import { useAppDispatch } from '..';
import { useChainId } from '../web3/useChain';

const reverseTradeMap: { [id in number]: Side } = {
  [Side.LONG]: Side.SHORT,
  [Side.SHORT]: Side.LONG,
};
export default function useReverseLimitOrderInput(position: WrappedPosition | undefined) {
  const baseAmount = position?.wrapAttribute('size').abs().toString();
  const dispatch = useAppDispatch();
  const chainId = useChainId();
  const sdkContext = useSDK(chainId);
  const currentPair = useCurrentPairFromUrl(chainId);
  const targetTradeSide = (position && reverseTradeMap[position.wrappedSide]) || Side.FLAT;
  const currTradeType = useTradeType(chainId);
  const limitState = useLimitFormState(chainId);
  const getDefaultLimitPrice = useGetDefaultLimitPrice(currentPair, targetTradeSide, sdkContext);

  const reverseLimitOrderInput = useCallback(async () => {
    let inputlimitPriceStr: string | undefined = limitState.limitPrice;
    const defaultLimitPrice = await getDefaultLimitPrice();
    if (defaultLimitPrice) {
      inputlimitPriceStr = formatNumber(defaultLimitPrice.adjustPrice.stringValue, currentPair?.priceDecimal, false);
    }

    if (currTradeType !== TRADE_TYPE.LIMIT) {
      chainId &&
        dispatch(
          setTradeFormType({
            chainId,
            tradeType: TRADE_TYPE.LIMIT,
          }),
        );
    }
    await sleep(100);
    chainId &&
      dispatch(
        setTradeFormSide({
          chainId,
          tradeSide: targetTradeSide,
        }),
      );
    await sleep(100);
    if (inputlimitPriceStr) {
      chainId &&
        dispatch(
          setLimitPrice({
            chainId,
            limitPrice: inputlimitPriceStr,
            alignedPrice: inputlimitPriceStr,
          }),
        );
    }
    await sleep(100);
    chainId &&
      dispatch(
        setTradeFormAmount({
          chainId,
          baseAmount,
        }),
      );
  }, [
    limitState.limitPrice,
    getDefaultLimitPrice,
    currentPair?.priceDecimal,
    currTradeType,
    chainId,
    dispatch,
    targetTradeSide,
    baseAmount,
  ]);
  return reverseLimitOrderInput;
}
