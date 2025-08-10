/**
 * @description Component-AffiliateTop
 */
import AffiliateEarning from '../../components/AffiliateEarning';
import AffiliateReferralCode from './AffiliateReferralCode';
import './index.less';
import Overview from './Overview';

import { FC } from 'react';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const AffiliateTop: FC<IPropTypes> = function ({}) {
  return (
    <div className="syn-affiliate-top">
      <div className="syn-affiliate-top-left">
        <Overview />
        <AffiliateReferralCode />
      </div>
      <AffiliateEarning />
    </div>
  );
};

export default AffiliateTop;
