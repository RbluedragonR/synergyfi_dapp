/**
 * @description Component-kol
 */
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import AffiliateInvitees from '../components/AffiliateInvitees';
import DistributionHistory from '../components/DistributionHistory';
import AffiliateTop from './AffiliateTop';
import './index.less';

import { useIsUserIsAffiliate } from '@/features/referral/hooks';
import { FC, useMemo } from 'react';
import JoinAffiliate from './JoinAffiliate';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const KOLPage: FC<IPropTypes> = function ({}) {
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const isConnectWallet = useMemo(() => !!userAddr, [userAddr]);
  const isAffiliate = useIsUserIsAffiliate(chainId, userAddr);
  return (
    <div className="syn-affiliate-kol">
      {isConnectWallet && isAffiliate ? (
        <>
          <div>
            {/* <ReferralTitle /> */}
            <AffiliateTop />
          </div>
          <AffiliateInvitees />
          <DistributionHistory />
        </>
      ) : (
        <JoinAffiliate />
      )}
    </div>
  );
};

export default KOLPage;
