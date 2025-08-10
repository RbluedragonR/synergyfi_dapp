/**
 * @description Component-WalletModalWrapper
 */
import './index.less';

import classNames from 'classnames';
import { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CardModalWrapper } from '@/components/CardWrapper';
import { useWalletConnectStatus } from '@/features/wallet/hook';
import { ICardWrapperModalPropTypes } from '@/types/modal';
import { WALLET_CONNECT_STATUS } from '@/types/wallet';

import SettingSubCard from '../SettingSubCard';
import { useUnConnectSubCard } from '../UnconnectSubCard';
interface PropTypes extends ICardWrapperModalPropTypes {
  onClose: () => void;
}
const WalletModalWrapper: FC<PropTypes> = function ({
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
    <CardModalWrapper
      {...props}
      cardProps={{
        ...cardProps,
        showSubCard: !!showSubCard,
        ...subCardProps,
        onFallbackClick: (fallback) => {
          setShowSubCard(fallback ? 'setting' : undefined);
        },
      }}
      className={classNames('syn-wallet-card-wrapper', `width-${props.width}`, className)}
      onClose={onClose}>
      {children}
    </CardModalWrapper>
  );
};

export default WalletModalWrapper;
