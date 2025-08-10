/**
 * @description Component-ScaleFormDetail
 */
import { WrappedPair } from '@/entities/WrappedPair';
import './index.less';

import { useScaleFormState, useScaleSimulation } from '@/features/trade/hooks';
import { useChainId } from '@/hooks/web3/useChain';
import { toBN } from '@/utils/numberUtil';
import { Side } from '@synfutures/sdks-perp';
import { FC } from 'react';
import { LimitFormDetail } from '../TradeLimitForm/LimitFormDetail';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  currentPair?: WrappedPair;
  tradeSide: Side;
}
const ScaleFormDetail: FC<IPropTypes> = function ({ currentPair, tradeSide }) {
  const chainId = useChainId();
  const scaleFormState = useScaleFormState(chainId);
  const scaleSimulation = useScaleSimulation(chainId);
  return (
    <>
      {toBN(scaleFormState.baseAmount || 0).gt(0) && (
        <LimitFormDetail
          marginToken={currentPair?.rootInstrument.marginToken}
          fairPrice={currentPair?.wrapAttribute('fairPrice')}
          isLoading={false}
          chainId={chainId}
          pairSymbol={currentPair?.symbol}
          tradeSide={tradeSide}
          simulationData={scaleSimulation?.data}
        />
      )}
    </>
  );
};

export default ScaleFormDetail;
