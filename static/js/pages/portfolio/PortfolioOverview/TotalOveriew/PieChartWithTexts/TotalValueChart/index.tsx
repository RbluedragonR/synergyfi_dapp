import { EmptyDataWrap } from '@/components/EmptyDataWrap';
import { formatNumberWithTooltip, formatPriceNumberWithTooltip } from '@/components/NumberFormat';
import TotalOverviewTooltip from '@/components/ToolTip/TotalOverviewTooltip';
import { THEME_ENUM } from '@/constants';
import { useTokensInfoConfig } from '@/features/config/hook';
import { useTheme } from '@/features/global/hooks';
import { useAssetsBalanceList, useAssetsTotalsInUsd } from '@/pages/portfolio/Assets/hooks/assetsHook';
import { PieChartItem } from '@/types/chart';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PieChartWithText from '../../PieChartWithText';
import { disabledDarkColor, disabledLightColor } from '../../constant';
import { PieChartWithTextsProps } from '../types';

export default function TotalValueChart({ chainId, userAddr, statusIsLoading }: PieChartWithTextsProps): JSX.Element {
  const { dataTheme } = useTheme();
  const { t } = useTranslation();
  const assetsBalance = useAssetsBalanceList(chainId, userAddr, undefined, true);
  const tokensInfoConfig = useTokensInfoConfig(chainId);
  const totals = useAssetsTotalsInUsd(chainId, userAddr);
  const isLoading = useMemo(
    () => statusIsLoading || totals.totalValue === undefined,
    [statusIsLoading, totals.totalValue],
  );
  const quoteAssetBalanceData = useMemo(() => {
    return assetsBalance.flatMap((record) => {
      const totalUSD = record.totalBalance?.mul(record.quote.price || 0);
      if (totalUSD?.lte(0)) {
        return [];
      }
      return [
        {
          color: tokensInfoConfig?.marginTokenMap?.[record.quote.address].color || 'black',
          symbol: record.quote.symbol,
          tokenAmount: record.totalBalance?.formatNumberWithTooltip({ isShowTBMK: true }) || '-',
          usdAmount: totalUSD?.formatNumberWithTooltip({ prefix: '$', isShowTBMK: true }) || '-',
          name: record.quote.symbol,
          value: Number(totalUSD?.toString() || '0'),
        },
      ];
    });
  }, [assetsBalance, tokensInfoConfig?.marginTokenMap]);

  const quoteAssetUsageData = useMemo(() => {
    return [
      {
        title: t('common.portfolio.inPosition'),
        value: formatNumberWithTooltip({
          num: totals.inPosition?.stringValue || '-',
          prefix: '$',
        }),
      },
      {
        title: t('common.portfolio.inLiq'),
        value: formatNumberWithTooltip({ num: totals.inLiq?.stringValue || '-', prefix: '$', isShowTBMK: true }),
      },
      {
        title: t('common.portfolio.inOrder'),
        value: formatNumberWithTooltip({ num: totals.inOrder?.stringValue || '-', prefix: '$', isShowTBMK: true }),
      },
      {
        title: t('common.portfolio.accountBalance'),
        value: formatNumberWithTooltip({
          num: totals.inAccount?.stringValue || '-',
          prefix: '$',
          isShowTBMK: true,
        }),
      },
    ].concat(
      totals?.inWithdrawPendingLock?.gt(0)
        ? [
            {
              title: t('common.portfolio.withdrawalInProgress'),
              value: formatPriceNumberWithTooltip({
                num: totals?.inWithdrawPendingLock?.stringValue || '-',
                prefix: '$',
                isShowTBMK: true,
              }),
            },
          ]
        : [],
    );
  }, [
    t,
    totals.inAccount?.stringValue,
    totals.inLiq?.stringValue,
    totals.inOrder?.stringValue,
    totals.inPosition?.stringValue,
    totals?.inWithdrawPendingLock,
  ]);
  const totalValueChartList: PieChartItem[] = useMemo(() => {
    if (statusIsLoading || totals.totalValue?.eq(0)) {
      return [
        {
          name: 'Others',
          value: 1,
          color: dataTheme === THEME_ENUM.DARK ? disabledDarkColor : disabledLightColor, //PAIR_COLOR_TYPE.Others,
        },
      ];
    }
    const res = quoteAssetBalanceData;

    return res;
  }, [statusIsLoading, totals.totalValue, quoteAssetBalanceData, dataTheme]);
  return (
    <>
      <PieChartWithText
        valuesPieChartProps={{
          noHoverEffect: true,
          chartList: totalValueChartList,
          disabled: isLoading,
        }}
        title={t('common.portfolio.totalV')}
        tooltipTitle={
          <TotalOverviewTooltip
            id="totalV-tooltip"
            title={t('common.portfolio.totalV')}
            value={totals.totalValue?.formatNumberWithTooltip({ prefix: '$', isShowTBMK: true })}
            data={[
              {
                type: 'quote',
                subtitle: t('common.portfolio.byQuote'),
                items: quoteAssetBalanceData,
              },
              {
                type: 'usage',
                subtitle: t('common.portfolio.byUsage'),
                items: quoteAssetUsageData,
              },
            ]}
          />
        }
        value={
          <EmptyDataWrap isLoading={isLoading}>
            {totals.totalValue?.formatNumberWithTooltip({ prefix: '$', isShowTBMK: true })}
          </EmptyDataWrap>
        }
      />
    </>
  );
}
