import { EmptyDataWrap } from '@/components/EmptyDataWrap';
import { formatNumberWithTooltip } from '@/components/NumberFormat';
import TotalOverviewTooltip from '@/components/ToolTip/TotalOverviewTooltip';
import { THEME_ENUM } from '@/constants';
import { useTokensInfoConfig } from '@/features/config/hook';
import { useTheme } from '@/features/global/hooks';
import { getTotalVolume } from '@/features/portfolio/actions';
import { useTotalVolume } from '@/features/portfolio/hook';
import { useAppDispatch } from '@/hooks';
import { usePoller } from '@/hooks/common/usePoller';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { useAssetsBalanceList } from '@/pages/portfolio/Assets/hooks/assetsHook';
import { PieChartItem } from '@/types/chart';
import _ from 'lodash';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PieChartWithText from '../../PieChartWithText';
import { disabledDarkColor, disabledLightColor } from '../../constant';
import { PieChartWithTextsProps } from '../types';
export default function TotalVolumeChart({ statusIsLoading }: PieChartWithTextsProps): JSX.Element {
  const { dataTheme } = useTheme();
  const { t } = useTranslation();
  const isLoading = useMemo(() => statusIsLoading, [statusIsLoading]);
  {
    /* // @TODO uncomment after build large scale details solution */
  }
  //const [isModalOpen, setIsModalOpen] = useState<boolean>(true);
  const dispatch = useAppDispatch();
  const userAddr = useUserAddr();
  const chainId = useChainId();
  const tokensInfoConfig = useTokensInfoConfig(chainId);
  const totalVolume = useTotalVolume(userAddr, chainId);
  const assetsBalance = useAssetsBalanceList(chainId, userAddr, undefined, true);
  usePoller(
    () => {
      chainId && userAddr && dispatch(getTotalVolume({ chainId, userAddr }));
    },
    [chainId, dispatch, userAddr],
    30000,
  );
  const totalVolumeUSD = useMemo(
    () => formatNumberWithTooltip({ num: totalVolume?.totalVolumeUSD || '-', prefix: '$', isShowTBMK: true }),
    [totalVolume?.totalVolumeUSD],
  );
  const qouteVolumeData = useMemo(() => {
    return assetsBalance.flatMap((record) => {
      const volumeDetails = _.get(totalVolume?.details, [record.quote.symbol]);
      const usdAmount = volumeDetails?.volumeUSD || '0';
      if (Number(usdAmount) <= 0) {
        return [];
      }
      return {
        name: record.quote.symbol,
        color: tokensInfoConfig?.marginTokenMap?.[record.quote.address].color || 'black',
        symbol: record.quote.symbol,
        tokenAmount: formatNumberWithTooltip({ num: volumeDetails?.volume || 0, isShowTBMK: true }),
        usdAmount: formatNumberWithTooltip({ num: usdAmount, prefix: '$', isShowTBMK: true }),
        value: Number(usdAmount),
      };
    });
  }, [assetsBalance, tokensInfoConfig?.marginTokenMap, totalVolume?.details]);
  const volumeChartList: PieChartItem[] = useMemo(() => {
    if (statusIsLoading || Number(totalVolume?.totalVolumeUSD || 0) === 0) {
      return [
        {
          symbol: '',
          name: 'Others',
          value: 1,
          color: dataTheme === THEME_ENUM.DARK ? disabledDarkColor : disabledLightColor, //PAIR_COLOR_TYPE.Others,
          tokenAmount: undefined,
          usdAmount: undefined,
        },
      ];
    }
    return qouteVolumeData;
  }, [statusIsLoading, totalVolume?.totalVolumeUSD, dataTheme, qouteVolumeData]);
  return (
    <>
      {/* // @TODO uncomment after build large scale details solution */}
      {/* <VolumeDetailModal open={isModalOpen} onCancel={() => setIsModalOpen(false)} /> */}

      <PieChartWithText
        tooltipTitle={
          <TotalOverviewTooltip
            id="totalVolume-tooltip"
            title={t('common.portfolio.totalVolume')}
            value={totalVolumeUSD}
            data={[
              {
                type: 'quote',
                items: qouteVolumeData,
              },
            ]}
          />
        }
        size="small"
        valuesPieChartProps={{
          noHoverEffect: true,
          chartList: volumeChartList,
          disabled: isLoading,
          isHollow: false,
        }}
        title={t('common.portfolio.totalVolume')}
        value={
          <EmptyDataWrap isLoading={statusIsLoading}>
            <div className="syn-total-overview-volume">
              {totalVolumeUSD}
              {/* // @TODO uncomment after build large scale details solution */}
              {/* <span onClick={() => setIsModalOpen(true)} className="syn-total-overview-csv-btn">
                <IconEye />
                {t('common.details')}
              </span> */}
            </div>
          </EmptyDataWrap>
        }
      />
    </>
  );
}
