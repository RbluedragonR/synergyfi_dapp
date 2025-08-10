/**
 * @description Component-PrivyAccountDetailModal
 */
import Modal from '@/components/Modal';
import classnames from 'classnames';
import './index.less';

import Drawer from '@/components/Drawer';
import { useMediaQueryDevice } from '@/components/MediaQuery';
import { IModalProps } from '@/types/modal';
import _ from 'lodash';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { PrivyAccountDetailModalContent } from './PrivyAccountDetailModalContent';

const PrivyAccountDetailModal: FC<IModalProps> = function (props) {
  const { isMobile } = useMediaQueryDevice();
  const { t } = useTranslation();
  return isMobile ? (
    <Drawer
      className={classnames('user-wallet-drawer syn-mobile-user-wallet-drawer', props.className)}
      title={t('modal.walletModal.privyHeader')}
      height={'auto'}
      placement="bottom"
      onClose={props.onCancel}
      {..._.omit(props, ['footer'])}>
      <PrivyAccountDetailModalContent />
    </Drawer>
  ) : (
    <Modal
      data-testid="user_wallet_modal"
      width={560}
      title={t('modal.walletModal.privyHeader')}
      {...props}
      className={classnames('syn-privy-account-detail', props.className)}>
      <>
        <PrivyAccountDetailModalContent />
      </>
    </Modal>
  );
};

export default PrivyAccountDetailModal;
