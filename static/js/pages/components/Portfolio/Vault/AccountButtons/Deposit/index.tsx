/**
 * @description Component-Deposit
 */
import React, { FC, useState } from 'react';

import { BALANCE_TYPE } from '@/constants';
import { WrappedQuote } from '@/entities/WrappedQuote';
import { setGateAccountState } from '@/features/balance/actions';
import { useAppDispatch } from '@/hooks';
import { useChainId } from '@/hooks/web3/useChain';
import { getDefaultITradeAccountState } from '@/types/balance';
import { IButtonProps } from '@/types/button';
import { GaCategory } from '@/utils/analytics';

import DepositButton from './DepositButton';
import DepositModal from './DepositModal';

// import { useIsOnWhiteList } from '@/hooks/useWhitelist';
// import { useToggleModal } from '@/features/global/hooks';
// import './index.less'
interface IPropTypes {
  quote: WrappedQuote | undefined;
  btnProps?: IButtonProps;
  gaCategory?: GaCategory;
  gaAction?: string;
}
const AccountDeposit: FC<IPropTypes> = function ({ quote, btnProps }) {
  const chainId = useChainId();
  const dispatch = useAppDispatch();
  const [visible, setVisible] = useState(false);
  // const isOnWhiteList = useIsOnWhiteList(userAddr);
  // const toggleSignUpModal = useToggleModal(GlobalModalType.SignUp);

  return (
    <div className="syn-account-deposit">
      <DepositButton
        {...btnProps}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onClick={(event: any) => {
          // if (!isOnWhiteList) {
          //   toggleSignUpModal();
          //   return;
          // }
          setVisible(true);
          chainId &&
            dispatch(
              setGateAccountState({
                chainId,
                ...getDefaultITradeAccountState(),
              }),
            );
          btnProps?.onClick && btnProps?.onClick(event);
        }}
      />
      <DepositModal
        type={BALANCE_TYPE.DEPOSIT}
        open={visible}
        onCloseModal={() => {
          setVisible(false);
        }}
        quote={quote}
      />
    </div>
  );
};

export default React.memo(AccountDeposit);
