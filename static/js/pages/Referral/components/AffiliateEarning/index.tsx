/**
 * @description Component-AffiliateEarning
 */
import { AFFILIATE_TYPE } from '@/constants/affiliates';
import EarningDetail from './EarningDetail';
import './index.less';

import { Button } from '@/components/Button';
import { EmptyDataWrap } from '@/components/EmptyDataWrap';
import { ExternalLink } from '@/components/Link';
import UnderlineToolTip from '@/components/ToolTip/UnderlineToolTip';
import { THEME_ENUM } from '@/constants';
import { REFERRAL_RULES_LINK } from '@/constants/referral';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useTheme } from '@/features/global/hooks';
import {
  useReferralClaim,
  useReferralClaimableQuoteBalanceList,
  useReferralPendingQuoteBalanceList,
} from '@/features/referral/hooks';
import { useAffiliateOverview, useTraderOverview } from '@/features/referral/query';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { ReactComponent as ClaimIcon } from '@/pages/Referral/assets/icon_affiliates_volume.svg';
import { ReactComponent as ClaimIconD } from '@/pages/Referral/assets/icon_affiliates_volume_d.svg';
import { ReactComponent as WeeklyIcon } from '@/pages/Referral/assets/icon_affiliates_weekly.svg';
import { ReactComponent as WeeklyIconD } from '@/pages/Referral/assets/icon_affiliates_weekly_d.svg';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const AffiliateEarning: FC<IPropTypes> = function () {
  const { affiliateType } = useParams();
  const theme = useTheme();
  const userAddr = useUserAddr();
  const chainId = useChainId();
  const { t } = useTranslation();
  const { claim, isSending } = useReferralClaim(affiliateType as AFFILIATE_TYPE, userAddr);
  const { data: traderOverview, isLoading: isLoadingTraderOverview } = useTraderOverview(chainId, userAddr);
  const { data: affiliateOverview, isLoading: isLoadingAffiliateOverview } = useAffiliateOverview(chainId, userAddr);

  const { affiliatePendingCommissionList, traderPendingRebatesList } = useReferralPendingQuoteBalanceList(
    chainId,
    userAddr,
  );

  const { claimableList, isLoading } = useReferralClaimableQuoteBalanceList(
    chainId,
    userAddr,
    affiliateType as AFFILIATE_TYPE,
  );

  const dataFetching = useMemo(
    () => (affiliateType === AFFILIATE_TYPE.AFFILIATES ? isLoadingAffiliateOverview : isLoadingTraderOverview),
    [affiliateType, isLoadingAffiliateOverview, isLoadingTraderOverview],
  );
  return (
    <div className="syn-affiliate-earning">
      <div className="syn-affiliate-earning__title">
        {affiliateType === AFFILIATE_TYPE.AFFILIATES
          ? t('affiliates.earning.title')
          : t('affiliates.earning.titleTrader')}
        <ExternalLink className="rules" href={REFERRAL_RULES_LINK}>
          {t('affiliates.earning.rules')}
        </ExternalLink>
      </div>
      <div className="syn-affiliate-earning__content">
        <div className="earning-commission-box">
          <span className="earning-commission-box__label">
            {theme.dataTheme === THEME_ENUM.DARK ? <ClaimIconD /> : <ClaimIcon />}
            {affiliateType === AFFILIATE_TYPE.AFFILIATES ? (
              <UnderlineToolTip overlayInnerStyle={{ width: 320 }} title={t('affiliates.tooltips.wcAffiliate')}>
                {t('affiliates.earning.wc')}
              </UnderlineToolTip>
            ) : (
              <UnderlineToolTip overlayInnerStyle={{ width: 280 }} title={t('affiliates.tooltips.wcTrader')}>
                {t('affiliates.earning.wfr')}
              </UnderlineToolTip>
            )}
          </span>
          <div className="earning-commission-box__amount">
            <EmptyDataWrap fetching={dataFetching} skeletonWidth={80} isLoading={!affiliateOverview && !traderOverview}>
              <div className="earning-commission-box__amount-value">
                <span>
                  {WrappedBigNumber.from(
                    (affiliateType === AFFILIATE_TYPE.AFFILIATES
                      ? affiliatePendingCommissionList?.totalUSD
                      : traderPendingRebatesList?.totalUSD) || '0',
                  ).formatNumberWithTooltip({ prefix: '$' })}
                </span>
              </div>
              <EarningDetail
                affiliateType={affiliateType as AFFILIATE_TYPE}
                data={
                  affiliateType === AFFILIATE_TYPE.AFFILIATES
                    ? affiliatePendingCommissionList
                    : traderPendingRebatesList
                }
                weeklyData={WrappedBigNumber.from(
                  (affiliateType === AFFILIATE_TYPE.AFFILIATES
                    ? affiliatePendingCommissionList?.totalUSD
                    : traderPendingRebatesList?.totalUSD) || '0',
                )}
              />
            </EmptyDataWrap>
          </div>
        </div>

        <div className="syn-affiliate-earning__content-bottom">
          <div className="earning-box">
            <span className="earning-box__label">
              {theme.dataTheme === THEME_ENUM.DARK ? <WeeklyIconD /> : <WeeklyIcon />}
              {t('affiliates.earning.ac')}
            </span>
            <div className="earning-box__amount">
              <EmptyDataWrap skeletonWidth={80} fetching={isLoading} isLoading={!claimableList}>
                <div className="earning-box__amount-value">
                  <span>
                    {WrappedBigNumber.from(claimableList?.totalUSD || '0').formatNumberWithTooltip({ prefix: '$' })}
                  </span>
                </div>
                <EarningDetail
                  affiliateType={affiliateType as AFFILIATE_TYPE}
                  isClaim={true}
                  data={claimableList}
                  weeklyData={claimableList?.totalUSD}
                />
              </EmptyDataWrap>
            </div>
          </div>
          <Button
            loading={isSending || isLoading}
            disabled={!claimableList || !claimableList.totalUSD || claimableList.totalUSD.lte(0)}
            onClick={claim}
            type="primary"
            className="claim-btn">
            {t('affiliates.earning.claim')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AffiliateEarning;
