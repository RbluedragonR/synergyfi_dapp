import { EmptyDataWrap } from '@/components/EmptyDataWrap';
import TotalOverviewTooltip from '@/components/ToolTip/TotalOverviewTooltip';
import { useTokensInfoConfig } from '@/features/config/hook';
import { useAssetPnl } from '@/pages/portfolio/Assets/hooks/assetsHook';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PieChartWithText from '../../PieChartWithText';
import { PieChartWithTextsProps } from '../types';

export default function TotalPnLChart({ chainId, userAddr, statusIsLoading }: PieChartWithTextsProps): JSX.Element {
  const { t } = useTranslation();
  const { total, list } = useAssetPnl(chainId, userAddr);
  const isLoading = useMemo(() => statusIsLoading || list === undefined, [list, statusIsLoading]);
  const isTotalLessAndEqualZero = useMemo(() => {
    if (process.env.REACT_APP_APP_PORTFOLIO_SHOW_PNL === 'true') {
      return false;
    }
    return total.lte(0);
  }, [total]);
  const tokensInfoConfig = useTokensInfoConfig(chainId);
  const quoteAssetPnlData = useMemo(() => {
    return list?.map((record) => {
      return {
        color: tokensInfoConfig?.marginTokenMap?.[record.quote.address].color || 'black',
        symbol: record.quote.symbol,
        tokenAmount: record.pnlInToken?.formatNumberWithTooltip({ isShowTBMK: true }) || '-',
        usdAmount: record.pnlInUsd?.formatNumberWithTooltip({ prefix: '$', isShowTBMK: true }) || '-',
        name: record.quote.symbol,
        token: record.quote,
      };
    });
  }, [list, tokensInfoConfig?.marginTokenMap]);
  if (isTotalLessAndEqualZero) return <></>;
  return (
    <>
      <PieChartWithText
        tooltipTitle={
          isTotalLessAndEqualZero ? null : (
            <TotalOverviewTooltip
              isDisplayTokenIconInsteadOfColorDot
              id="totalPNL-tooltip"
              title={t('common.portfolio.totalPNL')}
              value={total.formatNumberWithTooltip({ prefix: '$', isShowTBMK: true }) || '-'}
              data={[
                {
                  type: 'quote',
                  items: quoteAssetPnlData || [],
                },
              ]}
            />
          )
        }
        isPnl
        size="small"
        title={t('common.portfolio.totalPNL')}
        value={
          <EmptyDataWrap isLoading={isLoading}>
            {isTotalLessAndEqualZero ? '-' : total.formatNumberWithTooltip({ prefix: '$', isShowTBMK: true })}
          </EmptyDataWrap>
        }
      />
    </>
  );
}
