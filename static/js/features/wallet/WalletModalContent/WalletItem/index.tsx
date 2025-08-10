/**
 * @description Component-WalletItem
 */
import { InfoCircleFilled } from '@ant-design/icons';
import classNames from 'classnames';
import _ from 'lodash';
import { FC, useCallback, useMemo, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { useTranslation } from 'react-i18next';

import { ReactComponent as ChrevronRight } from '@/assets/svg/icon_chevron_right.svg';
import { Button } from '@/components/Button';
import BigLoading from '@/components/Loading/BigLoading';
import { GlobalModalType } from '@/constants';
import { SUPPORTED_WALLETS } from '@/constants/wallets';
import { useToggleModal } from '@/features/global/hooks';
import { useAppDispatch } from '@/hooks';
import { useGa } from '@/hooks/useGa';
import { IWalletConfigInfo, IWeb3WalletInfo, WalletType } from '@/types/wallet';
import { GaCategory } from '@/utils/analytics';

import { useLoginInOrOutPrivyWallet } from '@/connectors/privy/usePrivyWallet';
import { WALLET_TYPE } from '@/constants/storage';
import { useChainId } from '@/hooks/web3/useChain';
import { useWagmiAccount, useWagmiDisconnect } from '@/hooks/web3/useWagami';
import { clearDisconnectFlag } from '@/utils/wagmi';
import { ProviderNotFoundError, useConnect } from 'wagmi';
import WalletBrand from '../../WalletBrand';
import { useWalletExists } from '../../hook';
import { setWalletType } from '../../walletSlice';

function openDeeplinkUrl(url: string): void {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_self';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

interface IPropTypes {
  wallet: IWeb3WalletInfo;
  pendingWallet?: WalletType;
  pendingWalletId?: string;
  onChangePendingWallet?: (wallet?: IWalletConfigInfo) => void;
}
const DEFAULT_ERROR = 'Connection failed';
const WalletItem: FC<IPropTypes> = function ({ wallet, pendingWallet, pendingWalletId, onChangePendingWallet }) {
  const dispatch = useAppDispatch();
  const toggleWalletModal = useToggleModal(GlobalModalType.Wallet);
  const [pendingError, setPendingError] = useState<IWeb3WalletInfo | undefined>();
  const [walletError, setWalletError] = useState(DEFAULT_ERROR);
  const { connector: lastConnector } = useWagmiAccount();
  const { connectAsync } = useConnect();
  const disconnect = useWagmiDisconnect();
  const { logout } = useLoginInOrOutPrivyWallet();
  const isWalletExists = useWalletExists(wallet.type);

  const { t } = useTranslation();
  const gaEvent = useGa();
  const chainId = useChainId();

  const tryActivation = useCallback(
    async (wallet: IWeb3WalletInfo, chainId: number | undefined) => {
      console.log('🚀 ~ chainId:', { chainId, wallet });
      // support coin98 override

      if (wallet.type === WalletType.METAMASK && _.get(window.ethereum, ['isCoin98'])) {
        wallet = SUPPORTED_WALLETS[WalletType.COIN_98];
      }
      const connector = wallet.connector;
      const lastConnector1 = lastConnector;
      if (!connector) return;
      if (connector?.id === lastConnector1?.id) {
        toggleWalletModal(false);
        dispatch(setWalletType({ type: wallet.type }));
      }

      try {
        onChangePendingWallet && onChangePendingWallet(wallet); // set wallet for pending view

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await connectAsync({ connector });
        clearDisconnectFlag();

        if (lastConnector1 && lastConnector1?.id !== connector.id) {
          disconnect();
        }
        localStorage.setItem(WALLET_TYPE, wallet.type);
        dispatch(setWalletType({ type: wallet.type }));
        toggleWalletModal(false);
        gtag('event', 'connect_wallet_result', {
          connect_wallet_result: 'success',
        });
        logout();
      } catch (error) {
        console.log('🚀 ~ tryActivation error:', error);
        if (error instanceof ProviderNotFoundError) {
          setWalletError(t('errors.wallet.notInstalled', { wallet: wallet.name }));
        }

        setPendingError(wallet);
      } finally {
        // onChangePendingWallet && onChangePendingWallet(undefined);
      }
    },
    [lastConnector, toggleWalletModal, dispatch, onChangePendingWallet, connectAsync, logout, disconnect, t],
  );

  const handleChangeWallet = useCallback(
    (wallet: IWeb3WalletInfo, chainId: number | undefined) => {
      if (isMobile && wallet.mobile) {
        // no bit keep wallet

        if (wallet.type === WalletType.COIN_98 && !window.coin98?.provider) {
          if (wallet.downloadLink) {
            window.open(wallet.downloadLink, '_blank');
            return;
          }
        }

        // open in mobile browser, open deep link
        if (!window.web3 && !window.ethereum) {
          if (wallet.mobileDeepLink && document.URL) {
            // navigate(wallet.mobileDeepLink + document.URL);
            openDeeplinkUrl(wallet.mobileDeepLink);
            return;
          }
        }
      }
      gaEvent({
        category: GaCategory.WALLET_MODULE,
        action: 'Wallet-Click on Wallet Type',
        label: wallet.name,
      });
      setPendingError(undefined);
      tryActivation(wallet, chainId);
    },
    [tryActivation, gaEvent],
  );

  const content = useMemo(() => {
    return (
      <div
        key={wallet.name}
        className={classNames(
          'wallet-item',
          pendingError === wallet && pendingWalletId == wallet.id && 'wallet-item_error',
        )}
        onClick={() => {
          handleChangeWallet(wallet, chainId);
        }}>
        <WalletBrand
          type={wallet.type}
          extraDesc={
            isWalletExists ? <div className="wallet-item-installed">{t('modal.walletModal.installed')}</div> : undefined
          }
        />
        <div className="wallet-item-connect">
          {/* {wallet.type === TRENDING_WALLET && (
            <span className={classNames('trending-wallet', deviceType)}>
              🔥{' '}
              <Default>
                <> {t('modal.walletModal.walletItem.Trending')}</>
              </Default>
            </span>
          )} */}
          {pendingWallet === wallet.type ? <BigLoading /> : <ChrevronRight />}
        </div>
      </div>
    );
  }, [chainId, handleChangeWallet, isWalletExists, pendingError, pendingWallet, pendingWalletId, t, wallet]);

  return (
    <div className="wallet-item-wrap" key={wallet.name}>
      {content}
      {pendingError === wallet && pendingWalletId === wallet.id && (
        <div className="wallet-item-retry">
          <InfoCircleFilled className="text-danger" />
          <span>{walletError}</span>
          <Button
            ghost
            type="link"
            onClick={() => {
              handleChangeWallet(wallet, chainId);
            }}>
            {t('modal.walletModal.walletItem.TryAgain')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default WalletItem;

export const EmptyWalletItem = function () {
  return (
    <div className="wallet-item-wrap">
      <div className={classNames('wallet-item', 'empty')}></div>
    </div>
  );
};
