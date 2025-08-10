import classNames from 'classnames';
import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { ToastOptions } from 'react-toastify/dist/types/index';

import { ReactComponent as ShareIcon } from '@/assets/svg/icon_share_32.svg';
import { useMediaQueryDevice } from '@/components/MediaQuery';
import { CloseButton } from '@/components/Notification';
import { SecondGlobalModalType } from '@/constants';
import { mockNotiDontClose } from '@/constants/mock';
import { NO_SHOW_PNL_NOTIFICATION } from '@/constants/storage';
import { usePnlShareModal, useTheme } from '@/features/global/hooks';
import { IPnlParams } from '@/types/trade';
import { useTranslation } from 'react-i18next';
import Button from '../Button/Button';
import Checkbox from '../Checkbox';
import './index.less';
const cachedNotify: { [tx: string]: string } = {};

export const usePnlShareNotification = (): ((args: IPnlParams) => void) => {
  const { deviceType, isMobile } = useMediaQueryDevice();
  const { dataTheme } = useTheme();
  const { togglePnlShareModal } = usePnlShareModal(SecondGlobalModalType.PNL_SHARE_NOTIFICATION);
  const { t } = useTranslation();

  const openNotification = useCallback(
    (args: IPnlParams, onlyBtn = false, fromWindow = false): void => {
      const showBtnOnly = onlyBtn || !!localStorage.getItem(NO_SHOW_PNL_NOTIFICATION) || isMobile;
      const toastDom = showBtnOnly ? (
        <Button
          className="syn-pnl-notification-btn"
          onClick={() => {
            togglePnlShareModal();
          }}>
          <ShareIcon />
          {t('notification.pnl.title')}
        </Button>
      ) : (
        <div className="syn-pnl-notification-content">
          <div className="syn-pnl-notification-content-title">
            <span> {t('notification.pnl.title')}</span>
          </div>
          <div className="syn-pnl-notification-content-desc">
            <dl className="syn-pnl-notification-content-desc-row left">
              <dt>
                {args.pnlRatio.formatPercentage({
                  colorShader: true,
                })}
              </dt>
              <dd>
                {args.pnl.formatNumberWithTooltip({
                  showPositive: true,
                  isShowTBMK: true,
                  colorShader: true,
                  prefix: '(',
                  colorSuffix: true,
                  suffix: args.pair.rootInstrument.marginToken.symbol + ')',
                })}
              </dd>
            </dl>
            <div className="syn-pnl-notification-content-desc-row right">
              <Button
                type="primary"
                onClick={() => {
                  togglePnlShareModal();
                }}>
                <ShareIcon />
                {t('common.share')}
              </Button>
              <Checkbox
                className="syn-pnl-notification-content-desc-row-checkbox"
                onChange={(e) => {
                  localStorage.setItem(NO_SHOW_PNL_NOTIFICATION, e.target.checked ? 'true' : '');
                }}>
                {t('notification.pnl.hideNotification')}
              </Checkbox>
            </div>
          </div>
        </div>
      );
      const toastConfig: ToastOptions = {
        className: classNames(deviceType, dataTheme, 'syn-pnl-notification-toaster', { 'btn-only': showBtnOnly }),
        closeButton: showBtnOnly ? false : CloseButton,
        closeOnClick: false,
        bodyClassName: 'syn-pnl-notification-toaster-wrapper',
        type: 'info',
        position: 'bottom-right',
        autoClose: mockNotiDontClose ? false : showBtnOnly ? (fromWindow ? 5000 : 10000) : 5000,
        hideProgressBar: showBtnOnly,
        icon: false,
        onClose: () => {
          if (args.tx && cachedNotify[args.tx]) {
            delete cachedNotify[args.tx];
          }
          if (!showBtnOnly) {
            openNotification(args, true, true);
          }
        },
      };
      // if (cachedNotify[args.tx]) {
      //   toast.update(cachedNotify[args.tx], { ...toastConfig, render: toastDom });
      // } else {
      const id = toast(toastDom, toastConfig);
      args.tx && (cachedNotify[args.tx] = id.toString());
      // }
    },
    [isMobile, t, deviceType, dataTheme, togglePnlShareModal],
  );

  return openNotification;
};
