/**
 * @description Component-WrappedButton
 */
import { FC } from 'react';

import { GlobalModalType } from '@/constants';
import { useToggleModal } from '@/features/global/hooks';
import { useWalletConnectStatus } from '@/features/wallet/hook';
import { useGa } from '@/hooks/useGa';
import { ApproveButtonComponent } from '@/pages/components/WalletStatus/ApproveButton';
import ConnectWalletButton from '@/pages/components/WalletStatus/ConnectWalletButton';
import SwitchNetworkButton from '@/pages/components/WalletStatus/SwitchNetworkButton';
import { IApproveButtonProps } from '@/types/button';
import { WALLET_CONNECT_STATUS } from '@/types/wallet';
import { GaCategory } from '@/utils/analytics';

const WrappedButton: FC<IApproveButtonProps> = function (props) {
  const walletConnectStatus = useWalletConnectStatus();
  const gaEvent = useGa();
  const toggleWalletModal = useToggleModal(GlobalModalType.Wallet);
  return (
    <div className={`syn-wrapped-button`}>
      {walletConnectStatus === WALLET_CONNECT_STATUS.UN_CONNECT && (
        <ConnectWalletButton
          onClick={() => {
            toggleWalletModal();
            gaEvent({
              category: GaCategory.TRADE_PAIR_CARD_WRAPPER,
              action: 'Wallet-Click on Connect Wallet',
            });
          }}>
          {props.unConnectedText}
        </ConnectWalletButton>
      )}
      {walletConnectStatus === WALLET_CONNECT_STATUS.WRONG_NETWORK && <SwitchNetworkButton />}
      {walletConnectStatus === WALLET_CONNECT_STATUS.CONNECTED && <ApproveButtonComponent {...props} />}
    </div>
  );
};

export default WrappedButton;
