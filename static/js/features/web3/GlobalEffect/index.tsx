import { useEffect } from 'react';

import { useAppDispatch } from '@/hooks';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';

import { useTokensInfoConfig } from '@/features/config/hook';
import { useWalletSigner } from '@/hooks/web3/useWalletNetwork';
import { initSDKContext, setAppSigner } from '../actions';
import { useAppProvider } from '../hook';

/**
 * watch provider change
 * @returns
 */
export function useProviderWatcher(): null {
  const provider = useAppProvider();
  const chainId = useChainId();
  const dispatch = useAppDispatch();
  const walletSigner = useWalletSigner();

  const account = useUserAddr();
  const tokensInfoConfig = useTokensInfoConfig(chainId);

  useEffect(() => {
    if (chainId && provider) {
      dispatch(initSDKContext({ chainId, provider }));
    }
  }, [chainId, dispatch, provider, tokensInfoConfig?.erc20Tokens]);

  useEffect(() => {
    if (chainId && walletSigner && account) {
      dispatch(setAppSigner({ chainId, signer: walletSigner }));
    } else if (chainId) {
      dispatch(setAppSigner({ chainId, signer: undefined }));
    }
  }, [account, chainId, dispatch, walletSigner]);

  return null;
}
export default function Web3GlobalEffect(): null {
  // useInitiateLeaderShip(chainId);
  useProviderWatcher();
  return null;
}
