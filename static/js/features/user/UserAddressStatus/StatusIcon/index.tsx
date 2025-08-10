import './index.less';

import WalletConnectIcon from '@/assets/images/wallets/wallet-connect.svg';
import { ReactComponent as IconImpersonator } from '@/assets/svg/icon_impersonator.svg';
import { useUserState } from '@/features/user/hooks';
import { useWalletType } from '@/features/wallet/hook';
import { WalletType } from '@/types/wallet';

import Identicon from './Identicon';

export function StatusIcon({ size = 16 }: { size?: number }): JSX.Element | null {
  const walletType = useWalletType();
  const { impostorAddress } = useUserState();
  if (!walletType) return null;
  if (impostorAddress) {
    return (
      <div className="status-icon">
        <IconImpersonator width={size} height={size}></IconImpersonator>
      </div>
    );
  } else if (walletType === WalletType.WALLET_CONNECT) {
    return (
      <div className="status-icon">
        <img loading="lazy" src={WalletConnectIcon} alt={'WalletConnect'} />
      </div>
    );
  } else {
    return (
      <div className="status-icon">
        <Identicon size={size} />
      </div>
    );
  }
  return null;
}
