/**
 * @description Component-ConnectWalletButton
 */
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { NetworkButton } from '@/components/Button';
import { useMediaQueryDevice } from '@/components/MediaQuery';
import { Tooltip } from '@/components/ToolTip';
import { fetchIpIsBlocked } from '@/features/global/actions';
import { useIsIpBlocked } from '@/features/global/hooks';
import { useAppDispatch } from '@/hooks';
import { NetworkButtonProps } from '@/types/button';

const ConnectWalletButton: FC<NetworkButtonProps> = function ({ children, onClick, ...props }) {
  const { t } = useTranslation();
  const { isMobile } = useMediaQueryDevice();
  const dispatch = useAppDispatch();
  const isIpBlocked = useIsIpBlocked();
  return (
    <Tooltip showOnMobile={true} title={isIpBlocked ? t('common.ipBlocker.tooltip') : undefined}>
      <NetworkButton
        block
        {...props}
        className={isIpBlocked ? 'disabled' : ''}
        disabled={props.disabled}
        onClick={async (e) => {
          const ipBlocked = await dispatch(fetchIpIsBlocked()).unwrap();
          if (!ipBlocked) {
            onClick && onClick(e);
          }
        }}>
        {children || (isMobile ? t('common.connectWalMobile') : t('common.connectWal'))}
      </NetworkButton>
    </Tooltip>
  );
};

export default ConnectWalletButton;
