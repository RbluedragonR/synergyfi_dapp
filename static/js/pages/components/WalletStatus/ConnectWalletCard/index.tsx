/**
 * @description Component-ConnectWalletCard
 */
import './index.less';

import { ReactComponent as IconConnectWallet } from './assets/icon_connect_wallet.svg';

import { GlobalModalType } from '@/constants';
import { useToggleModal } from '@/features/global/hooks';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import ConnectWalletButton from '../ConnectWalletButton';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const ConnectWalletCard: FC<IPropTypes> = function ({}) {
  const { t } = useTranslation();
  const toggleWalletModal = useToggleModal(GlobalModalType.Wallet);
  return (
    <div className="syn-connect-wallet-card">
      <IconConnectWallet />
      <div className="syn-connect-wallet-card-right">
        <div className="syn-connect-wallet-card-title">{t('common.portfolio.connectWallet')}</div>
        <ConnectWalletButton
          block={false}
          onClick={() => {
            toggleWalletModal(true);
          }}
        />
      </div>
    </div>
  );
};

export default ConnectWalletCard;
