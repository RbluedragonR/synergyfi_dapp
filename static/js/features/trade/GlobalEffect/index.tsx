import { useEffect } from 'react';

import { useAppDispatch } from '@/hooks';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';

import { resetFormByChainId } from '../actions';

function TradeGlobalEffect(): null {
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (chainId) {
      dispatch(resetFormByChainId({ chainId }));
    }
  }, [chainId, dispatch, userAddr]);

  return null;
}

export default TradeGlobalEffect;
