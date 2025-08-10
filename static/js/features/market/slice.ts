import { createSlice } from '@reduxjs/toolkit';

import { MARKET_FILTERS } from '@/constants/market';
import { IMarginSearchProps } from '@/types/search';

import { setPartialMarginSearchProps } from './actions';

export interface IMarketState {
  marginSearchProps: IMarginSearchProps;
}

const initialState: IMarketState = {
  marginSearchProps: {
    filter: MARKET_FILTERS.PERPETUAL,
    marginCustomSelectorId: null,
  },
};

export const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(setPartialMarginSearchProps, (state, { payload }) => {
      state.marginSearchProps = {
        ...state.marginSearchProps,
        ...payload,
      };
    });
  },
});

export default marketSlice.reducer;
