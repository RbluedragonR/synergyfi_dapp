import { MANAGE_SIDE } from '@/constants/trade';
import { useWrappedPortfolioByPairId } from '@/features/account/portfolioHook';
import { useMainPosition } from '@/features/account/positionHook';
import { useAvailableTokenBalance } from '@/features/balance/hook';
import { useCurrentPairByDevice } from '@/features/pair/hook';
import { resetAdjustMarginForm, setAdjustMarginByLeverageState, setAdjustMarginSide } from '@/features/trade/actions';
import { useSDK } from '@/features/web3/hook';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { MarginAdjustMethod } from '@/types/trade';
import { getMinMaxLeverageInAdjustMargin } from '@/utils/trade';
import { utils as SDKUtils } from '@synfutures/sdks-perp';
import { useDebounce } from 'ahooks';
import { utils } from 'ethers';
import { formatEther, parseUnits } from 'ethers/lib/utils';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useMarginAdjustInputChanged from './useMarginAdjustSimulate';

export const useMarginAdjustByLeverageInput = () => {
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const dispatch = useAppDispatch();
  const leverageInput = useAppSelector(
    (state) => chainId && state.trade.chainAdjustMarginByLeverageState[chainId]?.leverageInput,
  );
  const isLeverageInputChanged = useAppSelector(
    (state) => chainId && state.trade.chainAdjustMarginByLeverageState[chainId]?.isLeverageInputChanged,
  );
  const setLeverageInput = useCallback(
    (leverageInput: string) => {
      if (chainId) {
        dispatch(setAdjustMarginByLeverageState({ chainId, isLeverageInputChanged: true, leverageInput }));
      }
    },
    [chainId, dispatch],
  );
  const currentPair = useCurrentPairByDevice(chainId);
  const currentPosition = useMainPosition(chainId, userAddr, currentPair?.id);
  const currLeverage = currentPosition ? formatEther(currentPosition.wrapAttribute('leverageWad').wadValue) : '0';

  const finalLeverageInput = useMemo(() => leverageInput || currLeverage, [currLeverage, leverageInput]);

  useEffect(() => {
    return () => {
      // reset when unmount
      if (chainId) {
        dispatch(
          setAdjustMarginByLeverageState({ chainId, leverageInput: null, isLeverageInputChanged: false, errMsg: null }),
        );
        dispatch(resetAdjustMarginForm({ chainId }));
      }
    };
  }, [chainId, dispatch]);
  return { disable: !isLeverageInputChanged, leverageInput: finalLeverageInput, setLeverageInput };
};

export default function useMarginAdjustByLeverage() {
  const chainId = useChainId();
  const dispatch = useAppDispatch();
  const userAddr = useUserAddr();
  const currentPair = useCurrentPairByDevice(chainId);
  const currentPosition = useMainPosition(chainId, userAddr, currentPair?.id);
  const portfolio = useWrappedPortfolioByPairId(chainId, userAddr, currentPair?.id);
  const sdkContext = useSDK(chainId);
  const tokenBalance = useAvailableTokenBalance(currentPosition?.rootInstrument.marginToken.address, chainId);
  const { t } = useTranslation();
  const { inputAmountStrChanged } = useMarginAdjustInputChanged(MarginAdjustMethod.Leverage);
  const { leverageInput, setLeverageInput, disable } = useMarginAdjustByLeverageInput();
  const debouncedLeverageInputAmount = useDebounce(leverageInput, { wait: 500 });
  // positive means transferIn, negative means transferOut
  const debouncedInputAmountStr = useMemo(() => {
    if (debouncedLeverageInputAmount && currentPosition && sdkContext && !disable && chainId) {
      const { maxLeverage } = getMinMaxLeverageInAdjustMargin({
        chainId,
        sdkContext,
        portfolio,
        availableBalance: parseUnits(tokenBalance.toString(), currentPosition.rootInstrument.marginToken.decimals),
        position: currentPosition,
      });

      if (maxLeverage && maxLeverage >= Number(debouncedLeverageInputAmount)) {
        const transferAmountWad = SDKUtils.inquireTransferAmountFromTargetLeverage(
          currentPosition,
          currentPosition.rootPair,
          utils.parseEther(debouncedLeverageInputAmount),
        );
        dispatch(
          setAdjustMarginSide({
            side: transferAmountWad.lt(0) ? MANAGE_SIDE.OUT : MANAGE_SIDE.IN,
            method: MarginAdjustMethod.Leverage,
          }),
        );
        dispatch(
          setAdjustMarginByLeverageState({
            chainId,
            errMsg: null,
          }),
        );
        return utils.formatEther(transferAmountWad.abs());
      } else {
        dispatch(resetAdjustMarginForm({ chainId }));
        maxLeverage &&
          dispatch(
            setAdjustMarginByLeverageState({
              chainId,
              errMsg: (
                <>
                  <span>{t('common.warning.maxLeverage', { leverage: maxLeverage })} </span>
                  <a
                    className="syn-trade-adjust-content-form-item-use-max"
                    onClick={() => {
                      setLeverageInput(maxLeverage.toString());
                    }}>
                    {t('common.useMax')}
                  </a>
                </>
              ),
            }),
          );
      }
    } else {
      dispatch(
        setAdjustMarginSide({
          side: MANAGE_SIDE.IN,
          method: MarginAdjustMethod.Leverage,
        }),
      );
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    chainId,
    //currentPosition,
    debouncedLeverageInputAmount,
    disable,
    dispatch,
    //portfolio,
    //sdkContext,
    // setLeverageInput,
    t,
    //tokenBalance,
  ]);

  useEffect(() => {
    if (debouncedInputAmountStr) {
      inputAmountStrChanged(debouncedInputAmountStr);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInputAmountStr]);

  return { leverageInput, setLeverageInput, debouncedInputAmountStr };
}
