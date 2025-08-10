import { QUERY_KEYS } from '@/constants/query';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getTokenPriceMap } from './api';

export const useTokenPrices = ({ chainId }: { chainId?: number }) => {
  const queryReturn = useQuery({
    queryKey: QUERY_KEYS.GLOBAL.TOKEN_PRICE(chainId),
    queryFn: () => getTokenPriceMap({ chainId }),
    //refetchInterval: 60 * 1000 *5, // Refresh every minute
    enabled: !!chainId,
  });

  return useMemo(() => {
    return queryReturn;
  }, [queryReturn]);
};
export const useTokenPrice = ({ tokenAddress, chainId }: { tokenAddress?: string; chainId?: number }) => {
  const { data: tokenPrices } = useTokenPrices({ chainId });

  return useMemo(() => {
    if (!tokenAddress || !tokenPrices) return undefined;
    return tokenPrices[tokenAddress];
  }, [tokenAddress, tokenPrices]);
};
