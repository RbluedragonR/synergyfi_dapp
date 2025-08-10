/**
 * @description Component-UserAddressDrawer
 */
import './index.less';

import { FC } from 'react';

import Drawer from '@/components/Drawer';
import { GlobalModalType } from '@/constants';
import BalanceList from '@/features/balance/BalanceList';
import { useModalOpen, useToggleModal } from '@/features/global/hooks';
import { useChainId } from '@/hooks/web3/useChain';

import SwitchWalletButton from '@/features/wallet/SwitchWalletButton';
import UserAddress from '../../UserAddressModal/UserAddress';
interface IPropTypes {
  className?: string;
}
const UserAddressDrawer: FC<IPropTypes> = function () {
  const chainId = useChainId();
  const isShowUserModal = useModalOpen(GlobalModalType.Account);
  const toggleUserAddressModal = useToggleModal(GlobalModalType.Account);
  return (
    <Drawer
      placement={'bottom'}
      height={'auto'}
      title={
        <div className="syn-user-address-drawer-title">
          <UserAddress />
        </div>
      }
      style={{ top: isShowUserModal ? 64 : 0, contentVisibility: isShowUserModal ? 'auto' : 'hidden' }}
      onClose={() => {
        toggleUserAddressModal(false);
      }}
      className="syn-user-address-drawer"
      open={isShowUserModal}
      footer={
        <div>
          <SwitchWalletButton />
        </div>
      }
      key={'header-drawer'}>
      <BalanceList chainId={chainId} />
    </Drawer>
  );
};

export default UserAddressDrawer;
