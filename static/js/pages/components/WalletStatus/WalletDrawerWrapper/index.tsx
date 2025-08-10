/**
 * @description Component-WalletModalWrapper
 */
import './index.less';

import classNames from 'classnames';
import { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Drawer from '@/components/Drawer';
import { useWalletConnectStatus } from '@/features/wallet/hook';
import { ICardWrapperDrawerPropTypes } from '@/types/modal';
import { WALLET_CONNECT_STATUS } from '@/types/wallet';

import SettingSubCard from '../SettingSubCard';
import { useUnConnectSubCard } from '../UnconnectSubCard';
import WalletCardWrapper from '../WalletCardWrapper';
interface PropTypes extends ICardWrapperDrawerPropTypes {
  onClose: () => void;
}
const WalletDrawerWrapper: FC<PropTypes> = function ({
  onClose,
  className,
  cardProps: { showFooter, ...cardProps },
  children,
  ...props
}) {
  const [showSubCard, setShowSubCard] = useState<'wallet' | 'setting' | undefined>(undefined);
  const unConnectSubCardProps = useUnConnectSubCard(showSubCard, setShowSubCard, showFooter);
  const { t } = useTranslation();
  const subCardProps = useMemo(() => {
    return {
      subCardSlot: <SettingSubCard onSave={() => setShowSubCard(undefined)}></SettingSubCard>,
      subCardTitle: t('common.walletCardWrapper.subCardTitle'),
      ...unConnectSubCardProps,
    };
  }, [setShowSubCard, unConnectSubCardProps, t]);

  const walletConnectStatus = useWalletConnectStatus();

  useEffect(() => {
    // close
    if (showSubCard === 'wallet' && walletConnectStatus !== WALLET_CONNECT_STATUS.UN_CONNECT) {
      setShowSubCard(undefined);
    }
  }, [walletConnectStatus, showSubCard]);
  return (
    <Drawer {...props} onClose={onClose} className={classNames('syn-wallet-drawer-wrapper reverse-header', className)}>
      <WalletCardWrapper
        {...cardProps}
        showSubCard={!!setShowSubCard}
        onFallbackClick={(fallback) => {
          setShowSubCard(fallback ? 'setting' : undefined);
        }}
        {...subCardProps}>
        {children}
      </WalletCardWrapper>
    </Drawer>
  );
};

export default WalletDrawerWrapper;
