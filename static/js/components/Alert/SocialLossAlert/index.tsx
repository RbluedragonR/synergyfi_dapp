import './index.less';

import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import Alert from '@/components/Alert';
import { LEARN_MORE_LINK } from '@/constants/links';
import { WrappedPosition } from '@/entities/WrappedPosition';

type SocialLossAlertProps = {
  position: WrappedPosition | undefined;
  isDesktop?: boolean;
};
export const SocialLossAlert = ({ position, isDesktop = true }: SocialLossAlertProps): JSX.Element => {
  const { t } = useTranslation();
  if (!position || position.unrealizedSocialLoss.lte(0)) return <></>;

  return (
    <div
      className={classNames('syn-social-loss-alert-container', isDesktop && 'syn-social-loss-alert-container-desktop')}>
      <Alert
        type="info"
        message={
          <div className="syn-social-loss-alert">
            {t('common.tradePage.tradePosition.unRealizedSocialLossAlert.head')}&nbsp;
            <span>
              {t('common.tradePage.tradePosition.unRealizedSocialLossAlert.bold')}
              &nbsp;
              {position.unrealizedSocialLoss.formatNumberWithTooltip({
                suffix: position.rootInstrument.marginToken.symbol,
                isShowTBMK: true,
                colorSuffix: true,
                isShowApproximatelyEqualTo: false,
                showToolTip: false,
              })}
            </span>
            {t('common.tradePage.tradePosition.unRealizedSocialLossAlert.tail')}
            &nbsp;
            <a href={LEARN_MORE_LINK.socialLoss} target="_blank" rel="noreferrer">
              {t('common.learnMore')}
            </a>
          </div>
        }
        showIcon
      />
    </div>
  );
};
