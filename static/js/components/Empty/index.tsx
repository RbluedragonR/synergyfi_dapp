import './empty.less';

import cls from 'classnames';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { GlobalModalType, THEME_ENUM } from '@/constants';
import { useIsIpBlocked, useTheme, useToggleModal } from '@/features/global/hooks';
import { useWalletConnectStatus } from '@/features/wallet/hook';
import { WALLET_CONNECT_STATUS } from '@/types/wallet';

import { NoRecordIcon } from '@/assets/svg';
import { Tooltip } from '../ToolTip';
import { ReactComponent as NoConnectIcon } from './assets/icon_link_48.svg';
import { ReactComponent as NoConnectIconD } from './assets/icon_no_link_dark.svg';
import { ReactComponent as NoRecordIconD } from './assets/no_record_d.svg';

export default function Empty({
  className = '',
  title,
  desc,
  icon,
  type = 'horizontal',
  extra,
  isOpenLinkInNewTab = false,
  link,
  showUnconnected = true,
  onLinkClick,
  showTitle = true,
  noRecordIconColor,
}: {
  className?: string;
  title?: React.ReactNode;
  desc?: React.ReactNode;
  icon?: React.ReactNode | 'no-record' | 'no-connect';
  type?: 'horizontal' | 'vertical';
  extra?: React.ReactNode;
  link?: string;
  showTitle?: boolean;
  showUnconnected?: boolean;
  onLinkClick?: () => void;
  isOpenLinkInNewTab?: boolean;
  noRecordIconColor?: { color1: string; color2: string };
}): JSX.Element {
  const connectionStatus = useWalletConnectStatus();
  const toggleWalletModal = useToggleModal(GlobalModalType.Wallet);
  const { dataTheme } = useTheme();
  const isIpBlocked = useIsIpBlocked();
  const isUnConnect = useMemo(() => {
    return connectionStatus === WALLET_CONNECT_STATUS.UN_CONNECT;
  }, [connectionStatus]);

  const { t } = useTranslation();
  title = title || t('common.empty.defaultTile');
  const linkTarget = useMemo(() => {
    if (isOpenLinkInNewTab) {
      return { target: '_blank', rel: 'noreferrer noopener' };
    }
    return {};
  }, [isOpenLinkInNewTab]);

  const iconDom = useMemo(() => {
    if (isUnConnect && showUnconnected) return dataTheme === THEME_ENUM.DARK ? <NoConnectIconD /> : <NoConnectIcon />;
    if (icon) {
      if (typeof icon === 'string') {
        switch (icon) {
          case 'no-record':
            return dataTheme === THEME_ENUM.DARK ? <NoRecordIconD /> : <NoRecordIcon />;
            break;
          case 'no-connect':
            return dataTheme === THEME_ENUM.DARK ? (
              <NoConnectIconD width={48} height={48} />
            ) : (
              <NoConnectIcon width={48} height={48} />
            );
            break;
          default:
            break;
        }
      } else {
        return icon;
      }
    }
    return dataTheme === THEME_ENUM.DARK ? <NoRecordIconD /> : <NoRecordIcon {...noRecordIconColor} />;
  }, [isUnConnect, showUnconnected, dataTheme, icon, noRecordIconColor]);

  if (isUnConnect && showUnconnected) {
    desc = t('common.empty.ConnectWallet');
  }

  const descDom = useMemo(() => {
    if (isUnConnect && showUnconnected) {
      return (
        <section>
          <Tooltip showOnMobile={true} title={isIpBlocked ? t('common.ipBlocker.tooltip') : undefined}>
            <a
              className={isIpBlocked ? 'disabled' : ''}
              onClick={() => {
                !isIpBlocked && toggleWalletModal(true);
              }}>
              {t('common.empty.ConnectWallet')}
            </a>
          </Tooltip>
        </section>
      );
    }
    if (!isUnConnect) {
      return (
        desc && (
          <section>
            {link ? (
              <a onClick={() => onLinkClick && onLinkClick()} href={link} {...linkTarget}>
                {desc}
              </a>
            ) : (
              desc
            )}
          </section>
        )
      );
    }
    return <></>;
  }, [desc, isUnConnect, isIpBlocked, link, linkTarget, onLinkClick, showUnconnected, t, toggleWalletModal]);

  return (
    <div
      className={cls('empty-wrap', className, {
        ['empty-wrap-horizontal']: type === 'horizontal',
      })}>
      <div className="empty-wrap-icon">{iconDom}</div>
      <div className="empty-wrap-text">
        {showTitle && <h2>{title}</h2>}
        {descDom}
        {extra}
      </div>
    </div>
  );
}
