import { MANAGE_SIDE } from '@/constants/trade';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useWrappedPortfolioByPairId } from '@/features/account/portfolioHook';
import { useTokenGateBalanceByChainIdAndAddress } from '@/features/balance/hook';
import { useGlobalConfig } from '@/features/global/hooks';
import { useCurrentPairByDevice } from '@/features/pair/hook';

import { setAdjustMarginFormAmount, simulateAdjustMargin } from '@/features/trade/actions';
import { useSDK } from '@/features/web3/hook';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { MarginAdjustMethod } from '@/types/trade';
import { toWad } from '@/utils/numberUtil';
import { useDebounceFn } from 'ahooks';
import { useCallback } from 'react';

export default function useMarginAdjustInputChanged(method: MarginAdjustMethod) {
  const manageSide = useAppSelector((state) => state.trade.adjustMarginControlState.manageSides[method]);
  const dispatch = useAppDispatch();
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const currentPair = useCurrentPairByDevice(chainId);
  const portfolio = useWrappedPortfolioByPairId(chainId, userAddr, currentPair?.id);
  const { slippage } = useGlobalConfig(chainId);
  const gateBalanceInfo = useTokenGateBalanceByChainIdAndAddress(
    chainId,
    currentPair?.rootInstrument.marginToken.address,
  );
  const sdkContext = useSDK(chainId);
  const simulateAfterInput = useCallback(
    async (inputAmountStr: string, transferIn: boolean) => {
      if (chainId && portfolio && gateBalanceInfo?.balance) {
        try {
          const simulation = await dispatch(
            simulateAdjustMargin({
              chainId,
              pair: currentPair,
              portfolio,
              transferAmount: toWad(inputAmountStr || 0),
              leverage: undefined,
              sdkContext,
              transferIn,
              slippage: Number(slippage),
            }),
          ).unwrap();

          if (simulation?.data) {
            // dispatch(setAdjustMarginSimulation({ chainId, ...simulation }));
            dispatch(
              setAdjustMarginFormAmount({
                chainId,
                transferIn,
                // amount: WrappedBigNumber.from(simulation.transferAmountWad).abs().stringValue,
                amount: inputAmountStr,
                marginToDeposit: WrappedBigNumber.from(simulation.data.marginToDepositWad).stringValue,
              }),
            );
          }
        } catch (e) {
          console.log('🚀 ~ file: index.tsx:71 ~ e:', e);
        }
      }
    },
    [chainId, currentPair, dispatch, gateBalanceInfo?.balance, portfolio, sdkContext, slippage],
  );
  const { run: debouncedSimulateAfterInput } = useDebounceFn(simulateAfterInput, {
    wait: 500,
  });

  const inputAmountStrChanged = useCallback(
    (inputAmountStr: string, noNeedDebounced = false) => {
      chainId && dispatch(setAdjustMarginFormAmount({ chainId, amount: inputAmountStr }));
      if (noNeedDebounced) {
        simulateAfterInput(inputAmountStr, manageSide === MANAGE_SIDE.IN);
      } else {
        debouncedSimulateAfterInput(inputAmountStr, manageSide === MANAGE_SIDE.IN);
      }
    },
    [chainId, debouncedSimulateAfterInput, dispatch, manageSide, simulateAfterInput],
  );
  return {
    inputAmountStrChanged,
  };
}
