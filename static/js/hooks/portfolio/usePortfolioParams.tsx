import { useMediaQueryDevice } from '@/components/MediaQuery';
import { PORTFOLIO_TAB_ITEMS, defaultPortfolioTabItem, portfolioTabItemInfos } from '@/constants/portfolio';
import { useTokenInfos } from '@/features/chain/hook';
import { useAssetsBalanceList } from '@/pages/portfolio/Assets/hooks/assetsHook';
import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryParam } from '..';
import { useChainId, useUserAddr } from '../web3/useChain';

export default function usePortfolioParams(): PORTFOLIO_TAB_ITEMS | undefined {
  const { tab } = useParams();
  const { isMobile } = useMediaQueryDevice();
  const portfolioTabItem = Object.values(PORTFOLIO_TAB_ITEMS).find((id) => {
    const item = portfolioTabItemInfos[id];
    const correctTabId = tab?.toLowerCase() === id?.toLowerCase();
    const correctDevice =
      (isMobile && item.mobileOrDesktop === 'mobile') ||
      (!isMobile && item.mobileOrDesktop === 'desktop') ||
      item.mobileOrDesktop === 'all';
    return correctTabId && correctDevice;
  });
  if (portfolioTabItem === undefined) {
    if (!isMobile) return defaultPortfolioTabItem.desktop;
    if (isMobile) return defaultPortfolioTabItem.mobile;
  }
  return portfolioTabItem;
}
export enum AccountAction {
  withdraw = 'withdraw',
  deposit = 'deposit',
  inactive = 'inactive',
}
export function useGoToAccountBalanceAction() {
  const navigate = useNavigate();
  const chainId = useChainId();
  const tokenInfos = useTokenInfos(chainId);
  const { isMobile } = useMediaQueryDevice();
  const goToAccountBalanceAction = useCallback(
    (accountAction: AccountAction | null, tokenAddress?: string) => {
      if (isMobile) {
        return;
      }
      if (accountAction === null) {
        navigate('/portfolio');
      } else {
        navigate(
          `/portfolio?accountAction=${accountAction}&tokenSymbol=${tokenAddress && tokenInfos[tokenAddress].symbol}`,
        );
      }
    },
    [navigate, tokenInfos, isMobile],
  );
  return { goToAccountBalanceAction };
}

export const useAssetSelectFromParams = () => {
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const accountAction = useQueryParam('accountAction') as AccountAction;
  const tokenSymbol = useQueryParam('tokenSymbol');
  const Assetinfos = useAssetsBalanceList(chainId, userAddr, {}, true);
  const Assetinfo = Assetinfos.find((info) => info.quote.symbol === tokenSymbol);
  return {
    accountAction: Object.values(AccountAction).includes(accountAction) ? accountAction : null,
    quoteSymbol: Assetinfo?.quote.symbol,
  };
};
