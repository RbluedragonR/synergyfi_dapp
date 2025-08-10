import React from 'react';

import { useChainId } from '@/hooks/web3/useChain';

import { useDefaultChainBalanceState } from '../hook';

function BalanceGlobalEffect(): JSX.Element {
  const chainId = useChainId();
  useDefaultChainBalanceState(chainId);
  return <></>;
}

export default React.memo(BalanceGlobalEffect);
