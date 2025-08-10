/**
 * @description Component-GlobalWalletModal
 */
import { FC } from 'react';

import { GlobalModalType } from '@/constants';
import { useIsIpBlocked, useModalOpen, useToggleModal } from '@/features/global/hooks';
import WalletModal from '@/features/wallet/WalletModal';

const GlobalWalletModal: FC = function () {
  const isShowModal = useModalOpen(GlobalModalType.Wallet);
  const toggleModal = useToggleModal(GlobalModalType.Wallet);
  const isIpBlocked = useIsIpBlocked();
  return (
    <WalletModal
      open={isShowModal && !isIpBlocked}
      onCancel={() => {
        toggleModal();
      }}
      onOk={() => {
        toggleModal();
      }}></WalletModal>
  );
};

export default GlobalWalletModal;
