import './index.less';

import { CloseButtonProps } from 'react-toastify';

import BigLoading from '../Loading/BigLoading';
import { ReactComponent as IconClose } from './assets/icon_close.svg';
// import { ReactComponent as IconNotificationLoading } from './assets/icon_loading.svg';
import { ReactComponent as IconNotificationInfo } from './assets/icon_notification_info.svg';
import { ReactComponent as IconNotificationSuccess } from './assets/icon_notification_success.svg';
import { ReactComponent as IconNotificationError } from './assets/icon_notification_warning.svg';

export const CloseButton = ({ closeToast }: CloseButtonProps): JSX.Element => {
  return (
    <IconClose
      width={16}
      className="Toastify__close-button"
      onClick={(e) => {
        e.stopPropagation();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        closeToast(e as any);
      }}></IconClose>
  );
};

export const IconLoading = (): JSX.Element => {
  return (
    <span className="syn-loading-icon">
      <BigLoading />
    </span>
  );
};

export { IconClose, IconNotificationError, IconNotificationInfo, IconNotificationSuccess };
