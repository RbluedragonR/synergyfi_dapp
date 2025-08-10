import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';

import accountReducer from './account/slice';
import balanceReducer from './balance/balanceSlice';
import { campaignReducer } from './campaign/slice';
import chainReducer from './chain/chainSlice';
import chartReducer from './chart/slice';
import { configReducer } from './config/slice';
import earnReducer from './earn/slice';
import futuresReducer from './futures/slice';
import globalReducer from './global/globalSlice';
import graphReducer from './graph/slice';
import marketReducer from './market/slice';
import odysseyReducer from './odyssey/slice';
import pairReducer from './pair/pairSlice';
import portfolioSlice from './portfolio/slice';
import tgpReducer from './tgp/slice';
import tradeReducer from './trade/slice';
import transactionReducer from './transaction/transactionSlice';
import userReducer from './user/userSlice';
import vaultReducer from './vault/slice';
import walletReducer from './wallet/walletSlice';
import web3Reducer from './web3/web3Slice';

export const PERSISTED_KEYS: string[] = [];

export const storeReducer = {
  user: userReducer,
  chain: chainReducer,
  balance: balanceReducer,
  web3: web3Reducer,
  global: globalReducer,
  transaction: transactionReducer,
  wallet: walletReducer,
  trade: tradeReducer,
  pair: pairReducer,
  futures: futuresReducer,
  account: accountReducer,
  earn: earnReducer,
  graph: graphReducer,
  chart: chartReducer,
  portfolio: portfolioSlice,
  odyssey: odysseyReducer,
  tgp: tgpReducer,
  market: marketReducer,
  vault: vaultReducer,
  campaign: campaignReducer,
  config: configReducer,
};

export const store = configureStore({
  reducer: storeReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
  // .concat(save({ states: PERSISTED_KEYS })),
  // preloadedState: load({ states: PERSISTED_KEYS, disableWarnings: true }),
});

export type AppDispatch = typeof store.dispatch;
export type AppState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, AppState, unknown, Action<string>>;
