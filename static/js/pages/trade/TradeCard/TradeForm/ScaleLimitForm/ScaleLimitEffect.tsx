/**
 * @description Component-ScaleLimitEffect
 */
import { useChainId } from '@/hooks/web3/useChain';
import './index.less';

import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { WrappedPortfolio } from '@/entities/WrappedPortfolio';
import { useAvailableTokenBalance } from '@/features/balance/hook';
import { simulateBatchPlaceScaledLimitOrder } from '@/features/trade/actions';
import { useScaleFormState } from '@/features/trade/hooks';
import { useAppDispatch } from '@/hooks';
import { Context } from '@derivation-tech/context';
import { Side } from '@synfutures/sdks-perp';
import { useDebounceFn } from 'ahooks';
import { FC, memo, useCallback, useEffect } from 'react';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  sdkContext: Context | undefined;
  tradeSide: Side;
  portfolio: WrappedPortfolio | undefined;
  upperPrice: WrappedBigNumber | undefined;
  lowerPrice: WrappedBigNumber | undefined;
}
const ScaleLimitEffect: FC<IPropTypes> = function ({ sdkContext, tradeSide, portfolio }) {
  const chainId = useChainId();
  const dispatch = useAppDispatch();
  const tokenBalance = useAvailableTokenBalance(portfolio?.rootInstrument.marginToken?.address, chainId);
  const scaleLimitState = useScaleFormState(chainId);
  const fetchSimulation = useCallback(() => {
    if (chainId && portfolio && sdkContext) {
      dispatch(
        simulateBatchPlaceScaledLimitOrder({
          chainId,
          sdkContext,
          tradeSide,
          portfolio,
        }),
      );
    }
  }, [chainId, portfolio, sdkContext, dispatch, tradeSide]);

  const { run: debouncedSimulateOrder } = useDebounceFn(
    () => {
      fetchSimulation();
    },
    { wait: 500 },
  );
  useEffect(() => {
    debouncedSimulateOrder();
  }, [
    scaleLimitState.orderCount,
    scaleLimitState.baseAmount,
    scaleLimitState.upperPrice,
    scaleLimitState.lowerPrice,
    tokenBalance?.stringValue,
    scaleLimitState.leverage,
    scaleLimitState.sizeDistribution,
    debouncedSimulateOrder,
  ]);
  return <></>;
};
export default memo(ScaleLimitEffect);
