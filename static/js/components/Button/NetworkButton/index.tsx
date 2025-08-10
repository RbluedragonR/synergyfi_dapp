/**
 * @description Component-NetworkButton
 */
import './index.less';

import classNames from 'classnames';
import { FC, useMemo } from 'react';

import { Button } from '@/components/Button';
import { useMediaQueryDevice } from '@/components/MediaQuery';
import { NetworkButtonProps } from '@/types/button';

import { ReactComponent as LinkIcon } from './assets/icon_nav_connect_24.svg';
import { ReactComponent as NetWorkIcon } from './assets/icon_nav_switch_g.svg';

const NetworkButton: FC<NetworkButtonProps> = function ({ children, iconType, ghost = false, ...props }) {
  const { isMobile } = useMediaQueryDevice();
  const icon = useMemo(() => {
    return iconType === 'network' ? (
      <NetWorkIcon className="anticon" />
    ) : isMobile ? (
      <></>
    ) : (
      <LinkIcon className="anticon" />
    );
  }, [iconType, isMobile]);
  return (
    <Button
      {...props}
      className={`syn-network_button ${iconType === 'network' ? 'network' : ''} ${props.className}`}
      ghost={ghost}
      icon={icon}>
      <span>{children}</span>
    </Button>
  );
};

export default NetworkButton;

export const NetworkButtonBorder: FC<NetworkButtonProps> = function ({ children, iconType, ghost = false, ...props }) {
  const icon = useMemo(() => {
    return iconType === 'network' ? <NetWorkIcon className="anticon" /> : <LinkIcon className="anticon" />;
  }, [iconType]);
  return (
    <Button
      ghost={ghost}
      icon={icon}
      {...props}
      className={classNames(`syn-network_button-border ${iconType === 'network' ? 'network' : ''}`, props.className)}>
      <span>{children}</span>
    </Button>
  );
};
