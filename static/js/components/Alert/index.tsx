/**
 * @description Component-tag
 */
import './index.less';

import { AlertProps, Alert as AntAlert } from 'antd';
import cls from 'classnames';
import { FC, useEffect, useMemo, useState } from 'react';

import { ReactComponent as IconErrorRed } from './assets/icon_error_red.svg';
import { ReactComponent as IconInfo } from './assets/icon_info_white.svg';
import { ReactComponent as IconWarningYellow } from './assets/icon_warning_yellow.svg';
interface IAlertProps extends AlertProps {
  // type?: 'primary';
  duration?: number;
}
const Alert: FC<IAlertProps> = function ({ className, duration, type, ...props }) {
  const [show, setShow] = useState(true);
  const icon = useMemo(() => {
    if (type === 'error') return <IconErrorRed />;
    if (type === 'warning') return <IconWarningYellow />;
    if (type === 'info') return <IconInfo />;
    return undefined;
  }, [type]);
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let timeout: any;
    if (duration) {
      timeout = setTimeout(() => {
        setShow(false);
      }, duration * 1000);
    }
    return () => timeout && clearTimeout(timeout);
  }, [duration]);
  if (!show) {
    return <></>;
  }
  return <AntAlert className={cls('syn-alert', className)} type={type} icon={icon} {...props}></AntAlert>;
};

export default Alert;
