/**
 * @description Component-Button
 */
import './index.less';

import classnames from 'classnames';
import { FC, useMemo } from 'react';

import { useMediaQueryDevice } from '@/components/MediaQuery';
import { IButtonProps, IButtonType } from '@/types/button';

import { DAPP_CHAIN_CONFIGS } from '@/constants/chain';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { LoadingIcon } from './elements';

type PropMapTypes = {
  [propName in IButtonType]: string;
};

const Button: FC<IButtonProps> = function ({
  className,
  size,
  children,
  icon,
  ghost,
  style,
  chainIconProps,
  disabled,
  isBlocked,
  suffixNode,
  ingoreMobile = false,
  ...props
}) {
  const { deviceType } = useMediaQueryDevice();
  const { t } = useTranslation();
  const btnClassName = useMemo(() => {
    if (props.type === undefined) return 'syn-btn-default';
    const typeMap: PropMapTypes = {
      primary: 'primary',
      link: 'link',
      dashed: 'radio',
      text: 'text',
      default: 'default',
      outline: 'outline',
    };
    return `syn-btn-${typeMap[props.type] || props.type}`;
  }, [props.type]);

  const iconNode = useMemo(() => {
    if (props.loading) {
      return (
        <span style={{ marginRight: 8 }} className="syn-btn-loading-icon syn-btn-icon">
          <LoadingIcon />
        </span>
      );
    }
    if (chainIconProps) {
      return (
        <span style={{ marginRight: chainIconProps.marginRight || 8 }} className="syn-btn-icon">
          <img
            style={{
              width: chainIconProps.width,
              height: chainIconProps.width,
            }}
            src={DAPP_CHAIN_CONFIGS[chainIconProps.chainId].network.icon}
          />
        </span>
      );
    }
    if (!icon) {
      return null;
    }
    return <span className="syn-btn-icon">{icon}</span>;
  }, [chainIconProps, icon, props.loading]);

  const suffix = useMemo(() => {
    if (props.loading || !suffixNode) {
      return null;
    }
    return <span className="syn-btn-suffix">{suffixNode}</span>;
  }, [suffixNode, props.loading]);
  return (
    <button
      style={{
        width: props.block ? '100%' : 'inheritance',
        ...style,
      }}
      data-testid="syn-btn"
      className={classnames('syn-btn', btnClassName, className, ingoreMobile ? '' : deviceType, {
        'syn-btn-sm': size === 'small',
        'syn-btn-loading': props.loading,
        'syn-btn-background-ghost': ghost,
      })}
      disabled={disabled || isBlocked}
      {..._.omit(props, ['block', 'loading'])}
      onClick={(e) => {
        props.href && window.open(props.href, props.target);
        if (props.loading) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        props.onClick && props.onClick(e as any);
      }}
      type={'button'}>
      {isBlocked ? (
        t('common.blocked')
      ) : (
        <>
          {iconNode}
          {children}
          {suffix}
        </>
      )}
    </button>
  );
};

export default Button;
