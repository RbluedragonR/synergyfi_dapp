import './index.less';

// import { disconnect } from '@wagmi/core';
import classnames from 'classnames';
import { useTranslation } from 'react-i18next';

import { useMediaQueryDevice } from '@/components/MediaQuery';

import DisconnectBtn from '@/features/user/UserAddressModal/DisconnectBtn';
import { useWagmiAccount } from '@/hooks/web3/useWagami';
import { WalletType } from '@/types/wallet';
import WalletBrand from '../WalletBrand';
import { useWalletType } from '../hook';

export default function SwitchWalletButton(): JSX.Element | null {
  const walletType = useWalletType();
  const { deviceType } = useMediaQueryDevice();
  const { t } = useTranslation();
  const { isConnected } = useWagmiAccount();

  if (!isConnected && walletType !== WalletType.PRIVY) return null;

  return (
    <div className={classnames('switch-wallet-wrap', deviceType)}>
      <div className="switch-wallet-wrap-left">
        <span>{t('modal.userAddrModal.switchWBtn.ConecWith')}</span>
        {walletType && <WalletBrand hideName={true} type={walletType} />}
      </div>
      <div className="switch-wallet-wrap-right">
        {/* {isMobile && <DisconnectBtn />} */}
        {
          <DisconnectBtn />
          // <Button type="primary" ghost className="switch-wallet-btn" size="small" onClick={handleChangeModal}>
          //   {isMobile ? t('modal.userAddrModal.switchWBtn.mobileChange') : t('modal.userAddrModal.switchWBtn.Change')}
          // </Button>
        }
      </div>
    </div>
  );
}
