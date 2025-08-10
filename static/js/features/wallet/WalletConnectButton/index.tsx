import './index.less';

import { ButtonProps } from 'antd';
// import { ethers } from 'ethers';
import { useTranslation } from 'react-i18next';

import { ReactComponent as WalletIcon } from '@/assets/svg/icon_wallet_mobile.svg';
// import { ReactComponent as IconLink } from '@/assets/svg/icon_link_16.svg';
import { Button } from '@/components/Button';
import { NetworkButtonBorder } from '@/components/Button/NetworkButton';
import { useMediaQueryDevice } from '@/components/MediaQuery';
import { Tooltip } from '@/components/ToolTip';
import { GlobalModalType } from '@/constants';
import { fetchIpIsBlocked } from '@/features/global/actions';
import { useIsIpBlocked, useModalOpen, useToggleModal } from '@/features/global/hooks';
import { useAppDispatch } from '@/hooks';
import { useGa } from '@/hooks/useGa';
import { GaCategory } from '@/utils/analytics';
import classNames from 'classnames';

export default function WalletConnectButton({
  desktopOnly,
  ...props
}: ButtonProps & { disableIcon?: boolean; desktopOnly?: boolean }): JSX.Element {
  const isShowModal = useModalOpen(GlobalModalType.Wallet);
  const toggleModal = useToggleModal(GlobalModalType.Wallet);
  const gaEvent = useGa();
  const { isMobile } = useMediaQueryDevice();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isIpBlocked = useIsIpBlocked();

  return isMobile && !desktopOnly ? (
    <Tooltip showOnMobile={true} title={isIpBlocked ? t('common.ipBlocker.tooltip') : undefined}>
      <Button
        onClick={async () => {
          const ipBlocked = await dispatch(fetchIpIsBlocked()).unwrap();
          if (ipBlocked) {
            return;
          }
          toggleModal();
          gaEvent({
            category: GaCategory.HEADER,
            action: 'Wallet-Click on Connect Wallet',
            label: {
              modalOpen: isShowModal,
            },
          });
        }}
        className={classNames('wallet-connect-btn-mobile', { disabled: isIpBlocked })}
        type="text"
        icon={<WalletIcon />}
      />
    </Tooltip>
  ) : (
    <Tooltip showOnMobile={true} title={isIpBlocked ? t('common.ipBlocker.tooltip') : undefined}>
      <NetworkButtonBorder
        ghost
        type="default"
        {...props}
        disabled={props.disabled || isIpBlocked}
        onClick={async () => {
          const ipBlocked = await dispatch(fetchIpIsBlocked()).unwrap();
          if (ipBlocked) {
            return;
          }
          toggleModal();
          gaEvent({
            category: GaCategory.HEADER,
            action: 'Wallet-Click on Connect Wallet',
            label: {
              modalOpen: isShowModal,
            },
          });
        }}
        className="wallet-connect-btn">
        {/* {!props.disableIcon && <IconLink />} */}
        <span>{t('header.menu.connectWallet')}</span>
      </NetworkButtonBorder>
    </Tooltip>
  );
}
