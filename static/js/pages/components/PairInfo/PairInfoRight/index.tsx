/**
 * @description Component-PairInfoRight
 */
import './index.less';

import React, { FC } from 'react';

import { PAIR_PAGE_TYPE } from '@/constants/global';
import { WrappedPair } from '@/entities/WrappedPair';

import PairInfoCollapse from './PairInfoCollapse';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  currentPair?: WrappedPair | undefined;
  type: PAIR_PAGE_TYPE;
}

const PairInfoRight: FC<IPropTypes> = function ({ currentPair, type }) {
  return (
    <div className="syn-pair-info-right">
      <PairInfoCollapse currentPair={currentPair} type={type} />
      {/* <div className="syn-pair-info-right-btns"> */}
      {/* // TODO(vault) */}
      {/* <ToVaultButton /> */}
      {/* {currentPair?.symbol && (
        <GoToEarnTradeButton isTrade={pairPageType === PAIR_PAGE_TYPE.TRADE} pairSymbol={currentPair.symbol} />
      )} */}
      {/* </div> */}
    </div>
  );
};

export default PairInfoRight;
