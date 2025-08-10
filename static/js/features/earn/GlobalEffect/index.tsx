import { useAppDispatch } from '@/hooks';
import { useChainId } from '@/hooks/web3/useChain';
import React, { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { resetLiquidityFormByChainId } from '../action';

export function useResetPage(chainId: number | undefined): void {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const isEarnPage = useMemo(() => {
    return location?.pathname.startsWith('/earn');
  }, [location?.pathname]);

  useEffect(() => {
    if (!isEarnPage) {
      chainId && dispatch(resetLiquidityFormByChainId({ chainId }));
    }
  }, [isEarnPage, dispatch]);
}

function EarnGlobalEffect(): null {
  const chainId = useChainId();
  // const userAddr = useUserAddr();
  useResetPage(chainId);

  return null;
}

export default React.memo(EarnGlobalEffect);
