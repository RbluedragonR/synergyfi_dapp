import { FC, useCallback, useEffect } from 'react';

import { Default, useMediaQueryDevice } from '@/components/MediaQuery';
// import { Modal, Button } from 'antd';
import Modal from '@/components/Modal';
import { GlobalModalType, THEME_ENUM } from '@/constants';
// import { ReactComponent as IconAgreement } from '@/assets/svg/icon_agreement.svg';
import { useShowTermModal, useTheme, useToggleModal } from '@/features/global/hooks';
import { GaCategory } from '@/utils/analytics';
import './index.less';

const [darkIcon, lightIcon] = [require('./assets/dialog-icon-dark.png'), require('./assets/dialog-icon-light.png')];

import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import { useGa } from '@/hooks/useGa';

import Drawer from '../Drawer';
import TermModalContent from './TermModalContent';
const TermModal: FC = function () {
  const { deviceType, isMobile } = useMediaQueryDevice();
  const [isOpenModal, isAgree, setAgree] = useShowTermModal();
  const toggleModal = useToggleModal(GlobalModalType.Term);
  const toggleInitialChainSwitchModal = useToggleModal(GlobalModalType.INITIAL_CHAIN_SWITCH);
  const { dataTheme } = useTheme();
  const gaEvent = useGa();
  const { t } = useTranslation();

  useEffect(() => {
    if (!isAgree) {
      toggleModal(true);
    }
  }, [isAgree, toggleModal]);

  const onCancel = useCallback(() => {
    document.location.href = 'https://synfutures.com';
    gaEvent({ category: GaCategory.ACKNOWLEDGEMENTS, action: 'Term-Click on Cancel ' });
  }, [gaEvent]);

  const onOk = useCallback(() => {
    setAgree(true);
    toggleInitialChainSwitchModal(true);
    // localStorage.setItem(SYN_AGREE_TERM, 'agree');
    gaEvent({ category: GaCategory.ACKNOWLEDGEMENTS, action: 'Term-Click on I agree' });
  }, [gaEvent, setAgree, toggleInitialChainSwitchModal]);
  return isMobile ? (
    <Drawer
      className={classNames('syn-term-drawer')}
      title={t('common.term.title')}
      height={'auto'}
      placement="bottom"
      closable={false}
      closeIcon={false}
      maskClosable={false}
      open={isOpenModal}
      onClose={onCancel}>
      <TermModalContent className="syn-term-drawer-content" onCancel={onCancel} onOk={onOk} />
    </Drawer>
  ) : (
    <Modal
      centered
      className={classNames('syn-term_modal', deviceType)}
      // centered={true}
      width={1000}
      closable={false}
      open={isOpenModal}
      maskClosable={false}
      // keyboard={false}
      title
      extraHeader={
        <div className={classNames('syn-term_modal-title', deviceType)}>
          <Default>
            <div className="syn-term_modal-title-icon">
              <img loading="lazy" src={dataTheme === THEME_ENUM.DARK ? darkIcon.default : lightIcon.default} />
            </div>
          </Default>
          <p>{t('common.term.title')}</p>
        </div>
      }>
      <TermModalContent onCancel={onCancel} onOk={onOk} />
    </Modal>
  );
};

export default TermModal;
