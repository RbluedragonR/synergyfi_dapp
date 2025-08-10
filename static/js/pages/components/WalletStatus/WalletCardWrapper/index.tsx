/**
 * @description Component-WalletCardWrapper
 */
import classNames from 'classnames';
import { FC, memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './index.less';

import { CardWrapper } from '@/components/CardWrapper';
import { useWalletConnectStatus } from '@/features/wallet/hook';
import { ICardWrapperProps } from '@/types/card';
import { WALLET_CONNECT_STATUS } from '@/types/wallet';

import SettingSubCard from '../SettingSubCard';
import { useUnConnectSubCard } from '../UnconnectSubCard';
interface IWalletCardWrapperProps extends ICardWrapperProps {
  showSliderBar?: boolean;
  isSpot?: boolean;
  onTabChange?: (key: string) => void;
}

const WalletCardWrapper: FC<IWalletCardWrapperProps> = function ({ className, ...props }) {
  const [showSubCard, setShowSubCard] = useState<'wallet' | 'setting' | undefined>(undefined);
  const unConnectSubCardProps = useUnConnectSubCard(showSubCard, setShowSubCard, true);
  const { t } = useTranslation();
  const subCardProps = useMemo(() => {
    return {
      subCardSlot: (
        <SettingSubCard
          isMobile={props.mobileMode}
          isSpot={props.isSpot}
          onSave={() => {
            props.onFallbackClick && props.onFallbackClick(false);
            setShowSubCard(undefined);
          }}></SettingSubCard>
      ),
      subCardTitle: t('common.walletCardWrapper.subCardTitle'),
      ...unConnectSubCardProps,
    };
  }, [props, t, unConnectSubCardProps]);

  const walletConnectStatus = useWalletConnectStatus();

  useEffect(() => {
    // close
    if (showSubCard === 'wallet' && walletConnectStatus !== WALLET_CONNECT_STATUS.UN_CONNECT) {
      setShowSubCard(undefined);
    }
  }, [walletConnectStatus, showSubCard]);

  return (
    <CardWrapper
      {...props}
      className={classNames('syn-wallet-card-wrapper', className)}
      showSubCard={!!showSubCard}
      onFallbackClick={(fallback) => {
        setShowSubCard(fallback ? 'setting' : undefined);
        props.onFallbackClick && props.onFallbackClick(fallback);
      }}
      {...subCardProps}
    />
  );
};

export default memo(WalletCardWrapper);
