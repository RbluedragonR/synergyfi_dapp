import './index.less';

import { useTranslation } from 'react-i18next';

import { LEARN_MORE_LINK } from '@/constants/links';
import { WrappedPosition } from '@/entities/WrappedPosition';
import { usePriceBasisForPnl } from '@/hooks/usePriceBasisForPnl';

type UnrealizedPnlTooltipProps = {
  position: WrappedPosition | undefined;
};
export const UnrealizedPnlTooltip = ({ position }: UnrealizedPnlTooltipProps): JSX.Element => {
  const { priceBasisForPnl } = usePriceBasisForPnl();
  const { t } = useTranslation();
  if (!position) return <></>;
  return (
    <div className="syn-unrealized-pnl-tooltip">
      <div className="syn-unrealized-pnl-tooltip-top">
        <div className="syn-unrealized-pnl-tooltip-title">{t('common.unrealizedPl')}</div>
        <div className="syn-unrealized-pnl-tooltip-row">
          <span>{t('common.tradePage.tradePosition.unRealizedPnlTooltipDesktop.positionPnl')}</span>
          <span>
            {position.getUnrealizedPnlWithoutFunding(priceBasisForPnl).formatNumberWithTooltip({
              suffix: position.rootInstrument.marginToken.symbol,
              isShowTBMK: true,
              colorShader: true,
              showPositive: true,
              colorSuffix: true,
              isShowApproximatelyEqualTo: false,
            })}
          </span>
        </div>
        <div className="syn-unrealized-pnl-tooltip-row">
          <span>{t('common.tradePage.tradePosition.unRealizedPnlTooltipDesktop.socialLoss')}</span>
          <span>
            {/* mul -1 since unrealizedSocialLoss will be positive  */}
            {position.unrealizedSocialLoss.mul(-1).formatNumberWithTooltip({
              suffix: position.rootInstrument.marginToken.symbol,
              isShowTBMK: true,
              colorShader: true,
              showPositive: true,
              colorSuffix: true,
              isShowApproximatelyEqualTo: false,
            })}
          </span>
        </div>
      </div>
      <a
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="syn-unrealized-pnl-tooltip-link"
        href={LEARN_MORE_LINK.socialLoss}
        target="_blank"
        rel="noreferrer">
        {t('common.tradePage.tradePosition.unRealizedPnlTooltipDesktop.learnMore')}
      </a>
    </div>
  );
};
