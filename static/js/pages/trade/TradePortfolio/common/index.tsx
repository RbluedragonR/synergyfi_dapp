import SynCircleTabs from '@/components/Tabs/SynCircleTabs';
import { TABLE_TYPES } from '@/constants/global';
import { useTradePortfolioTab } from '@/features/trade/hooks';
import { setTradePortfolioTab } from '@/features/trade/slice';
import { useAppDispatch } from '@/hooks';
import { useChainId } from '@/hooks/web3/useChain';
import { useTranslation } from 'react-i18next';

export default function TradeHistoryTabs() {
  const dispatch = useAppDispatch();
  const tabPosition = useTradePortfolioTab();
  const chainId = useChainId();

  const { t } = useTranslation();
  const items: {
    key: string;
    label: string;
  }[] = [
    { key: TABLE_TYPES.TRADE_HISTORY, label: t('common.trade') },
    { key: TABLE_TYPES.ORDER_HISTORY, label: t('common.order') },
    { key: TABLE_TYPES.LIQUIDITY_HISTORY, label: t('common.liquidity') },
    { key: TABLE_TYPES.FUNDING, label: t('common.funding') },
    { key: TABLE_TYPES.TRANSFERS, label: t('common.transfer') },
  ];
  return (
    <SynCircleTabs
      items={items}
      activeKey={tabPosition}
      onClick={(key) => {
        chainId && dispatch(setTradePortfolioTab({ tab: key as TABLE_TYPES, chainId }));
      }}
    />
  );
}
