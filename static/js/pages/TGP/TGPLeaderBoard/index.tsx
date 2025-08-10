/**
 * @description Component-TGPLeaderBoard
 */
import './index.less';

import React, { FC } from 'react';

import TGPLeaderBoardHeader from './TGPLeaderBoardHeader';
import TGPLeaderBoardTable from './TGPLeaderBoardTable';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const TGPLeaderBoard: FC<IPropTypes> = function ({}) {
  return (
    <div className="syn-t-gPLeader-board">
      <TGPLeaderBoardHeader />
      <div className="syn-t-gPLeader-board-divider" />
      <TGPLeaderBoardTable />
    </div>
  );
};

export default TGPLeaderBoard;
