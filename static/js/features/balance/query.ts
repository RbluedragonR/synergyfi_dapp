import { QUERY_KEYS } from '@/constants/query';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { IGateBalanceInfo } from '@/types/balance';
import { fixBalanceNumberDecimalsTo18, getTokenInfo } from '@/utils/token';
import { useQuery } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { useMarginTokenInfoMap } from '../chain/hook';
import { useSDK } from '../web3/hook';
import { fetchUserGateBalance, getGateBalanceFromChain } from './api';

export const useFetchUserGateBalanceList = (chainId: number | undefined, userAddr: string | undefined) => {
  const sdk = useSDK(chainId);
  const marginTokenMap = useMarginTokenInfoMap(chainId);
  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: QUERY_KEYS.BALANCE.GATE(chainId, userAddr),
    queryFn: async () => {
      // const apiResult = chainId && instrumentAddr && (await fetchFuturesInstrument(chainId, instrumentAddr));
      // if (!apiResult && sdk && instrumentAddr) {
      //   return fetchInstrumentFromChain(sdk, instrumentAddr);
      // }
      // return apiResult;

      if (chainId && userAddr)
        try {
          // First try to get from API
          const apiResult = await fetchUserGateBalance(chainId, userAddr);
          if (apiResult) {
            return apiResult;
          }
          throw new Error('API returned no data');
        } catch (apiError) {
          console.warn('API request failed, falling back to chain:', apiError);
          try {
            if (sdk && marginTokenMap) {
              const tokens = Object.values(marginTokenMap || {});
              // If API fails, fall back to chain request
              const chainResult = await getGateBalanceFromChain(sdk, userAddr, tokens);
              if (chainResult) {
                const result: IGateBalanceInfo[] = [];
                chainResult.data.forEach((item) => {
                  const token = getTokenInfo(item.token, chainId);
                  if (token) {
                    result.push({
                      ...token,
                      balance: WrappedBigNumber.from(
                        fixBalanceNumberDecimalsTo18(BigNumber.from(item.balance), item.token.decimals),
                      ),
                    });
                  }
                });
                return result;
              }
            }
          } catch (chainError) {
            console.error('Both API and chain requests failed:', chainError);
            throw new Error('Failed to fetch instrument from both API and chain');
          }
        }
      return null;
    },
    enabled: !!chainId && !!userAddr,
  });
};
