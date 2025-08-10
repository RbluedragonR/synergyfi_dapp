/**
 * @description Component-ScaleLeverage
 */
import { LEVERAGE_ADJUST_TYPE, TRADE_TYPE } from '@/constants/trade';
import LeverageAdjust from '../LeverageAdjust/LeverageAdjust';
import './index.less';

import { TRADE_LEVERAGE_THRESHOLDS } from '@/constants/global';
import { WrappedPair } from '@/entities/WrappedPair';
import { setTradeFormLeverage } from '@/features/trade/actions';
import { useScaleFormState, useTradeMaxLeverage } from '@/features/trade/hooks';
import { useAppDispatch } from '@/hooks';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { getSavedPairLeverage } from '@/utils/localstorage';
import { FC, useCallback, useEffect } from 'react';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  pair: WrappedPair | undefined;
  disabled?: boolean;
}
const ScaleLeverage: FC<IPropTypes> = function ({ pair, disabled }) {
  const chainId = useChainId();
  const scaleFormState = useScaleFormState(chainId);
  const dispatch = useAppDispatch();
  const userAddr = useUserAddr();
  const maxLeverage = useTradeMaxLeverage(pair?.maxLeverage);
  const leverageInputAmountStrChanged = useCallback(
    (leverage: string) => {
      chainId &&
        dispatch(
          setTradeFormLeverage({
            chainId,
            leverage,
          }),
        );
    },
    [chainId],
  );
  useEffect(() => {
    const leverageInStorage = getSavedPairLeverage(userAddr, chainId, pair?.id, TRADE_TYPE.SCALE_LIMIT);
    chainId &&
      dispatch(
        setTradeFormLeverage({
          chainId,
          leverage: leverageInStorage || TRADE_LEVERAGE_THRESHOLDS.DEFAULT.toString(),
        }),
      );
  }, [chainId]);
  return (
    <LeverageAdjust
      tradeType={TRADE_TYPE.SCALE_LIMIT}
      leverageAdjustType={LEVERAGE_ADJUST_TYPE.BY_LEVERAGE}
      showLeverageSwitch={false}
      pair={pair}
      leverage={scaleFormState.leverage || ''}
      leverageInputAmountStrChanged={leverageInputAmountStrChanged}
      disabled={disabled}
      maxLeverage={maxLeverage}
      quoteToken={pair?.rootInstrument.quoteToken}
      marginAmount={undefined}
    />
  );
};

export default ScaleLeverage;
