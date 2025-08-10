/**
 * @description Component-TGPModal
 */
import './index.less';

import classNames from 'classnames';
import React, { FC } from 'react';

import Modal from '@/components/Modal';
import { ReactComponent as CloseIcon } from '@/pages/Odyssey/assets/svg/icon_close_32.svg';

import { ReactComponent as DecorLeft } from './assets/popup_decor_left.svg';
import { ReactComponent as DecorRight } from './assets/popup_decor_right.svg';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  open: boolean;
  onCancel: () => void;
  title: React.ReactNode;
  desc?: React.ReactNode;
  centerTitle: string;
  centerNum: string;
}
const TGPModal: FC<IPropTypes> = function ({
  open,
  onCancel,
  title,
  children,
  className,
  desc,
  centerTitle,
  centerNum,
}) {
  return (
    <Modal
      title={false}
      closable={false}
      centered
      width={640}
      open={open}
      onCancel={() => onCancel()}
      className={classNames('syn-tgp-modal', className)}>
      <div className="syn-tgp-modal-wrap">
        <div className="syn-tgp-modal-header">
          <div className="syn-tgp-modal-header-left">{title}</div>
          <CloseIcon className="close" onClick={() => onCancel()} />
        </div>
        {desc && <div className="syn-tgp-modal-desc">{desc}</div>}
        <div className="syn-tgp-modal-center">
          <div className="syn-tgp-modal-center-left">
            <DecorLeft />
          </div>
          <div className="syn-tgp-modal-center-content">
            <h2 className="syn-tgp-modal-center-title">{centerTitle}</h2>
            <h2 className="syn-tgp-modal-center-num">{centerNum}</h2>
          </div>
          <div className="syn-tgp-modal-center-right">
            <DecorRight />
          </div>
        </div>
        <div className="syn-tgp-modal-bottom">{children}</div>
      </div>
    </Modal>
  );
};

export default TGPModal;
