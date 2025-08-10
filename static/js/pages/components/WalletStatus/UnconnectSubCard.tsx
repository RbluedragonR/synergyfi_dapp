import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useMediaQueryDevice } from '@/components/MediaQuery';
import { GlobalModalType } from '@/constants';
import { useToggleModal } from '@/features/global/hooks';
import { useWalletConnectStatus } from '@/features/wallet/hook';
import { useGa } from '@/hooks/useGa';
import { ISubCardProps } from '@/types/cardwrapper';
import { WALLET_CONNECT_STATUS } from '@/types/wallet';
import { GaCategory } from '@/utils/analytics';

import ConnectWalletButton from './ConnectWalletButton';
import ConnectWalletSubCard from './ConnectWalletSubCard';
import SwitchNetworkButton from './SwitchNetworkButton';
export function useUnConnectSubCard(
  showSubCard: string | undefined,
  setShowSubCard: React.Dispatch<React.SetStateAction<'wallet' | 'setting' | undefined>>,
  showFooter = true,
  connectWalletButtonChildren?: React.ReactNode,
): ISubCardProps | undefined {
  const { isMobile } = useMediaQueryDevice();
  const walletConnectStatus = useWalletConnectStatus();
  const gaEvent = useGa();
  const { t } = useTranslation();
  const toggleWalletModal = useToggleModal(GlobalModalType.Wallet);

  const res = useMemo(() => {
    let res: ISubCardProps | undefined;
    if (showFooter) {
      if (walletConnectStatus === WALLET_CONNECT_STATUS.UN_CONNECT) {
        res = {
          footer: (
            <ConnectWalletButton
              onClick={() => {
                toggleWalletModal();
                gaEvent({
                  category: GaCategory.TRADE_PAIR_CARD_WRAPPER,
                  action: 'Wallet-Click on Connect Wallet',
                });
              }}>
              {connectWalletButtonChildren}
            </ConnectWalletButton>
          ),
        };
      } else if (walletConnectStatus === WALLET_CONNECT_STATUS.WRONG_NETWORK) {
        res = {
          footer: <SwitchNetworkButton />,
        };
      }
    }
    if (showSubCard !== 'setting' && res && !isMobile) {
      res = {
        ...res,
        subCardSlot: <ConnectWalletSubCard />,
        subCardTitle: t('common.connectWal'),
      };
    }
    return res;
  }, [gaEvent, isMobile, showFooter, showSubCard, t, toggleWalletModal, walletConnectStatus]);

  useEffect(() => {
    setShowSubCard(undefined);
  }, [setShowSubCard, walletConnectStatus]);

  return res;
}
