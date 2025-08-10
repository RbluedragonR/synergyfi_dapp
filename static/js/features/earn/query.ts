import { IL_LOSS_BASE } from '@/constants/earn';
import { QUERY_KEYS } from '@/constants/query';
import { useChainId } from '@/hooks/web3/useChain';
import { ILDataParams } from '@/types/earn';
import { SimulateImpermenantLossResult } from '@synfutures/sdks-perp';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useSDK } from '../web3/hook';

export function useILData(params: ILDataParams | undefined): UseQueryResult<SimulateImpermenantLossResult[]> {
  const chainId = useChainId();
  const sdk = useSDK(chainId);
  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: QUERY_KEYS.EARN.IL(
      chainId,
      params?.symbol,
      params?.alphaWadLower.toString(),
      params?.alphaWadUpper.toString(),
    ),
    queryFn: async () => {
      try {
        if (params) {
          const data = await sdk?.perp.simulate.simulateImpermanentLoss(params);
          return (
            data?.map((d) => ({
              tick: d.tick * (params.isInverse ? -1 : 1),
              impermanentLoss: d.impermanentLoss * -1 + IL_LOSS_BASE,
            })) || []
          );
        }
        return [];
      } catch (e) {
        console.log('🚀 ~ queryFn: ~ e:', e);
        return [];
      }
    },
    enabled: !!sdk && !!params,
  });
}
