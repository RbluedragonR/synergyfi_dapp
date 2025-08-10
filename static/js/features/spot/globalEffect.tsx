import { SPOT_BALANCE_BATCH_SIZE } from '@/constants/spot';
import usePageSupported from '@/hooks/usePageSupported';
import { useChainId, useSigner, useUserAddr } from '@/hooks/web3/useChain';
import { RouteBasePath } from '@/pages/routers';
import { WorkerEventNames } from '@/types/worker';
import { useEffect } from 'react';
import { useTokenSymbolQueryParamEffect } from './hooks';
import { useSpotTokens } from './query';
import { useSpotState } from './store';

function SpotGlobalEffect(): null {
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const signer = useSigner();
  const { setSellAmount } = useSpotState();
  const { data: tokens } = useSpotTokens({ chainId });
  usePageSupported({ page: RouteBasePath.spot });
  useEffect(() => {
    chainId &&
      userAddr &&
      signer &&
      tokens &&
      // Split tokens into chunks of 200 and make batch calls
      Array.from({ length: Math.ceil(tokens.length / SPOT_BALANCE_BATCH_SIZE) }, (_, i) =>
        window.userWorker.postMessage({
          eventName: WorkerEventNames.MulticallBalance,
          data: {
            chainId,
            userAddr,
            tokens: tokens.slice(i * SPOT_BALANCE_BATCH_SIZE, (i + 1) * SPOT_BALANCE_BATCH_SIZE),
          },
        }),
      );
  }, [tokens, chainId, userAddr, signer]);
  useEffect(() => {
    if (process.env.REACT_APP_AWS_ENV === 'dev' && tokens) {
      const duplicateSymbols = tokens.filter((token) => token.isSymbolDuplicated).map((token) => token.symbol);

      if (duplicateSymbols.length > 0) {
        console.log(`Duplicate token symbols found: ${duplicateSymbols.join(', ')}`);
      }
    }
  }, [tokens]);
  useEffect(() => {
    if (!userAddr) {
      setSellAmount('');
    }
  }, [setSellAmount, userAddr]);
  useTokenSymbolQueryParamEffect({ tokens });

  return null;
}

export default SpotGlobalEffect;
