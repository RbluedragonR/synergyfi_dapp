import './index.less';

import classnames from 'classnames';
import { useTranslation } from 'react-i18next';

import { ExternalLink } from '@/components/Link';
import { useMediaQueryDevice } from '@/components/MediaQuery';
import { useGa } from '@/hooks/useGa';
import { GaCategory } from '@/utils/analytics';

import { WalletType } from '@/types/wallet';
import { useState } from 'react';
import { useSocialWalletConfigList, useWeb3WalletConfigList } from '../hook';
import SocialWallet from './SocialWallet';
import WalletItem, { EmptyWalletItem } from './WalletItem';

export function WalletModalContent(): JSX.Element {
  const walletList = useWeb3WalletConfigList();
  const { isNotMobile, isMobile } = useMediaQueryDevice();
  const socialWalletList = useSocialWalletConfigList();
  const [pendingWallet, setPendingWallet] = useState<WalletType | undefined>();
  const [pendingWalletId, setPendingWalletId] = useState<string | undefined>();

  return (
    <div className={classnames('wallet-modal-content', 'syn-scrollbar')}>
      <WalletModalHeader />
      <div className="wallet-list-wrap">
        <div className="wallet-list">
          {walletList.map((wallet) => {
            if (isNotMobile && wallet.mobileOnly) return null;
            if (isMobile && !wallet.mobile) return null;
            return (
              <WalletItem
                wallet={wallet}
                key={wallet.name}
                pendingWalletId={pendingWalletId}
                pendingWallet={pendingWallet}
                onChangePendingWallet={(wallet) => {
                  setPendingWallet(wallet?.type);
                  setPendingWalletId(wallet?.id);
                }}
              />
            );
          })}
          {isNotMobile && walletList.length && walletList.length % 2 === 1 ? <EmptyWalletItem /> : null}
        </div>

        <div className="wallet-list-line"></div>
        {socialWalletList.length && (
          <div className="wallet-list">
            {socialWalletList.map((wallet) => {
              return (
                <SocialWallet
                  wallet={wallet}
                  key={wallet.name}
                  pendingWallet={pendingWallet}
                  onChangePendingWallet={(wallet) => {
                    setPendingWallet(wallet?.type);
                    setPendingWalletId(wallet?.id);
                  }}
                />
              );
            })}
            {isNotMobile && socialWalletList.length && socialWalletList.length % 2 === 1 ? <EmptyWalletItem /> : null}
          </div>
        )}
      </div>
    </div>
  );
}

export function WalletModalHeader(): JSX.Element {
  const gaEvent = useGa();
  const { t } = useTranslation();
  return (
    <p className="wallet-modal-title">
      {t('modal.walletModal.header.title')}{' '}
      <ExternalLink
        onClick={() => {
          gaEvent({
            category: GaCategory.WALLET_MODULE,
            action: 'Wallet-Click on Terms of Use',
          });
        }}
        href="https://www.synfutures.com/terms">
        {t('modal.walletModal.header.ToS')}
      </ExternalLink>{' '}
      {t('modal.walletModal.header.and')}{' '}
      <ExternalLink
        onClick={() => {
          gaEvent({
            category: GaCategory.WALLET_MODULE,
            action: 'Wallet-Click on Privacy Policy',
          });
        }}
        href="https://www.synfutures.com/policy">
        {t('modal.walletModal.header.PP')}
      </ExternalLink>{' '}
      {t('modal.walletModal.header.title2')}
    </p>
  );
}
