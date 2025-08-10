import { ArgsProps, IconType } from 'antd/es/notification/interface';
import classNames from 'classnames';
import { useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { ToastOptions, TypeOptions } from 'react-toastify/dist/types/index';

import { ExplorerIcon } from '@/assets/svg';
import { useMediaQueryDevice } from '@/components/MediaQuery';
import { CloseButton } from '@/components/Notification';
import { mockNotiDontClose } from '@/constants/mock';
import { useTheme } from '@/features/global/hooks';
import { useEtherscanLink } from '@/hooks/web3/useChain';
import { checkLinkIsBlockExplorer } from '@/utils/chain';
import { ReactComponent as IconAddrLink } from './assets/icon_acct_new.svg';
interface INotificationArgs extends ArgsProps {
  type?: IconType;
  tx?: string;
  link?: string;
}

const cachedNotify: { [tx: string]: string } = {};

export const useTxNotification = (): {
  open: (args: INotificationArgs) => void;
  success: (args: INotificationArgs) => void;
  info: (args: INotificationArgs) => void;
  warning: (args: INotificationArgs) => void;
  error: (args: INotificationArgs) => void;
} => {
  const { isMobile, deviceType } = useMediaQueryDevice();
  const { dataTheme } = useTheme();
  const getEtherscanLink = useEtherscanLink();
  /**
   * Notification wrapper, add tx open func
   * @param args Notification args
   */
  const openNotification = useCallback(
    (args: INotificationArgs): void => {
      let type = 'info';
      if (args.type) {
        type = args.type;
      }
      let finalLink = args.tx && getEtherscanLink(args.tx, 'transaction');
      if (args.link) {
        finalLink = args.link;
      }
      const isBlockExplorer = checkLinkIsBlockExplorer(finalLink || '');
      let icon = finalLink ? <IconAddrLink /> : null;
      if (isBlockExplorer) {
        icon = <ExplorerIcon />;
      }
      const toastDom = (
        <div className="syn-notification-content">
          <div className="syn-notification-content-title">
            <span> {args.message}</span>
            {icon}
          </div>
          {args.description && <div className="syn-notification-content-desc">{args.description}</div>}
        </div>
      );
      const toastConfig: ToastOptions = {
        onClick: () => {
          if (type === 'error') {
            return;
          }
          window.open(finalLink);
        },
        className: classNames(deviceType, dataTheme, 'syn-notification-toaster'),
        closeButton: CloseButton,
        type: type as TypeOptions,
        position: isMobile ? 'top-right' : 'bottom-right',
        autoClose: mockNotiDontClose ? false : args.type === 'error' ? 30000 : 5000,
        onClose: () => {
          if (args.tx && cachedNotify[args.tx]) {
            delete cachedNotify[args.tx];
          }
        },
      };

      if (type === 'info') {
        const id = toast.loading(toastDom, toastConfig);
        args.tx && (cachedNotify[args.tx] = id.toString());
      } else if (args.tx && cachedNotify[args.tx]) {
        toast.update(cachedNotify[args.tx], {
          ...toastConfig,
          render: toastDom,
          isLoading: false,
          closeButton: true,
          closeOnClick: true,
        });
      } else {
        toast(toastDom, toastConfig);
      }

      // notification.open({
      //   message: args.message,
      //   description: args.description,
      //   icon: iconNode,
      //   duration: args.type === 'error' ? 30000 : args.type === 'info' ? 50000 : 50000,
      //   placement: isMobile ? 'topRight' : 'bottomRight',
      //   className: classNames(
      //     'syn-notification',
      //     `syn-notification_${args.type}`,
      //     (args.tx || args.link) && 'tx-notification',
      //   ),
      //   onClick: () => {
      //     if (args.link) {
      //       window.open(args.link);
      //     } else if (args.tx) {
      //       window.open(getEtherscanLink(args.tx, 'transaction'));
      //     }
      //   },
      // });
    },
    [deviceType, getEtherscanLink, isMobile, dataTheme],
  );

  /**
   *  add click
   */
  const txNotification = useMemo(() => {
    const res = {
      open: openNotification,
      success: openNotification,
      info: openNotification,
      warning: openNotification,
      error: openNotification,
    };

    const types: IconType[] = ['success', 'info', 'warning', 'error'];
    types.forEach((type: IconType) => {
      res[type] = (args: INotificationArgs): void =>
        res.open({
          ...args,
          type,
        });
    });
    return res;
  }, [openNotification]);

  return txNotification;
};
