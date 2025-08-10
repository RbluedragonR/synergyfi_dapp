/**
 * @description Component-AffiliateReferralCode
 */
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import './index.less';

import { EmptyDataWrap } from '@/components/EmptyDataWrap';
import { Tooltip } from '@/components/ToolTip';
import { useTheme } from '@/features/global/hooks';
import { useAffiliateReferralCode, useShareAffiliateReferralLink } from '@/features/referral/hooks';
import { useAffiliateOverview } from '@/features/referral/query';
import classNames from 'classnames';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as IconLinearCopy } from './assets/icon_linear_copy_24.svg';
import { ReactComponent as IconLinearLink } from './assets/icon_linear_link_24.svg';
import { ReactComponent as IconLinearTelegram } from './assets/icon_linear_telegram_24.svg';
import { ReactComponent as IconLinearTwitter } from './assets/icon_linear_twitter_24.svg';

interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const AffiliateReferralCode: FC<IPropTypes> = function ({}) {
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const referralCode = useAffiliateReferralCode(chainId, userAddr);
  const { isLoading } = useAffiliateOverview(chainId, userAddr);
  const { handleCopyLink, handleTweet, handleTelegram, isCopiedLink, isCopiedReferral, handleCopy } =
    useShareAffiliateReferralLink(chainId, userAddr);
  const { dataTheme } = useTheme();

  const { t } = useTranslation();
  return (
    <div className={classNames('syn-affiliate-referral-code', dataTheme)}>
      <div className="syn-affiliate-referral-code-title">{t('affiliates.kol.yrc')}</div>
      <div className="syn-affiliate-referral-code__code-container">
        <EmptyDataWrap skeletonWidth={240} skeletonHeight={24} fetching={isLoading}>
          <div className="syn-affiliate-referral-code__code">{referralCode}</div>

          <Tooltip title={isCopiedReferral ? t('affiliates.copied') : t('affiliates.copy')}>
            <div className="syn-affiliate-referral-code-action" onClick={handleCopy}>
              <IconLinearCopy />
            </div>
          </Tooltip>
          <Tooltip title={isCopiedLink ? t('affiliates.copied') : t('affiliates.copy')}>
            <div className="syn-affiliate-referral-code-action" onClick={handleCopyLink}>
              <IconLinearLink />
            </div>
          </Tooltip>
          <div className="syn-affiliate-referral-code-action" onClick={handleTweet}>
            <IconLinearTwitter />
          </div>
          <div className="syn-affiliate-referral-code-action" onClick={handleTelegram}>
            <IconLinearTelegram />
          </div>
        </EmptyDataWrap>
      </div>
    </div>
  );
};

export default AffiliateReferralCode;
