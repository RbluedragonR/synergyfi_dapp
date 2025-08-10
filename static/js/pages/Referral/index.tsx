/**
 * @description Component-affiliates
 */
import Tabs from '@/components/Tabs';
import './index.less';

import { AFFILIATE_TYPE } from '@/constants/affiliates';
import { REFERRAL_FEE_REBATE_PERCENTAGE } from '@/constants/referral';
import { useReferralStore } from '@/features/referral/store';
import { useQueryParam } from '@/hooks';
import usePageSupported from '@/hooks/usePageSupported';
import { useChainId, useChainShortName, useUserAddr } from '@/hooks/web3/useChain';
import {
  getAffiliateOverviewQueryKey,
  getReferralClaimableTokensFromChainQueryKey,
  getTraderOverviewQueryKey,
} from '@/utils/referral';
import { FC, useEffect, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { queryClient } from '../App';
import { RouteBasePath } from '../routers';
import KOLPage from './Affiliates';
import Trader from './Trader';
import { ReactComponent as ShakeHandsIcon } from './assets/ri_shake-hands-fill.svg';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const ReferralPage: FC<IPropTypes> = function ({}) {
  const { t } = useTranslation();
  const { affiliateType } = useParams();
  const navigate = useNavigate();
  const { setReferralCode } = useReferralStore();
  const chainName = useChainShortName();
  const referralCode = useQueryParam('referralCode');
  usePageSupported({ page: RouteBasePath.referral });
  const chainId = useChainId();
  const address = useUserAddr();
  const tabList = useMemo(
    () => [
      {
        label: t('affiliates.affiliates'),
        key: AFFILIATE_TYPE.AFFILIATES,
      },
      {
        label: t('affiliates.trader'),
        key: AFFILIATE_TYPE.TRADER,
      },
    ],
    [t],
  );
  useEffect(() => {
    if (!affiliateType) {
      navigate(`/referral/${chainName}/${AFFILIATE_TYPE.AFFILIATES}`);
    }
  }, [affiliateType, chainName, navigate]);
  useEffect(() => {
    if (referralCode) {
      setReferralCode(referralCode);
      navigate(`/referral/${chainName}/${AFFILIATE_TYPE.TRADER}`, { replace: true });
    }
  }, [chainName, navigate, referralCode, setReferralCode]);
  return (
    <div className="syn-referral">
      <div className="syn-referral-header">
        <div className="syn-referral-header-top">
          <ShakeHandsIcon />
          {t(affiliateType === AFFILIATE_TYPE.TRADER ? 'affiliates.titleTrader' : 'affiliates.title')}
        </div>
        <div className="syn-referral-header-bottom">
          <Trans
            i18nKey={affiliateType === AFFILIATE_TYPE.TRADER ? 'affiliates.subtitleTrader' : 'affiliates.subtitle'}
            components={{ b: <b /> }}
            values={{ percent: REFERRAL_FEE_REBATE_PERCENTAGE }}
          />
        </div>
      </div>
      <Tabs
        value={affiliateType || AFFILIATE_TYPE.TRADER}
        tabList={tabList}
        className="syn-referral-tabs"
        onClick={(key: string) => {
          navigate(`/referral/${chainName}/${key}`);
          queryClient.invalidateQueries({
            queryKey:
              key === AFFILIATE_TYPE.TRADER
                ? getTraderOverviewQueryKey(chainId, address)
                : getAffiliateOverviewQueryKey(chainId, address),
          });
          queryClient.invalidateQueries({
            queryKey: getReferralClaimableTokensFromChainQueryKey(key as AFFILIATE_TYPE, chainId, address),
          });
        }}
      />
      <div className="syn-referral-content">
        {affiliateType === AFFILIATE_TYPE.TRADER && <Trader />}
        {affiliateType === AFFILIATE_TYPE.AFFILIATES && <KOLPage />}
      </div>
    </div>
  );
};

export default ReferralPage;
