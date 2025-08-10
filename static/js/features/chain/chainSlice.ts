import { CHAIN_ID } from '@derivation-tech/context';
import { createSlice, PayloadAction, SerializedError } from '@reduxjs/toolkit';
import _ from 'lodash';

import { FETCHING_STATUS, GAS_PRICE_TYPE } from '@/constants';
import { getDefaultChainId } from '@/utils/chain';

import { DAPP_CHAIN_CONFIGS } from '@/constants/chain';
import { TokenInfo } from '@/types/token';
import { AppState } from '../store';
import { changeCurrentChainId, getChainTokenList } from './actions';

export type TBlockStatus = {
  blockNumber: number;
  // blockStatus?: IIndexerBlockStatus;
  fetchingStatus?: FETCHING_STATUS;
  error?: SerializedError;
  timestamp: number;
};
export interface IChainState {
  currentChainId: number;
  prevChainId: number;
  chainGasPriceConfig: {
    // gasPrice: number;
    [chainId: number]: { type: GAS_PRICE_TYPE };
  };
  chainGasPriceList: {
    [chainId: number]: {
      gasPriceList: {
        [key in GAS_PRICE_TYPE]: number;
      };
      gasPriceFetchingStatus: FETCHING_STATUS;
    };
  };
  gasPriceFetchingStatus: FETCHING_STATUS;
  chainBlockStatus: {
    [chainId: number]: TBlockStatus;
  };
  chainTokenInfos: {
    [chainId: number]: {
      tokens?: {
        [tokenId: string]: TokenInfo;
      };
    };
  };
}

const defaultChainId = getDefaultChainId();

const initialState: IChainState = {
  currentChainId: defaultChainId,
  prevChainId: 0,
  chainGasPriceConfig: {
    // gasPrice: 0,
    [CHAIN_ID.POLYGON]: { type: GAS_PRICE_TYPE.Standard },
  },
  chainGasPriceList: {
    [CHAIN_ID.POLYGON as number]: {
      gasPriceList: {
        [GAS_PRICE_TYPE.SLOW]: 0,
        [GAS_PRICE_TYPE.Standard]: 0,
        [GAS_PRICE_TYPE.FAST]: 0,
        [GAS_PRICE_TYPE.INSTANT]: 0,
      },
      gasPriceFetchingStatus: FETCHING_STATUS.INIT,
    },
  },
  gasPriceFetchingStatus: FETCHING_STATUS.INIT,
  chainBlockStatus: {},
  chainTokenInfos: _.reduce(
    DAPP_CHAIN_CONFIGS,
    (acc, config) => {
      acc[config.network.chainId] = {
        tokens: undefined,
      };
      return acc;
    },
    {} as IChainState['chainTokenInfos'],
  ),
};

export const chainSlice = createSlice({
  name: 'chain',
  initialState,
  reducers: {
    changePrevChainId: (state, { payload: { chainId } }: PayloadAction<{ chainId: number }>) => {
      state.prevChainId = chainId || state.currentChainId;
    },
    changeGasPriceConfig: (
      state,
      { payload: { type, chainId } }: PayloadAction<{ type: GAS_PRICE_TYPE; chainId: number }>,
    ) => {
      _.set(state.chainGasPriceConfig, [chainId], { type });
      localStorage.setItem('syn_global_gas_price_config', JSON.stringify(state.chainGasPriceConfig));
    },
    updateGasPriceFetchingStatus: (state, { payload: { status } }: PayloadAction<{ status: FETCHING_STATUS }>) => {
      state.gasPriceFetchingStatus = status;
    },
    loadLocalGasPriceFetchingStatus: (state, { payload: {} }) => {
      const localConfigData = localStorage.getItem('syn_global_gas_price_config');
      if (localConfigData) {
        const configs = JSON.parse(localConfigData);
        state.chainGasPriceConfig = {
          ...state.chainGasPriceConfig,
          ...configs,
        };
      }
    },
    updateBlockNumber: (
      state,
      {
        payload: { chainId, blockNumber, timestamp },
      }: PayloadAction<{ chainId: number; blockNumber: number; timestamp: number }>,
    ) => {
      _.set(state.chainBlockStatus, [chainId, 'blockNumber'], blockNumber);
      _.set(state.chainBlockStatus, [chainId, 'timestamp'], timestamp);
    },
    setChainTokenInfos: (
      state,
      { payload: { chainTokenInfos } }: PayloadAction<{ chainTokenInfos: IChainState['chainTokenInfos'] }>,
    ) => {
      state.chainTokenInfos = chainTokenInfos;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(changeCurrentChainId.fulfilled, (state, action) => {
      const { arg } = action.meta;
      // the prevChain ID must be set before the currentChainId
      if (state.prevChainId === 0) {
        state.prevChainId = arg.chainId;
        // when the actions carry the same chainId consecutively
      }
      state.currentChainId = arg.chainId;
    });
    builder.addCase(getChainTokenList.fulfilled, (state, action) => {
      if (action.payload) {
        const { arg } = action.meta;
        const tokenInfosFromState = _.get(state.chainTokenInfos, [arg.chainId, 'tokens'], {});
        _.set(state.chainTokenInfos, [arg.chainId, 'tokens'], _.merge({}, tokenInfosFromState, action.payload));
      }
    });
  },
});

export const {
  changePrevChainId,
  changeGasPriceConfig,
  updateGasPriceFetchingStatus,
  loadLocalGasPriceFetchingStatus,
  updateBlockNumber,
  setChainTokenInfos,
} = chainSlice.actions;

export const selectChainState = (state: AppState): IChainState => state.chain;
export const selectCurrentId = (state: AppState): number => state.chain.currentChainId;
export const selectChainBlockStatus = (state: AppState): IChainState['chainBlockStatus'] =>
  state.chain.chainBlockStatus;

export const selectTokenInfosFromChain =
  (chainId: number | undefined) =>
  (state: AppState): { [tokenId: string]: TokenInfo } => {
    return _.get(state.chain.chainTokenInfos, [chainId || '', 'tokens'], {});
  };

export const selectTokenInfoFromChain =
  (chainId: number | undefined, tokenAddr: string | undefined) =>
  (state: AppState): TokenInfo | undefined => {
    return _.get(state.chain.chainTokenInfos, [chainId || '', 'tokens', tokenAddr || '']);
  };

export default chainSlice.reducer;
