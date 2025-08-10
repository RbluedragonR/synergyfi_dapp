/**
 * @description Component-EarnUnconnectedCard
 */
import classNames from 'classnames';
import { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';

import { GlobalModalType, THEME_ENUM } from '@/constants';
import { useTheme, useToggleModal } from '@/features/global/hooks';
import { useWalletConnectStatus } from '@/features/wallet/hook';
import { WALLET_CONNECT_STATUS } from '@/types/wallet';

import ConnectWalletButton from '../WalletStatus/ConnectWalletButton';
import GlossyIcon from './assets/icon_mj_link.png';
import GlossyIconD from './assets/icon_mj_link_d.png';
import './index.less';
interface IProps {
  hide?: boolean;
}
const UnconnectedCard: FC<IProps> = function ({ hide }) {
  const connectionStatus = useWalletConnectStatus();
  const theme = useTheme();
  const { t } = useTranslation();
  const toggleWalletModal = useToggleModal(GlobalModalType.Wallet);
  return (
    <>
      {connectionStatus === WALLET_CONNECT_STATUS.UN_CONNECT && !hide && (
        <div className={classNames('syn-UnconnectedCard', theme.dataTheme)}>
          <img loading="lazy" src={theme.dataTheme === THEME_ENUM.DARK ? GlossyIconD : GlossyIcon} />

          <div className="syn-UnconnectedCard-content">
            <div className="syn-UnconnectedCard-title">{t('common.portfolio.connectWallet')}</div>
            <div className="syn-UnconnectedCard-bottom">
              <ConnectWalletButton
                block={false}
                onClick={() => {
                  toggleWalletModal(true);
                }}></ConnectWalletButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default memo(UnconnectedCard);
