/**
 * @description Component-MobileFooter
 */
import './index.less';

import classNames from 'classnames';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

import { GlobalModalType } from '@/constants';
import { useIsIpBlocked, useToggleModal } from '@/features/global/hooks';
import { useWalletConnectStatus } from '@/features/wallet/hook';
import { useChainId } from '@/hooks/web3/useChain';
import { WALLET_CONNECT_STATUS } from '@/types/wallet';

import BlockNumberTextMobile from '@/components/Text/BlockNumberText/BlockNumberTextMobile';
import { Tooltip } from '@/components/ToolTip';
import { getSpotLink } from '@/features/spot/hooks';
import { getIsPageSupported } from '@/hooks/usePageSupported';
import { RouteBasePath } from '@/pages/routers';
import MobileFooterDrawer from './MobileFooterDrawer';
import MobileLanguageSelector from './MobileLanguageSelector';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const MobileFooter: FC<IPropTypes> = function () {
  const { t } = useTranslation();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openLanguageDrawer, setOpenLanguageDrawer] = useState(false);

  const toggleWalletModal = useToggleModal(GlobalModalType.Wallet);
  const walletStatus = useWalletConnectStatus();
  const chainId = useChainId();
  const location = useLocation();
  const isIpBlocked = useIsIpBlocked();
  return (
    <div>
      <BlockNumberTextMobile />
      <div className="syn-mobile-footer">
        <Link
          className={classNames(
            'syn-mobile-footer-item',
            location.pathname.includes(RouteBasePath.market) && 'syn-mobile-footer-item-selected',
          )}
          to={`/${RouteBasePath.market}`}>
          {t('mobile.footer.futures')}
        </Link>
        {chainId && getIsPageSupported(chainId, RouteBasePath.spot) && (
          <Link
            className={classNames(
              'syn-mobile-footer-item',
              location.pathname.includes(RouteBasePath.spot) && 'syn-mobile-footer-item-selected',
            )}
            to={getSpotLink({
              chainId,
            })}>
            {t('common.spot.spot')}
          </Link>
        )}
        <Tooltip showOnMobile={true} title={isIpBlocked ? t('common.ipBlocker.tooltip') : undefined}>
          <Link
            className={classNames(
              'syn-mobile-footer-item',
              { disabled: isIpBlocked },
              location.pathname.includes(RouteBasePath.portfolio) && 'syn-mobile-footer-item-selected',
            )}
            to={`/${RouteBasePath.portfolio}`}
            onClick={(e) => {
              if (walletStatus === WALLET_CONNECT_STATUS.UN_CONNECT) {
                e.preventDefault();
                if (isIpBlocked) {
                  return;
                }
                toggleWalletModal();
              }
              // gaEvent({ category: GaCategory.FOOTER, action: 'Menu-Click on portfolio' });
            }}>
            {t('mobile.footer.portfolio')}
          </Link>
        </Tooltip>
        <a
          onClick={() => {
            setOpenLanguageDrawer(false);
            setOpenDrawer(true);
          }}>
          {t('common.more')}
        </a>
        <MobileFooterDrawer
          chainId={chainId}
          openFooter={openDrawer}
          openLanguageDrawer={() => {
            setOpenDrawer(false);
            setOpenLanguageDrawer(true);
          }}
          onMenuClick={() => setOpenDrawer(false)}
          onClose={() => {
            setOpenDrawer(false);
          }}
        />
        <MobileLanguageSelector
          open={openLanguageDrawer}
          onLanguageSelect={() => {
            setOpenLanguageDrawer(false);
          }}
          onClose={() => {
            setOpenLanguageDrawer(false);
            setOpenDrawer(true);
          }}
        />
      </div>
    </div>
  );
};

export default MobileFooter;
