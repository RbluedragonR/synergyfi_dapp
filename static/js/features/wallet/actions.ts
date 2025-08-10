import { createAction, createAsyncThunk } from '@reduxjs/toolkit';

import { IWeb3WalletInfo } from '@/types/wallet';
import { User } from '@privy-io/react-auth';

export const connectWallet = createAsyncThunk('wallet/connect', async ({ wallet }: { wallet: IWeb3WalletInfo }) => {
  try {
    await wallet?.connector?.connect();
  } catch (e) {
    console.error('🚀 ~ file: actions.ts:8 ~ connectWal ~ e', e);
  }
});

export const setPrivyUserAfterLogin = createAction<{
  user: User;
  isNewUser: boolean;
  wasAlreadyAuthenticated: boolean;
  loginMethod: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  linkedAccount: any | null;
}>('wallet/setPrivyUserAfterLogin');
export const setWalletChainId = createAction<{ chainId: number | undefined }>('wallet/setWalletChainId');
