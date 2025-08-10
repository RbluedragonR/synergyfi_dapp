/**
 * @description Component-PortfolioEmpty
 */
import './index.less';

import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Empty from '@/components/Empty';
import { useWalletConnectStatus } from '@/features/wallet/hook';
import { WALLET_CONNECT_STATUS } from '@/types/wallet';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const PortfolioEmpty: FC<IPropTypes> = function ({ children }) {
  const connectionStatus = useWalletConnectStatus();
  const { t } = useTranslation();
  const isUnConnect = useMemo(() => {
    return connectionStatus === WALLET_CONNECT_STATUS.UN_CONNECT;
  }, [connectionStatus]);
  if (!isUnConnect && children) return <>{children}</>;
  return (
    <div className="syn-portfolio-empty">
      <div className="syn-portfolio-empty-header">{t('common.portfolio.account')}</div>
      <Empty showUnconnected={false} />
    </div>
  );
};

export default PortfolioEmpty;
