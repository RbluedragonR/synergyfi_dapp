/**
 * @description Component-WithdrawModal
 */
import React, { FC } from 'react';

import { DepositModalProps } from '@/types/modal';

import DepositModal from '../../Deposit/DepositModal';

const WithdrawModal: FC<DepositModalProps> = function (props) {
  return <DepositModal {...props}></DepositModal>;
};

export default React.memo(WithdrawModal);
