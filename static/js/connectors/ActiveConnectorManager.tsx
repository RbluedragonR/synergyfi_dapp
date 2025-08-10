import { useEffect } from 'react';

import { setWalletType } from '@/features/wallet/walletSlice';
import { useAppDispatch } from '@/hooks';
import { WalletType } from '@/types/wallet';

import { WALLET_TYPE } from '@/constants/storage';
import { setPrivyUserAfterLogin } from '@/features/wallet/actions';
import { useWalletType } from '@/features/wallet/hook';
import { useWagmiDisconnect } from '@/hooks/web3/useWagami';
import { useLogin, usePrivy } from '@privy-io/react-auth';

function useActivePrivyConnect() {
  const walletType = useWalletType();
  const dispatch = useAppDispatch();
  const { ready, authenticated, isModalOpen } = usePrivy();
  const disconnect = useWagmiDisconnect();
  useEffect(() => {
    // set storage wallet type to privy if user is not authenticated and modal is open
    if (ready && !authenticated) {
      if (isModalOpen) {
        if (walletType !== WalletType.PRIVY) {
          localStorage.setItem(WALLET_TYPE, WalletType.PRIVY);
        }
      } else if (walletType) {
        localStorage.setItem(WALLET_TYPE, walletType);
      }
    }
  }, [isModalOpen, ready, authenticated, walletType]);

  useLogin({
    onComplete: (user, isNewUser, wasAlreadyAuthenticated, loginMethod, linkedAccount) => {
      // Any logic you'd like to execute if the user is/becomes authenticated while this
      // component is mounted
      dispatch(setPrivyUserAfterLogin({ user, isNewUser, wasAlreadyAuthenticated, loginMethod, linkedAccount }));
      const storageWalletType = localStorage.getItem(WALLET_TYPE);
      if (storageWalletType && storageWalletType === WalletType.PRIVY) {
        dispatch(setWalletType({ type: WalletType.PRIVY }));
        disconnect();
      }
    },
    onError: (error) => {
      console.log('privy login onError', error);
      // Any logic you'd like to execute after a user exits the login flow or there is an error
    },
  });
}

export default function ActiveConnectorManager({ children }: { children: JSX.Element }): JSX.Element {
  useActivePrivyConnect();

  return children;
}
