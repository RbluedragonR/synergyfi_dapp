import Drawer from '@/components/Drawer';
import { useMediaQueryDevice } from '@/components/MediaQuery';
import Modal from '@/components/Modal';
import { SecondGlobalModalType } from '@/constants';
import { usePnlShareModal } from '@/features/global/hooks';
import { pnlNotiStorageKey, pnlStorageKey } from '@/hooks/trade/usePnlSharePanel';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import PnlShareModalContent from './PnlShareModalContent';
import './index.less';

export default function PnlShareModal() {
  const { deviceType, isMobile } = useMediaQueryDevice();
  const { t } = useTranslation();
  const { isOpenModal, togglePnlShareModal } = usePnlShareModal();
  const { isOpenModal: isOpenNotiModal, togglePnlShareModal: toggleNotiPnlModal } = usePnlShareModal(
    SecondGlobalModalType.PNL_SHARE_NOTIFICATION,
  );

  return isMobile ? (
    <Drawer
      className={classNames('syn-psm-drawer')}
      title={isOpenNotiModal ? t('notification.pnl.title') : t('common.pnlShareModal.sharePosition')}
      height={'auto'}
      placement="bottom"
      closable={true}
      zIndex={10000}
      maskClosable={true}
      onClose={() => {
        togglePnlShareModal(false);
        toggleNotiPnlModal(false);
      }}
      open={isOpenModal || isOpenNotiModal}>
      <PnlShareModalContent pnlStorageKey={isOpenNotiModal ? pnlNotiStorageKey : pnlStorageKey} />
    </Drawer>
  ) : (
    <Modal
      className={classNames('syn-psm-modal', deviceType)}
      centered={true}
      zIndex={10000}
      title={isOpenNotiModal ? t('notification.pnl.title') : t('common.pnlShareModal.sharePosition')}
      open={isOpenModal || isOpenNotiModal}
      maskClosable={true}
      onCancel={() => {
        togglePnlShareModal(false);
        toggleNotiPnlModal(false);
      }}
      closable={true}>
      <PnlShareModalContent pnlStorageKey={isOpenNotiModal ? pnlNotiStorageKey : pnlStorageKey} />
    </Modal>
  );
}
