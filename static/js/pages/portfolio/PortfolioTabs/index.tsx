/**
 * @description Component-PortfolioTabs
 */
import './index.less';

import { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import SynTitleTabs from '@/components/Tabs/SynTitleTabs';
import { PORTFOLIO_TAB_ITEMS } from '@/constants/portfolio';
import usePortfolioParams from '@/hooks/portfolio/usePortfolioParams';
interface IPropTypes {
  className?: string;
}
const PortfolioTabs: FC<IPropTypes> = function () {
  const { t } = useTranslation();
  const tab = usePortfolioParams();
  const [value, setValue] = useState<PORTFOLIO_TAB_ITEMS>(PORTFOLIO_TAB_ITEMS.PORTFOLIO);
  const navigate = useNavigate();
  const newTabList = useMemo(() => {
    return [
      {
        key: PORTFOLIO_TAB_ITEMS.PORTFOLIO,
        label: <div className="syn-portfolio-tabs-label">{t('common.portfolioStr')}</div>,
      },
      {
        key: PORTFOLIO_TAB_ITEMS.HISTORY,
        label: t('common.history'),
      },
    ];
  }, [t]);
  useEffect(() => {
    setValue(tab || PORTFOLIO_TAB_ITEMS.PORTFOLIO);
    // no deps
  }, [tab]);
  return (
    <SynTitleTabs
      wrapStyle={{ height: 24 }}
      tabsStyle={{ gap: 24 }}
      className="syn-portfolio-tabs"
      onClick={(key) => {
        setValue(key as PORTFOLIO_TAB_ITEMS);
        navigate(`/portfolio/${key}`);
      }}
      activeKey={value}
      items={newTabList}
    />
  );
};

export default PortfolioTabs;
