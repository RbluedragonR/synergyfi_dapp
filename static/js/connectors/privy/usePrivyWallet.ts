import { CHAIN_ID } from '@/constants/chain';
import { useAppChainId } from '@/features/web3/hook';
import { getDefaultChainId } from '@/utils/chain';
import type { Web3Provider } from '@ethersproject/providers';
import { ConnectedWallet, User, useLogin, useLogout, useModalStatus, usePrivy, useWallets } from '@privy-io/react-auth';
import { useAsyncEffect } from 'ahooks';
import { useCallback, useMemo, useState } from 'react';

export function usePrivyIsReady(): boolean {
  const { ready } = usePrivy();
  return ready;
}

export function usePrivyWallet(): ConnectedWallet | undefined {
  const { wallets } = useWallets();
  const privyWallet = useMemo(() => {
    return wallets.find((wallet) => wallet.walletClientType === 'privy');
  }, [wallets]);

  return privyWallet;
}

export function usePrivyProvider(): Web3Provider | undefined {
  const [privyProvider, setPrivyProvider] = useState<Web3Provider>();
  const privyWallet = usePrivyWallet();
  useAsyncEffect(async () => {
    if (!privyWallet) return;
    const provider = await privyWallet.getEthersProvider();
    provider && setPrivyProvider(provider);
  }, [privyWallet]);

  return privyProvider;
}

export const usePrivyChainId = (): CHAIN_ID | undefined => {
  const wallet = usePrivyWallet();

  return useMemo(() => {
    if (!wallet?.chainId) return;
    return Number(wallet?.chainId.split(':')[1]) as CHAIN_ID;
  }, [wallet?.chainId]);
};
export const usePrivyWalletAddress = (): string | undefined => {
  const wallet = usePrivyWallet();
  return useMemo(() => {
    return wallet?.address?.toLowerCase();
  }, [wallet?.address]);
};
export const usePrivyIsActive = (): boolean => {
  const { ready, authenticated } = usePrivy();

  return useMemo(() => ready && authenticated, [authenticated, ready]);
};

export function usePrivyIsWrongNetwork(): boolean {
  const chainId = usePrivyChainId();
  const appChainId = useAppChainId();

  const isWrongNetwork = useMemo(() => {
    if (chainId && appChainId) {
      return appChainId !== chainId;
    }
    return chainId !== getDefaultChainId();
  }, [appChainId, chainId]);
  return isWrongNetwork;
}

export function usePrivySwitchNetwork(): (desiredChainId: number) => Promise<boolean> {
  const wallet = usePrivyWallet();
  return useCallback(
    async (desiredChainId: number) => {
      if (!wallet) return false;
      try {
        await wallet?.switchChain(desiredChainId);

        return true;
      } catch (error) {
        console.error('🚀 ~ usePrivySwitchNetwork ~ error', error);
      }
      return false;
    },
    [wallet],
  );
}

export function useLoginInOrOutPrivyWallet(
  callbackAfterLogin?: (
    isLogin: boolean,
    successLogin?: {
      user: User;
      isNewUser: boolean;
      wasAlreadyAuthenticated: boolean;
      loginMethod: string | null;
      linkedAccount: unknown | null;
    },
  ) => void,
  errorAfterLogin?: (error: string) => void,
) {
  const { login } = useLogin({
    onComplete: (user, isNewUser, wasAlreadyAuthenticated, loginMethod, linkedAccount) => {
      console.log('privy login onComplete', { user, isNewUser, wasAlreadyAuthenticated, loginMethod, linkedAccount });
      callbackAfterLogin &&
        callbackAfterLogin(true, { user, isNewUser, wasAlreadyAuthenticated, loginMethod, linkedAccount });
      // Any logic you'd like to execute if the user is/becomes authenticated while this
      // component is mounted
    },
    onError: (error) => {
      console.log('privy login onError', error);
      errorAfterLogin && errorAfterLogin(error);
      // Any logic you'd like to execute after a user exits the login flow or there is an error
    },
  });

  const { logout } = useLogout({
    onSuccess: () => {
      console.log('privy User logged out');
      callbackAfterLogin && callbackAfterLogin(false);
      // Any logic you'd like to execute after a user successfully logs out
    },
  });

  return { login, logout };
}

export function useIsOpenPrivyModal() {
  const { isOpen } = useModalStatus();
  return isOpen;
}

export function usePrivyUserInfo() {
  const { user } = usePrivy();
  return user;
}
