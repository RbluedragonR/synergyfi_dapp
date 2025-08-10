import { JsonRpcProvider, JsonRpcSigner, WebSocketProvider } from '@ethersproject/providers';
import { createSlice } from '@reduxjs/toolkit';
import _ from 'lodash';

import { Context } from '@derivation-tech/context';
import { AppState } from '../store';
import { initSDKContext, setAppProvider, setAppSigner } from './actions';

export interface IWeb3State {
  chainSDK: {
    [chainId: number]: Context;
  };
  chainAppProvider: {
    [chainId: number]: WebSocketProvider | JsonRpcProvider;
  };
  chainSigner: {
    [chainId: number]: JsonRpcSigner | undefined;
  };
}
export const initialState: IWeb3State = {
  chainSDK: {},
  chainAppProvider: {},
  chainSigner: {},
};

export const web3Slice = createSlice({
  name: 'web3',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(initSDKContext.fulfilled, (state, action) => {
      const { arg } = action.meta;
      if (action.payload) {
        _.set(state.chainSDK, [arg.chainId], action.payload);
      }
    });

    builder.addCase(setAppProvider.fulfilled, (state, action) => {
      const { arg } = action.meta;
      if (action.payload) {
        _.set(state.chainAppProvider, [arg.chainId], action.payload);
      }
    });
    builder.addCase(setAppSigner, (state, { payload }) => {
      _.set(state.chainSigner, [payload.chainId], payload.signer);
    });
  },
});

export const selectWeb3State = (state: AppState): IWeb3State => state.web3;

export const selectAppProvider =
  (chainId: number | undefined): ((state: AppState) => WebSocketProvider | JsonRpcProvider | undefined) =>
  (state: AppState): WebSocketProvider | JsonRpcProvider | undefined =>
    chainId ? state.web3.chainAppProvider[chainId] : undefined;

export const selectSigner =
  (chainId: number | undefined): ((state: AppState) => JsonRpcSigner | undefined) =>
  (state: AppState): JsonRpcSigner | undefined =>
    chainId ? state.web3.chainSigner[chainId] : undefined;

export const selectSDK =
  (chainId: number | undefined): ((state: AppState) => Context | undefined) =>
  (state: AppState): Context | undefined =>
    chainId ? state.web3.chainSDK[chainId] : undefined;

export default web3Slice.reducer;
