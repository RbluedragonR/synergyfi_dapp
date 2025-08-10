import { CHAIN_ID } from '@derivation-tech/context';
import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import localforage from 'localforage';
import _ from 'lodash';

import { PAIRS_FAVORITES_KEY } from '@/constants/storage';
import { IChainPairsFavorites, IMetaPair } from '@/types/pair';

import { AppState } from '../store';

export const setMetaPair = createAction<{ chainId: CHAIN_ID; pairId: string; pair: Partial<IMetaPair> }>(
  'pair/setMetaPair',
);

export const setChainPairFavorites = createAction<IChainPairsFavorites>('pair/setChainPairFavorites');

export const saveChainPairFavorite = createAsyncThunk(
  'pair/setChainPairFavorite',
  async ({ chainId, key, value }: { chainId: CHAIN_ID; key: string; value: boolean }, { getState, dispatch }) => {
    const {
      pair: { chainPairFavorites },
    } = getState() as AppState;
    const favorites = _.cloneDeep(chainPairFavorites);
    if (!value) {
      // just remove storage
      _.unset(favorites, [chainId, key]);
    } else {
      _.set(favorites, [chainId, key], value);
    }

    await localforage.setItem(PAIRS_FAVORITES_KEY, favorites);
    dispatch(setChainPairFavorites(favorites));
  },
);
