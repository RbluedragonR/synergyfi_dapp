import { DAPP_CHAIN_CONFIGS } from '@/constants/chain';
import { DEFAULT_DECIMALS } from '@/constants/global';
import { TokenInfo } from '@/types/token';
import { axiosGet } from '@/utils/axios';
import { CHAIN_ID } from '@derivation-tech/context';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const changeCurrentChainId = createAsyncThunk(
  'chain/changeCurrentChainId',

  ({ chainId }: { chainId: CHAIN_ID }, {}): { chainId: number } => {
    return { chainId };
  },
);

export const getChainTokenList = createAsyncThunk(
  'chain/getChainTokenList',

  async ({ chainId }: { chainId: CHAIN_ID }, {}): Promise<{ [tokenAddr: string]: TokenInfo } | undefined> => {
    const dappConfig = DAPP_CHAIN_CONFIGS[chainId];
    if (dappConfig.tokenListUrl) {
      const tokens: {
        id: string;
        chainId: number;
        symbol: string;
        address: string;
        name: string;
        icon: string | null;
        decimals: number;
      }[] = (await axiosGet({ url: dappConfig.tokenListUrl }))?.data;
      if (tokens) {
        const tokenInfos = tokens.map((t) => {
          return {
            id: t.address.toLowerCase(),
            chainId: chainId,
            symbol: t.symbol,
            address: t.address.toLowerCase(),
            name: t.name || t.symbol,
            decimals: t.decimals || DEFAULT_DECIMALS,
            logoURI: t.icon || undefined,
          } as TokenInfo;
        });
        return tokenInfos.reduce((acc, token) => {
          acc[token.id] = token;
          return acc;
        }, {} as { [tokenAddr: string]: TokenInfo });
      }
    }
    return undefined;
  },
);
