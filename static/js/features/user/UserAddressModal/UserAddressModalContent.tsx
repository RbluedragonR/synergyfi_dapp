import './UserAddressModalContent.less';

import { CHAIN_ID } from '@derivation-tech/context';

import BalanceList from '@/features/balance/BalanceList';
// import BridgeAssets from './BridgeAssets';
import SwitchWalletButton from '@/features/wallet/SwitchWalletButton';

import ClearCacheBtn from './ClearCacheBtn';
import CustomRPC from './CustomRPC';

interface IProps {
  chainId: CHAIN_ID | undefined;
}
export function UserAddressContent({ chainId }: IProps): JSX.Element {
  return (
    <div className="user-address-modal-content">
      <BalanceList chainId={chainId} />
      <div className="user-address-wallet">
        <div className="user-address-wallet-left">
          <ClearCacheBtn />
        </div>
        <SwitchWalletButton />
        {/* <BridgeAssets></BridgeAssets> */}
      </div>
      <UserAddressFooter />
    </div>
  );
}

export function UserAddressFooter(): JSX.Element {
  return (
    <div className="user-address-footer">
      {/* <RecentTransactions /> */}
      <CustomRPC />
    </div>
  );
}
