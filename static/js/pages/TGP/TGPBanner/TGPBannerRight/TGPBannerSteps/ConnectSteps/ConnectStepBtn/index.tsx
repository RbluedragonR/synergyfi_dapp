/**
 * @description Component-ConnectStepBtn
 */
import './index.less';

import classNames from 'classnames';
import React, { FC } from 'react';

import { ReactComponent as ImgBtnSmallOff } from './assets/btn_small_off.svg';
import { ReactComponent as ImgIconCheck_32 } from './assets/icon_check_32.svg';
// import { ReactComponent as ImgBtnSmallOn } from './assets/btn_small_on.svg';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isActivated?: boolean;
  isCurrent?: boolean;
  disabled?: boolean;
}
const ConnectStepBtn: FC<IPropTypes> = function ({ className, children, onClick, isActivated, isCurrent, disabled }) {
  return (
    <button
      disabled={disabled}
      className={classNames(
        'tgp-connect-step-btn',
        className,
        isCurrent && 'tgp-connect-step-btn-current',
        isActivated && 'tgp-connect-step-btn-activated',
      )}
      onClick={onClick}>
      <div className="tgp-connect-step-btn-bg">{isActivated ? <ImgIconCheck_32 /> : <ImgBtnSmallOff />}</div>
      {!isActivated && <span>{children}</span>}
    </button>
  );
};

export default ConnectStepBtn;
