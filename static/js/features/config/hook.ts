import { CHAIN_ID } from '@/constants/chain';
import { useAppSelector } from '@/hooks';

export function useConfigData() {
  return useAppSelector((state) => {
    return state.config;
  });
}
export const useBackendChainConfig = (chainId: CHAIN_ID | undefined) => {
  const { backendChainsConfig } = useConfigData();
  return chainId && backendChainsConfig[chainId];
};

export const useTokensInfoConfig = (chainId: CHAIN_ID | undefined) => {
  const { chainTokensInfoConfig } = useConfigData();
  return chainId && chainTokensInfoConfig[chainId];
};
