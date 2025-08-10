import { CampaignStatus, CampaignStatusInfo } from '@/constants/campaign';
import classNames from 'classnames';
import { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import './index.less';
export default function CampaignTitleText({
  campaignStatus,
  className,
  ...others
}: ComponentProps<'div'> & { campaignStatus: CampaignStatus }) {
  const { t } = useTranslation();
  return (
    <div {...others} className={classNames('syn-campaign-title-text', className)}>
      {CampaignStatusInfo[campaignStatus].titleIcon}
      <div>{t(CampaignStatusInfo[campaignStatus].labelI18nKey)}</div>
      <div className="syn-campaign-title-text-line" />
    </div>
  );
}
