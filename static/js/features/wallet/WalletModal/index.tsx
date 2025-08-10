import './index.less';

import classnames from 'classnames';
import _ from 'lodash';

import Drawer from '@/components/Drawer';
import { useMediaQueryDevice } from '@/components/MediaQuery';
import Modal from '@/components/Modal';
import { WalletModalContent } from '@/features/wallet/WalletModalContent';
import { IModalProps } from '@/types/modal';
import { useTranslation } from 'react-i18next';

export default function WalletModal(props: IModalProps): JSX.Element | null {
  const { isMobile } = useMediaQueryDevice();
  const { t } = useTranslation();
  return isMobile ? (
    <Drawer
      className={classnames('user-wallet-drawer syn-mobile-user-wallet-drawer', props.className)}
      title={t('common.connectWal')}
      height={'auto'}
      placement="bottom"
      destroyOnClose={true}
      onClose={props.onCancel}
      {..._.omit(props, ['footer'])}>
      <WalletModalContent />
    </Drawer>
  ) : (
    <Modal
      data-testid="user_wallet_modal"
      width={616}
      title={t('common.connectWal')}
      {...props}
      className={classnames('user-wallet-modal', props.className)}>
      <>
        <WalletModalContent />
      </>
    </Modal>
  );
}
