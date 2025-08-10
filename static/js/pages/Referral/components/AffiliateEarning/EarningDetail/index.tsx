/**
 * @description Component-EarningDetail
 */
import { AFFILIATE_TYPE } from '@/constants/affiliates';
import './index.less';

import Empty from '@/components/Empty';
import TokenLogo from '@/components/TokenLogo';
import { IconToolTip } from '@/components/ToolTip';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { IReferralAvailableTokenToClaimList } from '@/types/referral/affiliates';
import { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as DetailIcon } from './assets/icon_details_16.svg';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  affiliateType?: AFFILIATE_TYPE;
  data?: IReferralAvailableTokenToClaimList | null;
  weeklyData?: WrappedBigNumber;
  isClaim?: boolean;
}
const EarningDetail: FC<IPropTypes> = function ({
  affiliateType = AFFILIATE_TYPE.AFFILIATES,
  data,
  weeklyData,
  isClaim,
}) {
  const { t } = useTranslation();
  const render = useCallback(
    () => (
      <div className="syn-earning-detail-tooltip-render ">
        <div className="syn-earning-detail-tooltip-render-title">
          <span>
            {' '}
            {isClaim
              ? t('affiliates.earning.ac')
              : affiliateType === AFFILIATE_TYPE.AFFILIATES
              ? t('affiliates.earning.wc')
              : t('affiliates.earning.wfr')}
          </span>
          <span>{weeklyData?.formatNumberWithTooltip({ prefix: '$', isShowTBMK: true })}</span>
        </div>
        <div className="syn-earning-detail-tooltip-render-list syn-scrollbar">
          {data?.list.map((item, index) => (
            <div key={index} className="syn-earning-detail-tooltip-render-list-item">
              <span className="token">
                <TokenLogo size={12} token={item.token} /> {item.token.symbol}
              </span>
              <div className="right">
                {WrappedBigNumber.from(item.balance).formatNumberWithTooltip({
                  isShowTBMK: true,
                })}
                <span className="usd">
                  {WrappedBigNumber.from(item.balanceUSD || 0).formatNumberWithTooltip({
                    prefix: '$',
                    isShowTBMK: true,
                  })}
                </span>
              </div>
            </div>
          ))}
          {!data?.list.length && <Empty />}
        </div>
      </div>
    ),
    [affiliateType, data?.list, isClaim, t, weeklyData],
  );

  return (
    <IconToolTip
      placement="bottom"
      icon={<DetailIcon className="syn-earning-detail-tooltip-btn" />}
      title={render}
      overlayClassName="syn-earning-detail-tooltip"
    />
  );
};

export default EarningDetail;
