import { WrappedVault } from '@/entities/WrappedVault';
import { useTokenBalance } from '@/features/balance/hook';
import { useNativeToken, useTokenInfo, useWrappedNativeToken } from '@/features/chain/hook';
import { useEffect, useMemo, useState } from 'react';
import { useChainId } from '../web3/useChain';

export const useVaultMarginToken = (vault: WrappedVault) => {
  const chainId = useChainId();
  const [marginTokenAddr, setMarginTokenAddr] = useState(vault.quoteToken.address);
  const nativeToken = useNativeToken(chainId);
  const wrappedMarginToken = useTokenInfo(chainId, vault.quoteToken.address);
  const { isMarginTokenNative, marginToken } = useMemo(() => {
    if (nativeToken?.address === marginTokenAddr) {
      return { marginToken: nativeToken, isMarginTokenNative: true };
    } else {
      return { marginToken: wrappedMarginToken, isMarginTokenNative: false };
    }
  }, [marginTokenAddr, nativeToken, wrappedMarginToken]);
  const tokenBalance = useTokenBalance(marginToken?.address, chainId);
  const wrappedNativeToken = useWrappedNativeToken(chainId);
  const isVaultCanBeNative = useMemo(
    () => wrappedNativeToken?.address === vault.quoteToken.address,
    [vault.quoteToken.address, wrappedNativeToken?.address],
  );
  useEffect(() => {
    if (!isVaultCanBeNative) {
      setMarginTokenAddr(vault.quoteToken.address);
    }
  }, [isVaultCanBeNative, vault.quoteToken.address]);
  return {
    tokenBalance,
    setMarginTokenAddr,
    marginToken,
    isMarginTokenNative,
    isVaultCanBeNative,
  };
};
