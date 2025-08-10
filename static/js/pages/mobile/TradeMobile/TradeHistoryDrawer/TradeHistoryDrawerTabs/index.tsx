/**
 * @description Component-TradeHistroyDrawerTabs
 */
import './index.less';

import React, { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import SynTitleTabs from '@/components/Tabs/SynTitleTabs';
import { HISTORY_TYPE } from '@/constants/history';
import { useBackendChainConfig } from '@/features/config/hook';
import { useCurrentPairFromUrl } from '@/features/pair/hook';
import { useChainId } from '@/hooks/web3/useChain';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  onTabChange: (tab: HISTORY_TYPE) => void;
  tab: HISTORY_TYPE;
}
const TradeHistoryDrawerTabs: FC<IPropTypes> = function ({ onTabChange, tab }) {
  const chainId = useChainId();
  const { t } = useTranslation();
  const currentPair = useCurrentPairFromUrl(chainId);
  const [value, setValue] = useState(HISTORY_TYPE.TRADE);
  const dappConfig = useBackendChainConfig(chainId);
  const tabList = useMemo(() => {
    const tabs = [
      {
        key: HISTORY_TYPE.TRADE.toString(),
        value: HISTORY_TYPE.TRADE.toString(),
        label: t('mobile.trade'),
      },
    ];
    if (!dappConfig?.trade?.isDisableLimitOrder) {
      tabs.push({
        key: HISTORY_TYPE.ORDERS.toString(),
        value: HISTORY_TYPE.ORDERS.toString(),
        label: t('mobile.order'),
      });
    }
    if (currentPair?.isPerpetual) {
      tabs.push({
        key: HISTORY_TYPE.FUNDING.toString(),
        value: HISTORY_TYPE.FUNDING.toString(),
        label: t('mobile.funding'),
      });
    }
    return tabs;
  }, [currentPair?.isPerpetual, dappConfig?.trade?.isDisableLimitOrder, t]);

  useEffect(() => {
    setValue(tab);
    // no deps
  }, [tab]);

  return (
    <SynTitleTabs
      wrapStyle={{
        padding: '0 16px',
      }}
      tabsStyle={{
        justifyContent: 'space-around',
        background: 'var(--solid-2, #F4FBFB)',
        height: '32px',
        borderRadius: '8px',
      }}
      className="syn-trade-history-drawer-tabs"
      onClick={(key) => {
        setValue(key as HISTORY_TYPE);
        onTabChange(key as HISTORY_TYPE);
      }}
      activeKey={value}
      items={tabList}
    />
  );
};

export default TradeHistoryDrawerTabs;
