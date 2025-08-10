/**
 * @description Component-EarnCard
 */
import './index.less';

import { FC } from 'react';

import BuildOnNetworkCard from '@/pages/components/BuildOnNetworkCard';
import EarnForm from './EarnForm';
interface IPropTypes {
  className?: string;
}
const EarnCard: FC<IPropTypes> = function () {
  return (
    <div className="syn-earn-card">
      <EarnForm />
      <BuildOnNetworkCard />
      {/* <OdysseyRewardsCard /> */}
    </div>
  );
};

export default EarnCard;
