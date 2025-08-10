import { getOdysseyConfig } from '@/configs';
import { configUrl } from '@/constants/config';
import SentryService from '@/entities/SentryService';
import { IChainState, setChainTokenInfos } from '@/features/chain/chainSlice';
import { setOdysseyDappConfig } from '@/features/odyssey/slice';
import { useAppDispatch } from '@/hooks';
import { ConfigApiResponse } from '@/types/config';
import { TokenInfo } from '@/types/token';
import { axiosGet } from '@/utils/axios';
import _ from 'lodash';
import { useCallback, useEffect } from 'react';
import { useConfigData } from '../hook';
import { setConfigApiResponse, setIsConfigApiResponseFetched } from '../slice';

function useFetchConfigData() {
  const dispatch = useAppDispatch();
  const { chainTokensInfoConfig, backendChainsConfig } = useConfigData();
  const fetchConfigData = useCallback(async () => {
    try {
      const respose = (await axiosGet({ url: configUrl }))?.data;
      const configApiResponse = (respose?.perp || respose) as ConfigApiResponse;
      dispatch(setConfigApiResponse({ configApiResponse }));
      return [];
    } catch (error) {
      SentryService.captureException(error, { name: configUrl });
      dispatch(setIsConfigApiResponseFetched(false));
      console.log(error);
      return [];
    }
  }, [dispatch]);

  useEffect(() => {
    const chainTokenInfos = _.reduce(
      Object.entries(chainTokensInfoConfig),
      (acc, [chainId, config]) => {
        acc[Number(chainId)] = {
          tokens: config.erc20Tokens?.reduce((acc, token) => {
            acc[token.address.toLowerCase()] = token;
            return acc;
          }, {} as { [tokenId: string]: TokenInfo }),
        };
        return acc;
      },
      {} as IChainState['chainTokenInfos'],
    );
    dispatch(setChainTokenInfos({ chainTokenInfos }));
  }, [chainTokensInfoConfig]);

  useEffect(() => {
    const chainsEarnOoPointPairs = Object.entries(backendChainsConfig).reduce((prev, [strChainId, config]) => {
      return {
        ...prev,
        [strChainId]: config?.odyssey?.earnOoPointPairs,
      };
    }, {} as Parameters<typeof getOdysseyConfig>[0]);
    dispatch(setOdysseyDappConfig(getOdysseyConfig(chainsEarnOoPointPairs)));
  }, [dispatch, backendChainsConfig]);

  useEffect(() => {
    fetchConfigData();
  }, [dispatch, fetchConfigData]);
}

export default function ConfigGlobalEffect(): null {
  useFetchConfigData();
  return null;
}
