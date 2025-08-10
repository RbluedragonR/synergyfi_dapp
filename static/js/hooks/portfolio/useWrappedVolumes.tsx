import { TWrappedVolume } from '@/components/TableCard/tableConfigs/WrappedVolume';
import { WrappedPair } from '@/entities/WrappedPair';
import { useDailyVolumeDetails } from '@/features/graph/hooks';
import { useWrappedPairMap } from '@/features/pair/hook';
import { useQuoteHistoryPriceList } from '@/features/portfolio/hook';
import { priceInNumber, timestamp } from '@/types/_utils';
import { useMemo } from 'react';
import { useChainId, useUserAddr } from '../web3/useChain';

type TQuotePrices = { [timestamp in number]: priceInNumber };
export default function useWrappedVolumes(): TWrappedVolume[] {
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const quoteHistoryPriceList = useQuoteHistoryPriceList();
  const prices = useMemo(
    () =>
      Object.entries(quoteHistoryPriceList || {}).reduce((prev, curr) => {
        const [qouteSymbol, value] = curr;
        if (qouteSymbol !== 'lastUpdate') {
          const typedValues = value as [timestamp, priceInNumber][];
          return {
            [qouteSymbol]: typedValues.reduce((prev, [timestamp, priceInNumber]) => {
              return { ...prev, [timestamp]: priceInNumber };
            }, {} as TQuotePrices),
            ...prev,
          };
        } else {
          return {
            ...prev,
          };
        }
      }, {} as { [qouteSymbol in string]: TQuotePrices }),
    [quoteHistoryPriceList],
  );
  const dailyVolumeDetails = useDailyVolumeDetails(chainId, userAddr);
  const pair = useWrappedPairMap(chainId);
  const mockPairMap = useMemo(
    () =>
      Object.values(pair).reduce((prev, curr) => {
        return { ...prev, [curr.metaPair.id]: curr };
      }, {} as { [pairSymbol in string]: WrappedPair }),
    [pair],
  );
  const result = useMemo(() => {
    const detailsWithUsd = dailyVolumeDetails.map((details) => {
      const {
        timestamp,
        symbol: pairSymbol,
        takerVolume,
        takerFee,
        makerVolume,
        makerRebate,
        expiry,
        instrumentAddr,
      } = details;
      const wrappedPair: undefined | WrappedPair = mockPairMap[`${instrumentAddr}-${expiry}`];
      const qouteSymbol = pairSymbol ? pairSymbol.split('-')[1] : '';
      const price: undefined | number = prices[qouteSymbol]?.[timestamp];
      return {
        ...details,
        wrappedPair,
        takerVolumeInUsd: price ? takerVolume * price : undefined,
        takerFeeInUsd: price ? takerFee * price : undefined,
        makerVolumeInUsd: price ? makerVolume * price : undefined,
        makerRebateInUsd: price ? makerRebate * price : undefined,
        qouteSymbol,
      } as TWrappedVolume;
    });
    return detailsWithUsd;
  }, [dailyVolumeDetails, mockPairMap, prices]);

  return result;
}
