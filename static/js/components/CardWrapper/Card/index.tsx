/**
 * @description Component-CardWrapper
 */
import './index.less';

import { Card } from 'antd';
import cls from 'classnames';
import { FC, useCallback, useMemo } from 'react';

import { Button } from '@/components/Button';
// import WrapNativeTokenBtn from '@/components/WrapNativeTokenBtn';
import { ICardWrapperProps } from '@/types/card';

import { ReactComponent as RefreshIcon } from '@/assets/svg/icon_refresh_linear_new.svg';
import { useResetTempGlobalConfig } from '@/features/global/hooks';
import { useChainId } from '@/hooks/web3/useChain';
import _ from 'lodash';
import Fallback from '../Fallback';
import { ReactComponent as CloseIcon } from '../assets/icon_close.svg';
import { ReactComponent as SettingsIcon } from '../assets/icon_setting_linear.svg';

const CardWrapper: FC<ICardWrapperProps> = function ({
  className,
  children,
  showSubCard = false,
  subCardSlot,
  tabList,
  footerClassName,
  alert,
  footer,
  tabKey,
  subCardTitle,
  mode,
  clickClose,
  showSettingsIcon = true,
  showCloseIcon = true,
  mobileMode,
  title,
  // slotHeight = 217,
  onFallbackClick,
  onRefreshIonClick,
  showFooter = true,
  titleRight,
  //isWrappedNative,
  extraHeader,
  ...props
}) {
  const chainId = useChainId();
  const resetTempConfig = useResetTempGlobalConfig(chainId);
  const onfallbackClick = useCallback(
    (fallback: boolean) => {
      onFallbackClick && onFallbackClick(fallback);
      resetTempConfig();
    },
    [onFallbackClick, resetTempConfig],
  );
  const onRefreshClick = useCallback(() => {
    onRefreshIonClick && onRefreshIonClick();
  }, [onRefreshIonClick]);
  const onCloseSettings = useCallback(() => {
    clickClose && clickClose();
  }, [clickClose]);

  const renderFooter = useMemo(() => {
    if (!footer) return undefined;
    return (
      <div className={cls('syn-card_wrapper-footer-wrap', footerClassName)}>
        {alert && <div className="syn-card_wrapper-alert">{alert}</div>}
        <div className={cls('syn-card_wrapper-footer', footerClassName)}>
          {mobileMode && showSettingsIcon && (
            <Button
              ghost
              className="syn-card_wrapper-footer-mobile-settings"
              onClick={() => {
                onfallbackClick(true);
              }}>
              <SettingsIcon className="syn-card_wrapper-extra_icon" />
            </Button>
          )}
          {footer}
        </div>
      </div>
    );
  }, [alert, footer, footerClassName, mobileMode, onfallbackClick, showSettingsIcon]);

  const handleFallbackProps = useMemo(() => {
    const modeProps =
      mode === 'modal'
        ? {
            // tabList,
            title: (
              <>
                <div>{title}</div>
                <section className="ant-card-head-title-icon">
                  {titleRight ? (
                    <div
                      className="syn-card_wrapper-title-right"
                      onClick={() => {
                        onfallbackClick(true);
                      }}>
                      {titleRight.node}
                    </div>
                  ) : (
                    <>
                      {showSettingsIcon && (
                        <>
                          {props.showRefreshIcon && (
                            <span
                              className="syn-card_wrapper_icon-wrapper"
                              onClick={() => {
                                onRefreshClick();
                              }}>
                              <RefreshIcon className="syn-card_wrapper-extra_icon" />
                            </span>
                          )}
                          <span
                            className="syn-card_wrapper_icon-wrapper"
                            onClick={() => {
                              onfallbackClick(true);
                            }}>
                            <SettingsIcon className="syn-card_wrapper-extra_icon" />
                          </span>
                        </>
                      )}
                      {showCloseIcon && (
                        <span className="syn-card_wrapper_icon-wrapper" onClick={onCloseSettings}>
                          <CloseIcon className="syn-card_wrapper-slide-slot-switch" />
                        </span>
                      )}
                    </>
                  )}
                </section>
              </>
            ),
          }
        : { tabList, activeTabKey: tabKey };
    const defaultProps = {
      ...modeProps,
      tabBarExtraContent: (
        <>
          {/* {isWrappedNative && <WrapNativeTokenBtn />} */}
          {showSettingsIcon && (
            <span
              className="syn-card_wrapper_icon-wrapper"
              onClick={() => {
                onfallbackClick(true);
              }}>
              <SettingsIcon className="syn-card_wrapper-extra_icon" />
            </span>
          )}
          {mode === 'modal' && (
            <span className="syn-card_wrapper_icon-wrapper" onClick={onCloseSettings}>
              <CloseIcon className="syn-card_wrapper-slide-slot-switch" />
            </span>
          )}
        </>
      ),
    };
    const fallbackProps = {
      title: (
        <>
          <span>{subCardTitle}</span>
          <span className="syn-card_wrapper_icon-wrapper" onClick={() => onfallbackClick(false)}>
            <CloseIcon className="syn-card_wrapper-slide-slot-switch" />
          </span>
          {/* {mode === 'modal' ? <CloseIcon onClick={() => clickClose && clickClose()} /> : <div></div>} */}
        </>
      ),
    };
    return !showSubCard ? defaultProps : fallbackProps;
  }, [
    mode,
    title,
    titleRight,
    showSettingsIcon,
    props.showRefreshIcon,
    showCloseIcon,
    onCloseSettings,
    tabList,
    tabKey,
    subCardTitle,
    showSubCard,
    onfallbackClick,
    onRefreshClick,
  ]);

  return (
    <div
      className={cls(
        'syn-card_wrapper',
        extraHeader && 'syn-card_wrapper_have_extra_header',
        showSubCard && 'syn-card_wrapper_sub-card',
        className,
        mobileMode && 'mobile',
      )}>
      {extraHeader && <div className="syn-card_wrapper_extra_header">{extraHeader}</div>}
      <Card
        {...handleFallbackProps}
        {..._.omit(props, ['showSliderBar', 'isWrappedNative', 'showRefreshIcon', 'isSpot'])}>
        {!showSubCard && (
          <>
            <section className="syn-card_wrapper-content">{children}</section>
            {showFooter && renderFooter && (
              <section className="syn-card_wrapper-footerSlidebar">{renderFooter}</section>
            )}
          </>
        )}
        <Fallback isMobile={mobileMode} show={showSubCard}>
          {subCardSlot}
        </Fallback>
      </Card>
    </div>
  );
};

export default CardWrapper;
