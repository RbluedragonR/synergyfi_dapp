import './index.less';

import classnames from 'classnames';
import { useTranslation } from 'react-i18next';

import Modal from '@/components/Modal';
import { GlobalModalType } from '@/constants';
import { useGlobalModalType } from '@/features/global/hooks';
import { WalletModalContent, WalletModalHeader } from '@/features/wallet/WalletModalContent';
import { useChainId } from '@/hooks/web3/useChain';
import { IModalProps } from '@/types/modal';

import UserAddress from './UserAddress';
import { UserAddressContent } from './UserAddressModalContent';

export default function UserAddressModal(props: IModalProps): JSX.Element | null {
  const modalType = useGlobalModalType();
  const { t } = useTranslation();
  const chainId = useChainId();

  return (
    <Modal
      data-testid="user_address_modal"
      width={560}
      title={modalType === GlobalModalType.Account ? <UserAddress /> : t('modal.userAddrModal.title')}
      {...props}
      onCancel={() => {
        props?.onCancel && props?.onCancel();
      }}
      className={classnames('user-address-modal', props.className)}
      centered
      extraHeader={modalType !== GlobalModalType.Account && <WalletModalHeader />}>
      {modalType === GlobalModalType.Account ? (
        <>
          <UserAddressContent chainId={chainId} />
        </>
      ) : (
        // <UserAddressFooter></UserAddressFooter>
        <WalletModalContent />
      )}
    </Modal>
  );
}
