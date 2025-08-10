import { useMediaQueryDevice } from '@/components/MediaQuery';
import { MANAGE_SIDE } from '@/constants/trade';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useWrappedPortfolioByPairId } from '@/features/account/portfolioHook';
import { useMainPosition } from '@/features/account/positionHook';
import { useDisplayBalance } from '@/features/balance/hook';
import { useCurrentPairByDevice } from '@/features/pair/hook';
import BigNumber from 'bignumber.js';

import { setAdjustMarginSide } from '@/features/trade/actions';
import { useAdjustMarginFormState, useAdjustMarginFormStatus } from '@/features/trade/hooks';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { MarginAdjustMethod } from '@/types/trade';
import { formatNumber, inputNumChecker } from '@/utils/numberUtil';
import { isWrappedNativeToken } from '@/utils/token';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import useMarginAdjustInputChanged from './useMarginAdjustSimulate';

export default function useMarginAdjustByAmount() {
  const { isMobile } = useMediaQueryDevice();
  const manageSide = useAppSelector(
    (state) => state.trade.adjustMarginControlState.manageSides.MarginAdjustMethod_Amount,
  );
  const dispatch = useAppDispatch();
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const { t } = useTranslation();
  const adustMarginFormState = useAdjustMarginFormState(chainId);
  const adjustFormStatus = useAdjustMarginFormStatus(chainId);
  const currentPair = useCurrentPairByDevice(chainId);
  const currentPosition = useMainPosition(chainId, userAddr, currentPair?.id);
  const portfolio = useWrappedPortfolioByPairId(chainId, userAddr, currentPair?.id);
  const { inputAmountStrChanged } = useMarginAdjustInputChanged(MarginAdjustMethod.Amount);
  const inputRef = useRef<HTMLDivElement>(null);
  const isWrappedNative = useMemo(() => {
    return chainId && isWrappedNativeToken(chainId, currentPair?.rootInstrument.marginToken.address || '');
  }, [chainId, currentPair?.rootInstrument.marginToken.address]);
  const manageSides = useMemo(() => {
    return [
      {
        label: t('common.tradePage.adjustMargin.topUp'),
        key: MANAGE_SIDE.IN.toString(),
        value: MANAGE_SIDE.IN.toString(),
      },
      {
        label: t('common.tradePage.adjustMargin.reduce'),
        key: MANAGE_SIDE.OUT.toString(),
        value: MANAGE_SIDE.OUT.toString(),
      },
    ];
  }, [t]);
  useEffect(() => {
    dispatch(setAdjustMarginSide({ method: MarginAdjustMethod.Amount, side: MANAGE_SIDE.IN }));
  }, [dispatch]);
  const displayBalance = useDisplayBalance(
    currentPosition,
    manageSide === MANAGE_SIDE.IN,
    chainId,
    currentPosition?.rootInstrument.marginToken.address,
  );

  const percentage = useMemo(() => {
    return formatNumber(
      WrappedBigNumber.from(adustMarginFormState.amount || 0)
        .div(displayBalance || 1)
        .mul(100).stringValue,
      1,
      false,
      BigNumber.ROUND_UP,
    );
  }, [adustMarginFormState.amount, displayBalance]);

  const onSideChange = useCallback(
    (key: string) => {
      dispatch(
        setAdjustMarginSide({
          side: key as MANAGE_SIDE,
          method: MarginAdjustMethod.Amount,
        }),
      );
    },
    [dispatch],
  );
  const percentageChange = useCallback(
    (percentage: number) => {
      console.log('🚀 ~ file: index.tsx:354 ~ percentage:', percentage);
      const amount = displayBalance.mul(percentage).div(100);
      inputAmountStrChanged(inputNumChecker(amount.stringValue, currentPair?.rootInstrument.marginToken.decimals));
    },
    [currentPair?.rootInstrument.marginToken.decimals, displayBalance, inputAmountStrChanged],
  );

  useEffect(() => {
    inputAmountStrChanged('', true);
    if (!isMobile) {
      inputRef.current?.querySelector('input')?.focus();
    }
    // must dep on manageSide
    return () => {
      inputAmountStrChanged('', true);
      if (!isMobile) {
        inputRef.current?.querySelector('input')?.focus();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manageSide, isMobile]);

  return {
    currentPair,
    manageSide,
    adjustFormStatus,
    onSideChange,
    percentageChange,
    isWrappedNative,
    manageSides,
    displayBalance,
    adustMarginFormState,
    percentage,
    inputRef,
    portfolio,
  };
}
