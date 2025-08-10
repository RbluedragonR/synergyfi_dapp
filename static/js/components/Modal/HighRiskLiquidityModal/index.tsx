import { ComponentProps, useCallback } from 'react';

import { useMediaQueryDevice } from '@/components/MediaQuery';
// import { Modal, Button } from 'antd';
import Modal from '@/components/Modal';
// import { ReactComponent as IconAgreement } from '@/assets/svg/icon_agreement.svg';
import { useSecondModalOpen, useToggleSecondModal } from '@/features/global/hooks';
import './index.less';

import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import Drawer from '@/components/Drawer';
import { SecondGlobalModalType } from '@/constants';
import { useSwitchNetwork } from '@/hooks/web3/useSwitchConnectorNetwork';
import { CHAIN_ID } from '@derivation-tech/context';
import HighRiskLiquidityModalContent from './HighRiskLiquidityModalContent';
type THighRiskLiquidityModal = ComponentProps<'div'> & { onClickLiqButton: () => Promise<void> };
const HighRiskLiquidityModal = function ({ children, onClickLiqButton }: THighRiskLiquidityModal) {
  const { deviceType, isMobile } = useMediaQueryDevice();
  const isOpenModal = useSecondModalOpen(SecondGlobalModalType.HIGH_RISK_LIQUIDITY);
  const toggleInitialChainSwitchModal = useToggleSecondModal(SecondGlobalModalType.HIGH_RISK_LIQUIDITY);
  const { switchAppNetwork, switchWalletNetwork } = useSwitchNetwork();
  const { t } = useTranslation();
  const onOk = useCallback(
    (chainId: CHAIN_ID) => {
      switchAppNetwork(chainId);
      switchWalletNetwork(chainId);
      toggleInitialChainSwitchModal(false);
    },
    [switchAppNetwork, switchWalletNetwork, toggleInitialChainSwitchModal],
  );

  return isMobile ? (
    <Drawer
      className={classNames('syn-hrlm-drawer')}
      title={t('common.highRiskEarnModal.title')}
      height={'auto'}
      placement="bottom"
      closable={true}
      closeIcon={true}
      maskClosable={false}
      open={isOpenModal}>
      <HighRiskLiquidityModalContent isMobile onOk={onOk} onClickLiqButton={onClickLiqButton}>
        {children}
      </HighRiskLiquidityModalContent>
    </Drawer>
  ) : (
    <Modal
      className={classNames('syn-hrlm-modal', deviceType)}
      style={{ top: isMobile ? undefined : 64 }}
      centered={true}
      closable={true}
      open={isOpenModal}
      maskClosable={false}
      onCancel={() => {
        toggleInitialChainSwitchModal(false);
      }}
      title={t('common.highRiskEarnModal.title')}>
      <HighRiskLiquidityModalContent onOk={onOk} onClickLiqButton={onClickLiqButton}>
        {children}
      </HighRiskLiquidityModalContent>
    </Modal>
  );
};

export default HighRiskLiquidityModal;
