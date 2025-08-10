import './index.less';

import { Modal as AntDModal } from 'antd';
import classnames from 'classnames';
import { useEffect, useState } from 'react';

import { ReactComponent as IconClose } from '@/components/CardWrapper/assets/icon_close.svg';
import { IModalProps } from '@/types/modal';

/**
 *  antd modal wrap
 * @param param0 antd modal props
 * @returns
 */
export default function Modal({ className, title, closable = true, ...props }: IModalProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(props.open);
  useEffect(() => setIsOpen(props.open), [props.open]);
  function onClickCancelHandler(): void {
    setIsOpen(false);
  }
  if (!props.open) {
    return <></>;
  }
  return (
    <AntDModal
      centered
      width={600}
      footer={null}
      destroyOnClose
      closable={false}
      {...props}
      className={classnames('syn-modal', className)}
      open={isOpen}
      onOk={(): void => {
        props.onOk && props.onOk();
        onClickCancelHandler();
      }}
      onCancel={onClickCancelHandler}
      afterClose={(): void => {
        props.onCancel && props.onCancel();
      }}>
      {title && (
        <div className="syn-modal-header">
          <div className="syn-modal-header-title">
            {title}
            {closable && (
              <div className="syn-modal-close" onClick={onClickCancelHandler}>
                <IconClose></IconClose>
              </div>
            )}
          </div>
          {props.extraHeader}
        </div>
      )}
      {props.children}
    </AntDModal>
  );
}
