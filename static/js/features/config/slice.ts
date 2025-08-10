import { CHAIN_ID, quoteTokenSymbolColors } from '@/constants/chain';
import { BackendChainsConfig, ConfigApiResponse, IBannerItem } from '@/types/config';
import { TokenInfo, TokenInfoMap } from '@/types/token';
import { getTokenInfo } from '@/utils/token';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import _ from 'lodash';

export interface IConfigState {
  isConfigApiResponseFetched: boolean;
  bannerConfig: IBannerItem[];
  backendChainsConfig: BackendChainsConfig;
  chainTokensInfoConfig: {
    [id in CHAIN_ID]?: {
      quoteTokens?: TokenInfo[];
      erc20Tokens?: TokenInfo[];
      marginTokenMap?: TokenInfoMap;
    };
  };
}

const initialState: IConfigState = {
  isConfigApiResponseFetched: false,
  bannerConfig: [],
  backendChainsConfig: {},
  chainTokensInfoConfig: {},
};

export const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setIsConfigApiResponseFetched: (state, { payload }: PayloadAction<boolean>) => {
      state.isConfigApiResponseFetched = payload;
    },
    setConfigApiResponse: (
      state,
      { payload: { configApiResponse } }: PayloadAction<{ configApiResponse: ConfigApiResponse }>,
    ) => {
      state.bannerConfig = _.cloneDeep(configApiResponse.data.banners).sort((a, b) => a.sort - b.sort);
      state.backendChainsConfig = configApiResponse.data.chainsConfig;
      state.isConfigApiResponseFetched = true;
      const strChainIds = Object.keys(configApiResponse.data.chainsConfig);
      strChainIds.map((chainId) => {
        const chainConfig = configApiResponse.data.chainsConfig[chainId];
        const tokenConfig = chainConfig?.tokensMetaData;
        const erc20Tokens = tokenConfig?.map((token) => getTokenInfo(token, Number(chainId)));
        const quoteTokens = chainConfig?.quoteDisplayList.reduce((acc, tokenSymbol, i) => {
          const token = erc20Tokens?.find((t) => t.symbol === tokenSymbol);
          if (token) {
            acc.push({ ...token, color: quoteTokenSymbolColors[i] });
          }
          return acc;
        }, [] as TokenInfo[]);
        const marginTokenMap = _.keyBy(quoteTokens, 'address');
        state.chainTokensInfoConfig = {
          ...state.chainTokensInfoConfig,
          [Number(chainId)]: {
            quoteTokens,
            erc20Tokens,
            marginTokenMap,
          },
        };
      });
    },
  },
});

export const { setConfigApiResponse, setIsConfigApiResponseFetched } = configSlice.actions;

export const configReducer = configSlice.reducer;
