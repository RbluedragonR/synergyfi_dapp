/**
 * @description Component-DisconnectBtn
 */
import classNames from 'classnames';
import './index.less';

import { Button } from '@/components/Button';
import { useMediaQueryDevice } from '@/components/MediaQuery';
import { useLoginInOrOutPrivyWallet } from '@/connectors/privy/usePrivyWallet';
import { GlobalModalType } from '@/constants';
import { WALLET_TYPE } from '@/constants/storage';
import { useToggleModal } from '@/features/global/hooks';
import { useWalletType } from '@/features/wallet/hook';
import { useWagmiDisconnect } from '@/hooks/web3/useWagami';
import { IButtonProps } from '@/types/button';
import { WalletType } from '@/types/wallet';
import { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const DisconnectBtn: FC<IButtonProps> = function (props) {
  const { t } = useTranslation();
  const walletType = useWalletType();
  const { logout } = useLoginInOrOutPrivyWallet();
  const disconnect = useWagmiDisconnect();
  const { deviceType } = useMediaQueryDevice();
  const openModal = useToggleModal(GlobalModalType.Wallet);

  const onClickDisconnect = useCallback(() => {
    // disconnect wallet
    if (walletType === WalletType.PRIVY) {
      logout();
    }
    localStorage.removeItem(WALLET_TYPE);
    disconnect();
    openModal(true);
  }, [disconnect, logout, openModal, walletType]);

  return (
    <Button
      {...props}
      type="primary"
      ghost
      size="small"
      onClick={onClickDisconnect}
      className={classNames(props.className, ['syn-disconnect-btn'], deviceType)}>
      {t('modal.userAddrModal.disconnectBtn.btn')}
    </Button>
  );
};

export default DisconnectBtn;
