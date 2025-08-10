import { TABLE_TYPES } from '@/constants/global';
import { setIsHistoryPortfolioTab, setTradePortfolioTab } from '@/features/trade/slice';
import { useCallback } from 'react';
import { useAppDispatch } from '..';
import { useChainId } from '../web3/useChain';
// History related tab use useTradePortfolioTab, Non History related tab use useSetTradePortfolioTab
export default function useSetTradePortfolioTab() {
  const dispatch = useAppDispatch();
  const chainId = useChainId();

  return useCallback(
    (tabType: TABLE_TYPES) => {
      if (Object.values(TABLE_TYPES).includes(tabType)) {
        dispatch(setIsHistoryPortfolioTab(false));
        chainId && dispatch(setTradePortfolioTab({ tab: tabType, chainId }));
      }
    },
    [chainId, dispatch],
  );
}
