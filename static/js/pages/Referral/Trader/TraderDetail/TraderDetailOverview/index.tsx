/**
 * @description Component-TraderDetailOverview
 */
import { Trans, useTranslation } from 'react-i18next';
import './index.less';

import { EmptyDataWrap } from '@/components/EmptyDataWrap';
import UnderlineToolTip from '@/components/ToolTip/UnderlineToolTip';
import { THEME_ENUM } from '@/constants';
import { REFERRAL_FEE_REBATE_PERCENTAGE } from '@/constants/referral';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useTheme } from '@/features/global/hooks';
import { useTraderOverview } from '@/features/referral/query';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { ReactComponent as FeeIcon } from '@/pages/Referral/assets/icon_affiliates_fee.svg';
import { ReactComponent as FeeIconD } from '@/pages/Referral/assets/icon_affiliates_fee_d.svg';
import { ReactComponent as VolumeIcon } from '@/pages/Referral/assets/icon_affiliates_volume.svg';
import { ReactComponent as VolumeIconD } from '@/pages/Referral/assets/icon_affiliates_volume_d.svg';
import { shortenAddress } from '@/utils/address';
import classNames from 'classnames';
import { FC, useMemo } from 'react';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const TraderDetailOverview: FC<IPropTypes> = function ({}) {
  const { t } = useTranslation();
  const userAddr = useUserAddr();
  const chainId = useChainId();
  const { data, isLoading } = useTraderOverview(chainId, userAddr);
  const theme = useTheme();
  const shortenedAddress = useMemo(() => shortenAddress(data?.inviter || ''), [data?.inviter]);
  return (
    <div className="syn-trader-detail-overview">
      <div className="syn-trader-detail-overview-top">
        <div className="syn-trader-detail-overview-top-left">{t('affiliates.overview')}</div>
        <div className="syn-trader-detail-overview-top-right">
          {/* {data?.inviterReferralCode && (
            <span className="referred">{t('affiliates.traderPage.traderDetailOverview.referred')}</span>
          )} */}
          {/* {t('affiliates.traderPage.traderDetailOverview.feeRebate', { percent: REFERRAL_FEE_REBATE_PERCENTAGE })} */}
          <span className="syn-trader-detail-overview-top-right-rebate">
            <Trans
              i18nKey={'affiliates.traderPage.traderDetailOverview.feeRebate'}
              components={{ b: <b className="fee-rebate" /> }}
              values={{ percent: REFERRAL_FEE_REBATE_PERCENTAGE }}
            />
          </span>
        </div>
      </div>
      <div className={classNames('syn-trader-detail-overview-middle', theme.dataTheme)}>
        <dl>
          {theme.dataTheme === THEME_ENUM.DARK ? <VolumeIconD /> : <VolumeIcon />}
          <dt>
            <UnderlineToolTip title={t('affiliates.tooltips.updateD')}>
              {t('affiliates.traderPage.traderDetailOverview.ttv')}
            </UnderlineToolTip>
          </dt>
          <dd>
            <EmptyDataWrap skeletonWidth={160} skeletonHeight={24} fetching={isLoading} isLoading={!data}>
              {WrappedBigNumber.from(data?.totalTradingVolumeUSD || '').formatNumberWithTooltip({ prefix: '$' })}
            </EmptyDataWrap>
          </dd>
        </dl>
        <dl>
          {theme.dataTheme === THEME_ENUM.DARK ? <FeeIconD /> : <FeeIcon />}{' '}
          <dt>
            <UnderlineToolTip title={t('affiliates.tooltips.updateW')}>
              {t('affiliates.traderPage.traderDetailOverview.tfr')}
            </UnderlineToolTip>
          </dt>
          <dd>
            <EmptyDataWrap skeletonWidth={160} skeletonHeight={24} fetching={isLoading} isLoading={!data}>
              {WrappedBigNumber.from(data?.totalFeeRebatesUSD || '').formatNumberWithTooltip({ prefix: '$' })}
            </EmptyDataWrap>
          </dd>
        </dl>
      </div>
      <div className="syn-trader-detail-overview-bottom">
        <div className="syn-trader-detail-overview-bottom-title">
          <Trans i18nKey={`affiliates.traderPage.traderDetailOverview.cwv`} />
          <EmptyDataWrap skeletonWidth={80} fetching={isLoading} isLoading={!data}>
            <b>{WrappedBigNumber.from(data?.periodVolumeUSD || '').formatNumberWithTooltip({ prefix: '$' })}</b>
          </EmptyDataWrap>
        </div>
        <div className="syn-trader-detail-overview-bottom-content">
          {t('affiliates.traderPage.traderDetailOverview.referredBy')}
          <EmptyDataWrap skeletonWidth={200} fetching={isLoading} isLoading={!data}>
            <b>{shortenedAddress}</b>
            <span className="code">{data?.inviterReferralCode}</span>
          </EmptyDataWrap>
        </div>
      </div>
    </div>
  );
};

export default TraderDetailOverview;
