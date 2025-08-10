/**
 * @description Component-PoolCreatorForm
 */
import { CHAIN_ID } from '@derivation-tech/context';
import classNames from 'classnames';
import { FC, memo, useCallback } from 'react';

import Modal from '@/components/Modal';
import { LIQUIDITY_FORM_TYPE, PAIR_PAGE_TYPE } from '@/constants/global';
import { WrappedPosition } from '@/entities/WrappedPosition';
import { useSideNavigate } from '@/hooks/useRouterNavigate';
import { CreativePair } from '@/types/pair';
import './index.less';

import CreativePairSearch from './CreativePairSearch';

interface IPropTypes {
  visible: boolean;
  onClose: () => void;
  position?: WrappedPosition;
  title: string;
  type: LIQUIDITY_FORM_TYPE;
  chainId: CHAIN_ID | undefined;
}
const LiquidityFormModal: FC<IPropTypes> = function ({ visible, onClose, title, chainId }) {
  const { pairPageNavigate } = useSideNavigate(chainId);
  const itemSelected = useCallback(
    (pair: CreativePair) => {
      pairPageNavigate(pair?.symbol || '', PAIR_PAGE_TYPE.EARN, pair.chainId);
    },
    [pairPageNavigate],
  );
  return (
    <>
      {visible && (
        <Modal
          open={visible}
          title={title}
          className={classNames('syn-liquidity-form-modal__modal')}
          width={424}
          onCancel={onClose}
          footer={null}
          onOk={onClose}>
          <CreativePairSearch onSelected={itemSelected} />
        </Modal>
      )}
    </>
  );
};

export default memo(LiquidityFormModal);
