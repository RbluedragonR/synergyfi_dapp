import { useBackendChainConfig } from '@/features/config/hook';
import { useCombinedPairFromUrl } from '@/features/pair/hook';
import useSpotRouter, { useFilteredSellSpotTokens } from '@/features/spot/hooks';
import { useSpotTokens } from '@/features/spot/query';
import { useSpotState } from '@/features/spot/store';
import { useTokenExchangeModal } from '@/hooks/trade/useTokenExchange';
import { useChainId } from '@/hooks/web3/useChain';
import { useCallback } from 'react';

export default function useClickExchange() {
  const { toggleModal } = useTokenExchangeModal();
  const { setToken0, setToken1 } = useSpotState();
  const { goToSpot } = useSpotRouter();

  const chainId = useChainId();
  const currentPair = useCombinedPairFromUrl(chainId);
  const backendChainConfig = useBackendChainConfig(chainId);
  const tokenSymbolsGoToSpot = backendChainConfig?.exchange?.tokenSymbolsNotGoToSpot;
  const { filteredTokens, isFetched } = useFilteredSellSpotTokens({ search: '' });
  const { data: tokens } = useSpotTokens({ chainId });
  const handleClickExchange = useCallback(() => {
    if (
      currentPair?.rootInstrument?.quoteToken &&
      !tokenSymbolsGoToSpot?.includes(currentPair?.rootInstrument?.quoteToken.symbol || '')
    ) {
      const token1 = tokens?.find(
        (t) => t.address.toLowerCase() === currentPair?.rootInstrument?.quoteToken.address.toLowerCase(),
      );
      setToken1(token1);
      isFetched && setToken0(filteredTokens?.[0]); //setSellTokenFn(currentPair?.rootInstrument?.baseToken);
      goToSpot({
        buyTokenAddr: currentPair?.rootInstrument?.quoteToken.address,
        sellTokenAddr: filteredTokens?.[0].address,
      });
    } else {
      toggleModal(true);
    }
  }, [
    currentPair?.rootInstrument?.quoteToken,
    filteredTokens,
    goToSpot,
    isFetched,
    setToken0,
    setToken1,
    toggleModal,
    tokenSymbolsGoToSpot,
    tokens,
  ]);
  return { handleClickExchange };
}
