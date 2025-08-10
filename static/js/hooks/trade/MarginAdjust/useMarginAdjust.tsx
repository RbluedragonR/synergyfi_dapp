import { FETCHING_STATUS } from '@/constants';
import { ERROR_MSG_INSUFFICIENT_MARGIN } from '@/constants/simulation';
import { MANAGE_SIDE } from '@/constants/trade';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useMainPosition } from '@/features/account/positionHook';
import { useDisplayBalance, useTokenBalance } from '@/features/balance/hook';
import { useGlobalConfig } from '@/features/global/hooks';
import { useCurrentPairByDevice } from '@/features/pair/hook';

import Alert from '@/components/Alert';
import { adjustMargin, resetFormByChainId } from '@/features/trade/actions';
import { useAdjustMarginFormState, useAdjustMarginFormStatus, useAdjustMarginSimulation } from '@/features/trade/hooks';
import { useAppProvider, useSDK } from '@/features/web3/hook';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { useWalletSigner } from '@/hooks/web3/useWalletNetwork';
import { MarginAdjustMethod } from '@/types/trade';
import { inputNumChecker, toWad } from '@/utils/numberUtil';
import { ZERO } from '@synfutures/sdks-perp';
import { useCallback, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import useMarginAdjustInputChanged from './useMarginAdjustSimulate';

export default function useMarginAdjust(onClose?: () => void) {
  const manageSide = useAppSelector(
    (state) => state.trade.adjustMarginControlState.manageSides.MarginAdjustMethod_Amount,
  );
  const dispatch = useAppDispatch();
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const provider = useAppProvider();
  const { t } = useTranslation();
  const adjustMarginFormState = useAdjustMarginFormState(chainId);
  const adjustFormStatus = useAdjustMarginFormStatus(chainId);
  const currentPair = useCurrentPairByDevice(chainId);
  const activeMarginAdjustMethod = useAppSelector((state) => state.trade.adjustMarginControlState.marginAdjustMethod);
  const { inputAmountStrChanged } = useMarginAdjustInputChanged(activeMarginAdjustMethod);
  const currentPosition = useMainPosition(chainId, userAddr, currentPair?.id);

  const marginToken = useMemo(() => currentPair?.rootInstrument.marginToken, [currentPair?.rootInstrument.marginToken]);
  const adjustMarginSimulation = useAdjustMarginSimulation(chainId);
  const isLoading = useMemo(() => adjustFormStatus === FETCHING_STATUS.FETCHING, [adjustFormStatus]);
  const sdkContext = useSDK(chainId);
  const signer = useWalletSigner();
  const { deadline } = useGlobalConfig(chainId);
  const walletBalance = useTokenBalance(currentPair?.rootInstrument?.quoteToken?.address, chainId);
  const walletNoBalance = useMemo(() => {
    return walletBalance.lt(WrappedBigNumber.from(adjustMarginSimulation?.data?.marginToDepositWad || 0));
  }, [adjustMarginSimulation?.data?.marginToDepositWad, walletBalance]);

  const withinWB = useMemo(
    () => walletBalance.gte(WrappedBigNumber.from(adjustMarginSimulation?.data?.marginToDepositWad || 0)),
    [walletBalance, adjustMarginSimulation?.data?.marginToDepositWad],
  );
  const displayBalance = useDisplayBalance(
    currentPosition,
    manageSide === MANAGE_SIDE.IN,
    chainId,
    currentPosition?.rootInstrument.marginToken.address,
  );

  const isDisable = useMemo(() => {
    if (walletNoBalance) return true;
    if (!withinWB) {
      return true;
    }

    return !!adjustMarginSimulation?.message;
  }, [adjustMarginSimulation?.message, walletNoBalance, withinWB]);

  const isShowDepositInfo = useMemo(() => {
    const margin = adjustMarginSimulation?.data?.marginToDepositWad;
    return !adjustMarginSimulation?.message && margin && !margin.eq(0);
  }, [adjustMarginSimulation?.data?.marginToDepositWad, adjustMarginSimulation?.message]);

  const closeSection = useCallback(() => {
    chainId &&
      dispatch(
        resetFormByChainId({
          chainId,
        }),
      );
  }, [chainId, dispatch]);

  const depositInfo = useMemo(() => {
    const margin = WrappedBigNumber.from(adjustMarginSimulation?.data?.marginToDepositWad || 0);
    if (isShowDepositInfo) {
      return (
        <Alert
          message={
            withinWB ? (
              <Trans
                t={t}
                i18nKey={'errors.trade.depositInfo'}
                values={{
                  deposit: margin?.abs().formatDisplayNumber(),
                  quote: marginToken?.symbol,
                }}
                components={{ b: <b /> }}
              />
            ) : (
              <>
                <Trans
                  t={t}
                  i18nKey={'errors.trade.marginExceedWB'}
                  components={{
                    b: <b />,
                  }}
                />
                {activeMarginAdjustMethod === MarginAdjustMethod.Amount && (
                  <a
                    className="syn-trade-adjust-content-form-item-use-max"
                    onClick={() => {
                      inputAmountStrChanged(
                        inputNumChecker(displayBalance.stringValue, currentPair?.rootInstrument.marginToken.decimals),
                      );
                    }}>
                    {t('common.useMax')}
                  </a>
                )}
              </>
            )
          }
          type={withinWB ? 'info' : 'error'}
          showIcon
        />
      );
    }
  }, [
    adjustMarginSimulation?.data?.marginToDepositWad,
    isShowDepositInfo,
    withinWB,
    t,
    marginToken?.symbol,
    activeMarginAdjustMethod,
    inputAmountStrChanged,
    displayBalance.stringValue,
    currentPair?.rootInstrument.marginToken.decimals,
  ]);
  const errMsg = useMemo(() => {
    if (adjustMarginSimulation?.message === ERROR_MSG_INSUFFICIENT_MARGIN) {
      return (
        <>
          <span>{adjustMarginSimulation?.message}. </span>
          <a
            className="syn-trade-adjust-content-form-item-use-max"
            onClick={() => {
              inputAmountStrChanged(
                inputNumChecker(displayBalance.stringValue, currentPair?.rootInstrument.marginToken.decimals),
              );
            }}>
            {t('common.useMax')}
          </a>
        </>
      );
    }
    return adjustMarginSimulation?.message;
  }, [
    adjustMarginSimulation?.message,
    currentPair?.rootInstrument.marginToken.decimals,
    displayBalance,
    inputAmountStrChanged,
    t,
  ]);

  const marginTokenAmount = useMemo(() => {
    return adjustMarginFormState?.marginToDeposit
      ? WrappedBigNumber.from(adjustMarginFormState?.marginToDeposit).wadValue
      : ZERO;
  }, [adjustMarginFormState?.marginToDeposit]);

  const adjustPositionMargin = useCallback(async () => {
    if (chainId && signer && currentPair && userAddr && sdkContext && deadline && provider) {
      const amount = toWad(adjustMarginFormState.amount);
      try {
        const result = await dispatch(
          adjustMargin({
            chainId,
            signer,
            pair: currentPair,
            userAddr,
            sdkContext,
            transferIn: !!adjustMarginFormState.transferIn,
            margin: amount.abs(),
            deadline: Number(deadline),
            provider,
          }),
        ).unwrap();
        if (result && onClose) {
          onClose();
        }
      } catch (e) {}
    }
  }, [
    adjustMarginFormState.amount,
    adjustMarginFormState.transferIn,
    chainId,
    currentPair,
    deadline,
    dispatch,
    onClose,
    sdkContext,
    signer,
    userAddr,
    provider,
  ]);

  return {
    closeSection,
    marginTokenAmount,
    isLoading,
    isDisable,
    adjustPositionMargin,
    adjustFormStatus,
    adjustMarginSimulation,
    currentPosition,
    errMsg,
    isShowDepositInfo,
    depositInfo,
    displayBalance,
    adjustMarginFormState,
  };
}
