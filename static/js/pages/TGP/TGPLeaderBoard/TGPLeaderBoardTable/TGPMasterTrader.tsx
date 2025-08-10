/**
 * @description Component-TGPMasteTrader
 */
import './index.less';

import { FC } from 'react';

import { EmptyDataWrap } from '@/components/EmptyDataWrap';
import { ITGPDashboardMasterRanking } from '@/types/tgp';

import Ellipsis from '../../components/Ellipsis';
import RankProfileImg from '../../components/RankProfileImg';
interface IPropTypes {
  ranking: ITGPDashboardMasterRanking;
  className?: string;
  realRank: number;
}
const TGPMasterTrader: FC<IPropTypes> = function ({ ranking, realRank }) {
  return (
    <div className="syn-t-gPLeader-board-table-body-row-item trader">
      <div className="trader-profile">
        <RankProfileImg userId={ranking.userId} realRank={realRank} imgUrl={ranking.profileImgUrl} />
        <div className="name">
          <Ellipsis tooltip length={108}>
            {ranking.twitterUsername || ranking.username || ranking.userId}
          </Ellipsis>
        </div>
      </div>
      <b className="total-score">
        <EmptyDataWrap isLoading={!ranking.totalScores}>{ranking.totalScores}</EmptyDataWrap>
      </b>
    </div>
  );
};

export default TGPMasterTrader;
