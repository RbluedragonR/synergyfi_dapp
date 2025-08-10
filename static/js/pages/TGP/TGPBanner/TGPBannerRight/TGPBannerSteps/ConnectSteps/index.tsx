/**
 * @description Component-ConnectSteps
 */
import './index.less';

import classNames from 'classnames';
import React, { FC } from 'react';

import { ReactComponent as IconHandShake } from './assets/icon_handshake_32.svg';
import ConnectStepBtn from './ConnectStepBtn';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  stepNumber: string;
  isCurrent?: boolean;
  isActivated?: boolean;
  content?: React.ReactNode;
  btnName: React.ReactNode;
  rightExtra?: React.ReactNode;
  onBtnClick?: () => void;
}
const ConnectSteps: FC<IPropTypes> = function ({
  className,
  isCurrent,
  content,
  btnName,
  rightExtra,
  isActivated = false,
  onBtnClick,
}) {
  return (
    <div
      className={classNames(
        'syn-tgp-connect-steps',
        className,
        isCurrent && 'syn-tgp-connect-steps-current',
        isActivated && 'syn-tgp-connect-steps-activated',
      )}>
      <div className="syn-tgp-connect-steps-content">
        <div className="syn-tgp-connect-steps-left">
          <div className="syn-tgp-connect-steps-left-number-arrow">
            <IconHandShake />
          </div>
          <div className="syn-tgp-connect-steps-left-content">{content}</div>
        </div>
        <div className="syn-tgp-connect-steps-right">
          {rightExtra}
          <div className="syn-tgp-connect-steps-btn">
            <ConnectStepBtn
              disabled={!isActivated && !isCurrent}
              isActivated={isActivated}
              isCurrent={isCurrent}
              onClick={onBtnClick}>
              {btnName}
            </ConnectStepBtn>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectSteps;
