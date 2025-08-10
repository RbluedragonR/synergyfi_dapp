/**
 * @description Component-TraderDetail
 */
import './index.less';

import { FC } from 'react';
import AffiliateEarning from '../../components/AffiliateEarning';
import RebateDistributionHistory from './RebateDistributionHistory';
import TraderDetailOverview from './TraderDetailOverview';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const TraderDetail: FC<IPropTypes> = function ({}) {
  return (
    <div className="syn-trader-detail">
      <div>
        {/* <ReferralTitle /> */}
        <div className="syn-trader-detail-top">
          <TraderDetailOverview />
          <AffiliateEarning />
        </div>
      </div>
      <RebateDistributionHistory />
    </div>
  );
};

export default TraderDetail;
