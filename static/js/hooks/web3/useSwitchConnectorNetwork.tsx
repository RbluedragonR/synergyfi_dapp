import { useCallback } from 'react';

// import { useTranslation } from 'react-i18next';
// import localforage from 'localforage';
import { APP_CHAIN_ID } from '@/constants/storage';
import { changeCurrentChainId } from '@/features/chain/actions';
// import { useGa } from '@/hooks/useGa';
// import { useTxNotification } from '@/hooks/useTxNotification';
// import { GaCategory } from '@/utils/analytics';

import { DAPP_CHAIN_CONFIGS } from '@/constants/chain';
import { useWalletType } from '@/features/wallet/hook';
import { WalletType } from '@/types/wallet';
import { useNavigate } from 'react-router-dom';
import { useSwitchChain } from 'wagmi';
import { useAppDispatch } from '..';
import { usePrivySwitchNetwork } from '../../connectors/privy/usePrivyWallet';
import { useChainId } from './useChain';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useSwitchNetwork(): {
  switchAppNetwork: (desiredChainId: number) => Promise<void>;
  switchWalletNetwork: (desiredChainId: number) => Promise<boolean>;
} {
  const dispatch = useAppDispatch();
  const { switchChainAsync } = useSwitchChain();
  const walletType = useWalletType();
  const privySwitchNetwork = usePrivySwitchNetwork();
  const navigate = useNavigate();
  const chainId = useChainId();

  const switchAppNetwork = useCallback(
    async (desiredChainId: number) => {
      const currChainidShortName = chainId && DAPP_CHAIN_CONFIGS[chainId].network.shortName;
      const desiredChainidShortName = chainId && DAPP_CHAIN_CONFIGS[desiredChainId].network.shortName;
      if (currChainidShortName && desiredChainidShortName) {
        localStorage.setItem(APP_CHAIN_ID, desiredChainId.toString());
        navigate(`${document.location.hash.replace(currChainidShortName, desiredChainidShortName).replace('#', '')}`);
        dispatch(changeCurrentChainId({ chainId: desiredChainId }));
      }
    },
    [chainId, dispatch, navigate],
  );

  const switchWalletNetwork = useCallback(
    async (desiredChainId: number) => {
      if (walletType === WalletType.PRIVY) return privySwitchNetwork(desiredChainId);
      try {
        // localStorage.removeItem('wagmi.store');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await switchChainAsync({ chainId: desiredChainId });

        return true;
      } catch (error) {
        console.error('🚀 ~ file: useNetwork.ts ~ line 117 ~ async ~ error', error);
      }
      return false;
    },
    [privySwitchNetwork, switchChainAsync, walletType],
  );

  return { switchAppNetwork, switchWalletNetwork };
}
