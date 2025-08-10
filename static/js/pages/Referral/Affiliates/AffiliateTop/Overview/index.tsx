/**
 * @description Component-Overview
 */
import { useAffiliateOverview } from '@/features/referral/query';
import './index.less';

import { EmptyDataWrap } from '@/components/EmptyDataWrap';
import UnderlineToolTip from '@/components/ToolTip/UnderlineToolTip';
import { REFERRAL_LEARN_MORE_LINK } from '@/constants/referral';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useTheme } from '@/features/global/hooks';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { ReactComponent as CommissionIcon } from '@/pages/Referral/assets/icon_affiliates_commission.svg';
import { ReactComponent as CommissionIconDark } from '@/pages/Referral/assets/icon_affiliates_commission_d.svg';
import { ReactComponent as InviteeIcon } from '@/pages/Referral/assets/icon_affiliates_invitees.svg';
import { ReactComponent as InviteeIconDark } from '@/pages/Referral/assets/icon_affiliates_invitees_d.svg';
import { ReactComponent as VolumeIcon } from '@/pages/Referral/assets/icon_affiliates_volume.svg';
import { ReactComponent as VolumeIconDark } from '@/pages/Referral/assets/icon_affiliates_volume_d.svg';
import { formatNumber } from '@/utils/numberUtil';
import classNames from 'classnames';
import { FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import IconGold from './assets/tier_tag_gold.png';
import IconSilver from './assets/tier_tag_silver.png';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const Overview: FC<IPropTypes> = function ({}) {
  const chainId = useChainId();
  const { t } = useTranslation();
  const userAddr = useUserAddr();
  const { data, isLoading } = useAffiliateOverview(chainId, userAddr);
  const { isDark, dataTheme } = useTheme();

  return (
    <div className={classNames('syn-affiliates-overview', dataTheme)}>
      <div className="syn-affiliates-overview__header">
        <span className="syn-affiliates-overview__header-title">{t('affiliates.overview')}</span>
        <div className="syn-affiliates-overview__header-info">
          <EmptyDataWrap skeletonWidth={120} fetching={isLoading} isLoading={!data}>
            <div className="badge">
              <img src={data?.commissionRebateLevel === 'gold' ? IconGold : IconSilver} alt="level" />
            </div>
            <div className="commission">
              <b>{WrappedBigNumber.from(data?.commissionRebateRate || 0).formatPercentage({ colorShader: false })}</b>
              <span>{t('affiliates.commissionRate')}</span>
            </div>
          </EmptyDataWrap>
        </div>
      </div>
      <div className="syn-affiliates-overview__stats">
        <div className="syn-affiliates-overview__stat">
          <span className="syn-affiliates-overview__stat-title">
            {isDark ? <InviteeIconDark /> : <InviteeIcon />}
            {t('affiliates.kol.totalInvitees')}
          </span>
          <div className="syn-affiliates-overview__stat-value">
            <EmptyDataWrap skeletonHeight={24} skeletonWidth={160} fetching={isLoading} isLoading={!data}>
              {formatNumber(data?.totalInvitees || 0, 0)}
            </EmptyDataWrap>
          </div>
        </div>
        <div className="syn-affiliates-overview__stat">
          <span className="syn-affiliates-overview__stat-title">
            {isDark ? <VolumeIconDark /> : <VolumeIcon />}
            <UnderlineToolTip title={t('affiliates.tooltips.updateD')}>{t('affiliates.kol.ttv')}</UnderlineToolTip>
          </span>
          <div className="syn-affiliates-overview__stat-value">
            <EmptyDataWrap skeletonHeight={24} skeletonWidth={160} fetching={isLoading} isLoading={!data}>
              {WrappedBigNumber.from(data?.totalTradingVolumeUSD || '').formatNumberWithTooltip({ prefix: '$' })}
            </EmptyDataWrap>
          </div>
        </div>
        <div className="syn-affiliates-overview__stat">
          <span className="syn-affiliates-overview__stat-title">
            {isDark ? <CommissionIconDark /> : <CommissionIcon />}
            <UnderlineToolTip overlayInnerStyle={{ width: 280 }} title={t('affiliates.tooltips.totalCommission')}>
              {t('affiliates.kol.tc')}
            </UnderlineToolTip>
          </span>
          <div className="syn-affiliates-overview__stat-value">
            <EmptyDataWrap skeletonHeight={24} skeletonWidth={160} fetching={isLoading} isLoading={!data}>
              {WrappedBigNumber.from(data?.totalCommissionUSD || '').formatNumberWithTooltip({ prefix: '$' })}
            </EmptyDataWrap>
          </div>
        </div>
      </div>
      <div className="syn-affiliates-overview__bottom">
        <div className="volume">
          <Trans i18nKey="affiliates.traderPage.traderDetailOverview.cwv" />
          <EmptyDataWrap skeletonWidth={80} fetching={isLoading} isLoading={!data}>
            <b>{WrappedBigNumber.from(data?.periodVolumeUSD || '').formatNumberWithTooltip({ prefix: '$' })}</b>
          </EmptyDataWrap>
        </div>

        <div className="commission">
          {t('affiliates.kol.levelDesc')}
          <a href={REFERRAL_LEARN_MORE_LINK} target="_blank" rel="noreferrer">
            {t('affiliates.seeRules')}
          </a>{' '}
        </div>
      </div>
    </div>
  );
};

export default Overview;
