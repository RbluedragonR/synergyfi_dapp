import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { WALLET_CONNECT_STATUS, WalletType } from '@/types/wallet';

import { WALLET_TYPE } from '@/constants/storage';
import type { User } from '@privy-io/react-auth';
import { AppState } from '../store';
import { setPrivyUserAfterLogin, setWalletChainId } from './actions';

export interface IWalletState {
  walletType: WalletType | undefined;
  walletConnectStatus: WALLET_CONNECT_STATUS;
  privyConnectInfo?: {
    user: User;
    isNewUser: boolean;
    wasAlreadyAuthenticated: boolean;
    loginMethod: string | null;
  };
  walletChainId: number | undefined;
}

export const initialState: IWalletState = {
  walletType: undefined,
  walletConnectStatus: WALLET_CONNECT_STATUS.UN_CONNECT,
  privyConnectInfo: undefined,
  walletChainId: undefined,
};

export const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setWalletType: (state, { payload: { type } }: PayloadAction<{ type: WalletType | undefined }>) => {
      state.walletType = type;
      if (type) localStorage.setItem(WALLET_TYPE, type);
      else localStorage.removeItem(WALLET_TYPE);
    },
    setWalletConnectStatus: (state, { payload: { status } }: PayloadAction<{ status: WALLET_CONNECT_STATUS }>) => {
      state.walletConnectStatus = status;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(setPrivyUserAfterLogin, (state, { payload }) => {
      if (payload) {
        state.privyConnectInfo = payload;
      }
    });
    builder.addCase(setWalletChainId, (state, { payload: { chainId } }) => {
      state.walletChainId = chainId;
    });
  },
});

export const { setWalletType, setWalletConnectStatus } = walletSlice.actions;

export const selectWalletState = (state: AppState): IWalletState => state.wallet;
export const selectWalletType = (state: AppState): WalletType | undefined => state.wallet.walletType;
export const selectWalletConnectStatus = (state: AppState): WALLET_CONNECT_STATUS => state.wallet.walletConnectStatus;
export const selectWalletChainId = (state: AppState): number | undefined => state.wallet.walletChainId;

export default walletSlice.reducer;
