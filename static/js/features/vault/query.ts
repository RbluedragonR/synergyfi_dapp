import { QUERY_KEYS } from '@/constants/query';
import { useQuery } from '@tanstack/react-query';
import { fetchVaultInfos, fetchVaultSummary } from './api';

export const useFetchVaultInfos = (chainId: number | undefined, userAddr: string | undefined) => {
  return useQuery({
    queryKey: QUERY_KEYS.VAULT.INFOS(chainId, userAddr),
    queryFn: async () => {
      if (chainId) return fetchVaultInfos({ chainId, userAddr });
    },
    enabled: !!chainId,
  });
};

export const useFetchVaultSummary = (chainId: number | undefined) => {
  return useQuery({
    queryKey: QUERY_KEYS.VAULT.SUMMARY(chainId),
    queryFn: async () => {
      if (chainId) return fetchVaultSummary({ chainId });
    },
    enabled: !!chainId,
  });
};
