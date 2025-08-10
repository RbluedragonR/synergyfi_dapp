/**
 * @description Component-SubPage
 */
import { useSize } from 'ahooks';
import classNames from 'classnames';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';

import { useTheme } from '@/features/global/hooks';

import { ReactComponent as IconTopbarBack } from './assets/icon_topbar_back.svg';
import './index.less';
interface IPropTypes {
  isShowSubPage: boolean;
  onClose: () => void;
  headerTitle?: React.ReactNode;
  headerInfo?: React.ReactNode;
  footer?: React.ReactNode;
  header?: React.ReactNode; // override header
  children?: React.ReactNode;
  isTrade?: boolean;
  destroyOnClose?: boolean;
  className?: string;
  noFooterPadding?: boolean;
  isOverflowAuto?: boolean;
}

const SubPage: FC<IPropTypes> = function ({
  isShowSubPage,
  onClose,
  children,
  headerTitle,
  headerInfo,
  header,
  footer,
  isTrade,
  className,
  noFooterPadding,
  isOverflowAuto,
}) {
  const [sideBarAnimate, setSideBarAnimate] = useState(false);
  const footerRef = useRef(null);
  const size = useSize(footerRef);
  const { dataTheme } = useTheme();
  useEffect(() => {
    setSideBarAnimate(isShowSubPage);
  }, [isShowSubPage]);
  const onCloseSubPage = useCallback(() => {
    setSideBarAnimate(false);
    setTimeout(() => {
      onClose();
    }, 1000);
  }, [onClose]);
  return (
    <div className={classNames('syn-sub-page', className, dataTheme, sideBarAnimate ? 'show' : '')}>
      <header className={classNames('syn-sub-page-header', isTrade ? 'isTrade' : '')}>
        {header ? (
          header
        ) : (
          <>
            <a className="syn-sub-page-header__back" onClick={onCloseSubPage}>
              <IconTopbarBack />
            </a>
            <span className="syn-sub-page-header__title">{headerTitle}</span>
            <div className="syn-sub-page-header__info">{headerInfo}</div>
          </>
        )}
      </header>
      <main
        className={`syn-sub-page-main syn-scrollbar`}
        style={{
          marginBottom: noFooterPadding ? 0 : size?.height || 0,
          overflow: isOverflowAuto ? 'auto' : 'hidden',
        }}>
        {children}
      </main>
      {footer && (
        <footer ref={footerRef} className="syn-sub-page-footer">
          {footer}
        </footer>
      )}
    </div>
  );
};

const SubPageWrap: FC<IPropTypes> = function ({ isShowSubPage, destroyOnClose, ...props }) {
  if (!isShowSubPage && destroyOnClose) return null;
  return <SubPage {...props} isShowSubPage={isShowSubPage}></SubPage>;
};

export default SubPageWrap;
