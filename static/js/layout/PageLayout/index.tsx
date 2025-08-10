import './index.less';

import { Default, Mobile } from '@/components/MediaQuery';
import PnlShareModal from '@/components/Modal/PnlShareModal';
import TokenExchangeModal from '@/components/Modal/TokenExchangeModal';
import { GlobalModalType } from '@/constants';
import { useModalOpen, useToggleModal } from '@/features/global/hooks';
import UserAddressModal from '@/features/user/UserAddressModal';
import classNames from 'classnames';
import { Outlet } from 'react-router-dom';

export default function PageLayout({ className }: { className?: string }): JSX.Element {
  const isShowUserModal = useModalOpen(GlobalModalType.Account);
  const toggleUserAddressModal = useToggleModal(GlobalModalType.Account);
  return (
    <div className={classNames(className, 'page-layout')}>
      <PnlShareModal />
      <TokenExchangeModal />
      <Default>
        <UserAddressModal
          open={isShowUserModal}
          onCancel={() => {
            toggleUserAddressModal(false);
          }}
          onOk={() => {
            toggleUserAddressModal(false);
          }}
        />
      </Default>
      <Outlet></Outlet>
      <Mobile>
        <></>
      </Mobile>
    </div>
  );
}
