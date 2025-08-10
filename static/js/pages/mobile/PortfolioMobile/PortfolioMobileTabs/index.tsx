/**
 * @description Component-PortfolioMobileTabs
 */
import './index.less';

import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import SynTitleTabs from '@/components/Tabs/SynTitleTabs';
import { PORTFOLIO_TAB_ITEMS } from '@/constants/portfolio';
import { useBackendChainConfig } from '@/features/config/hook';
import { useStaticPinObserver } from '@/hooks/useStickyPin';
import { useChainId } from '@/hooks/web3/useChain';

interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  onTabChange: (tab: PORTFOLIO_TAB_ITEMS) => void;
}
const PortfolioMobileTabs: FC<IPropTypes> = function ({ onTabChange }) {
  const { t } = useTranslation();
  const chainId = useChainId();
  const [value, setValue] = useState(PORTFOLIO_TAB_ITEMS.POSITION.toString());
  const tableHeaderStickyRef = useRef<HTMLDivElement>(null);
  const dappConfig = useBackendChainConfig(chainId);
  useStaticPinObserver(tableHeaderStickyRef);
  const tabList = useMemo(() => {
    return [
      {
        key: PORTFOLIO_TAB_ITEMS.POSITION.toString(),
        value: PORTFOLIO_TAB_ITEMS.POSITION.toString(),
        label: <div className="syn-portfolio-mobile-tabs-tab">{t('mobile.position')}</div>,
      },
      dappConfig?.trade?.isDisableLimitOrder
        ? undefined
        : {
            key: PORTFOLIO_TAB_ITEMS.ORDER.toString(),
            value: PORTFOLIO_TAB_ITEMS.ORDER.toString(),
            label: <div className="syn-portfolio-mobile-tabs-tab">{t('mobile.order')}</div>,
          },
      {
        key: PORTFOLIO_TAB_ITEMS.LIQUIDITY.toString(),
        value: PORTFOLIO_TAB_ITEMS.LIQUIDITY.toString(),
        label: <div className="syn-portfolio-mobile-tabs-tab">{t('mobile.liquidity')}</div>,
      },
      {
        key: PORTFOLIO_TAB_ITEMS.ACCOUNT.toString(),
        value: PORTFOLIO_TAB_ITEMS.ACCOUNT.toString(),
        label: <div className="syn-portfolio-mobile-tabs-tab">{t('mobile.account')}</div>,
      },
    ].filter((t) => t !== undefined) as {
      key: string;
      value: string;
      label: JSX.Element;
    }[];
  }, [dappConfig?.trade?.isDisableLimitOrder, t]);

  useEffect(() => {
    onTabChange(PORTFOLIO_TAB_ITEMS.POSITION);
  }, [onTabChange]);
  return (
    <div ref={tableHeaderStickyRef} className="syn-portfolio-mobile-tabs-container">
      <SynTitleTabs
        wrapStyle={{ height: 32 }}
        tabsStyle={{ justifyContent: 'center' }}
        className="syn-portfolio-mobile-tabs"
        onClick={(key) => {
          setValue(key);
          onTabChange(key as PORTFOLIO_TAB_ITEMS);
        }}
        activeKey={value}
        items={tabList}
      />
    </div>
  );
};

export default PortfolioMobileTabs;
