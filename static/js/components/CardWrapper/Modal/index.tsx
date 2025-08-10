/**
 * @description Component-CardModalWrapper
 */
import './index.less';

import { Modal } from 'antd';
import { FC, useMemo } from 'react';

import { ICardWrapperProps } from '@/types/card';
import { ICardWrapperModalPropTypes } from '@/types/modal';

import CardWrapper from '../Card';

const CardModalWrapper: FC<ICardWrapperModalPropTypes> = function ({ cardProps, onClose, children, ...props }) {
  const cardDefaultProps: ICardWrapperProps = useMemo(() => {
    return {
      mode: 'modal',
      tabList: [],
      ...cardProps,
    };
  }, [cardProps]);
  return (
    <Modal
      width={424}
      closable={false}
      className={`card_wrapper_modal ${props.className || ''}`}
      footer={null}
      {...props}>
      <CardWrapper {...cardDefaultProps} clickClose={() => onClose && onClose()}>
        {children}
      </CardWrapper>
    </Modal>
  );
};

export default CardModalWrapper;
