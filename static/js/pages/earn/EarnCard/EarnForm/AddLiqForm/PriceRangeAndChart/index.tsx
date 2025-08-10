/**
 * @description Component-PriceRange
 */
import Checkbox from '@/components/Checkbox';
import { EmptyDataWrap } from '@/components/EmptyDataWrap';
import { useMockDevTool } from '@/components/Mock';
import { Skeleton } from '@/components/Skeleton';
import { FETCHING_STATUS } from '@/constants';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { WrappedPair } from '@/entities/WrappedPair';
import { useBackendChainConfig } from '@/features/config/hook';
import { addLiquiditySimulate, setAddLiqFormState } from '@/features/earn/action';
import {
  useAddLiquidationSimulation,
  useAddLiquidityFormState,
  useWhiteListFetchingStatus,
} from '@/features/earn/hook';
import { useGlobalConfig } from '@/features/global/hooks';
import { useCombinedPairFromUrl, usePairFromUrl } from '@/features/pair/hook';
import { useSDK } from '@/features/web3/hook';
import { useAppDispatch } from '@/hooks';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import EarnLiqChart from '@/pages/earn/EarnChart/EarnLiqChart';
import { perToTenThousands } from '@/utils/trade';
import { utils } from '@synfutures/sdks-perp';
import { useDebounceFn } from 'ahooks';

import { inputNumChecker } from '@/utils/numberUtil';
import { BigNumber } from 'ethers';
import { FC, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import './index.less';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const PriceRangeAndChart: FC<IPropTypes> = function ({}) {
  const { t } = useTranslation();
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const sdkContext = useSDK(chainId);
  const liqSimulation = useAddLiquidationSimulation(chainId);
  const currentPair = useCombinedPairFromUrl(chainId);
  const currentWrappedPair = usePairFromUrl(chainId);
  const addLiqState = useAddLiquidityFormState(chainId);
  const { isMockSkeleton } = useMockDevTool();
  const { slippage } = useGlobalConfig(chainId);
  const backendChainConfig = useBackendChainConfig(chainId);
  const whitelistFetchStatus = useWhiteListFetchingStatus(chainId, currentPair?.rootInstrument.quoteToken?.address);
  const dispatch = useAppDispatch();
  const currentCreatedPair = useMemo(() => {
    return currentPair instanceof WrappedPair ? currentPair : undefined;
  }, [currentPair]);

  const estApy = useMemo(() => {
    if (sdkContext && currentCreatedPair instanceof WrappedPair) {
      try {
        if (liqSimulation?.data?.equivalentAlpha === undefined) {
          return 0;
        }
        const apy =
          utils.estimateAPY(
            currentCreatedPair.rootInstrument,
            currentCreatedPair.expiry,
            WrappedBigNumber.from(currentCreatedPair.stats?.poolFee24h || 0).wadValue,
            liqSimulation?.data?.equivalentAlpha,
          ) ?? 0;
        return inputNumChecker((apy * 100)?.toString() || 0, 1);
      } catch (error) {
        console.log('🚀 ~ file: index.tsx:66 ~ estApy ~ error:', error);
      }
    }
    return 0;
  }, [currentCreatedPair?.stats?.poolFee24h?.stringValue, liqSimulation?.data?.equivalentAlpha?._hex, sdkContext]);
  const priceChanges = useMemo(() => {
    const currentPrice = currentWrappedPair?.wrapAttribute('fairPrice');
    if (liqSimulation?.data && currentPrice) {
      const lowerPriceChange = WrappedBigNumber.from(liqSimulation.data?.lowerPrice)
        .min(currentPrice)
        .div(currentPrice);
      const upperPriceChange = WrappedBigNumber.from(liqSimulation.data?.upperPrice)
        .min(currentPrice)
        .div(currentPrice);
      return {
        lowerPriceChange: lowerPriceChange.gt(-0.01) ? '-1%' : lowerPriceChange.formatPercentageString(true, 0),
        upperPriceChange: upperPriceChange.lt(0.01) ? '1%' : upperPriceChange.formatPercentageString(true, 0),
      };
    }
    return undefined;
  }, [currentWrappedPair, liqSimulation?.data]);
  const updateAsymmetricInState = useCallback(
    (asymmetric: boolean) => {
      addLiqState &&
        dispatch(
          setAddLiqFormState({
            ...addLiqState,
            asymmetric,
          }),
        );
    },
    [addLiqState, dispatch],
  );
  const fetchSimulation = useCallback(
    (alpha?: BigNumber) => {
      if (chainId && currentPair && sdkContext) {
        dispatch(
          addLiquiditySimulate({
            chainId,
            sdkContext,
            pair: currentPair,
            alpha,
            margin: WrappedBigNumber.from(0),
            slippage: perToTenThousands(Number(slippage)),
            userAddr,
            customStableInstruments: backendChainConfig?.customStableInstruments,
          }),
        );
      }
    },
    [backendChainConfig, chainId, currentPair, sdkContext, userAddr, dispatch, slippage],
  );
  const { run: simulateTradeDebounced } = useDebounceFn(
    () => {
      fetchSimulation();
    },
    { wait: 400 },
  );
  useEffect(() => {
    currentPair?.id && chainId && !addLiqState?.lowerUpperTicks?.length && simulateTradeDebounced();
    //must depend on these deps
  }, [currentPair?.id, userAddr]);
  return (
    <div className="syn-price-range-and-chart">
      <div className="syn-price-range-and-chart-title">
        {t('common.priceR')}
        <Checkbox
          checked={addLiqState?.asymmetric}
          onChange={(e) => {
            updateAsymmetricInState(e.target.checked);
          }}>
          {t('common.earn.asymmetric')}
        </Checkbox>
      </div>
      {!liqSimulation?.data || whitelistFetchStatus !== FETCHING_STATUS.DONE || isMockSkeleton ? (
        <div className="syn-price-range-and-chart-desc skeleton">
          <div className="syn-price-range-and-chart-desc-left">
            <Skeleton title={false} paragraph={{ rows: 2 }} active />
            <div className="syn-price-range-and-chart-desc-left-divider" />
            <Skeleton title={false} paragraph={{ rows: 2 }} active />
          </div>
          <div className="syn-price-range-and-chart-desc-divider" />
          <Skeleton className="syn-price-range-and-chart-desc-right" title={false} paragraph={{ rows: 2 }} active />
        </div>
      ) : (
        <div className="syn-price-range-and-chart-desc">
          <div className="syn-price-range-and-chart-desc-left">
            <dl>
              <dt>
                {' '}
                <EmptyDataWrap isLoading={!liqSimulation?.data}>
                  {WrappedBigNumber.from(liqSimulation?.data?.lowerPrice || 0).formatPriceNumberWithTooltip()}
                </EmptyDataWrap>
              </dt>
              <dd>
                <EmptyDataWrap isLoading={!liqSimulation?.data}>{priceChanges?.lowerPriceChange}</EmptyDataWrap>
              </dd>
            </dl>
            -
            <dl>
              <dt>
                <EmptyDataWrap isLoading={!liqSimulation?.data}>
                  {WrappedBigNumber.from(liqSimulation?.data?.upperPrice || 0).formatPriceNumberWithTooltip()}
                </EmptyDataWrap>
              </dt>
              <dd>
                <EmptyDataWrap isLoading={!liqSimulation?.data}>{priceChanges?.upperPriceChange}</EmptyDataWrap>
              </dd>
            </dl>
          </div>
          <div className="syn-price-range-and-chart-desc-divider" />
          <dl className="syn-price-range-and-chart-desc-right">
            <dt>
              {' '}
              <EmptyDataWrap
                isLoading={!(currentPair as WrappedPair)?.stats || !sdkContext}>{`${estApy}%`}</EmptyDataWrap>
            </dt>
            <dd>{t('common.earn.estApy')}</dd>
          </dl>
        </div>
      )}
      <div className="syn-price-range-and-chart-chart">
        <EarnLiqChart loading={whitelistFetchStatus !== FETCHING_STATUS.DONE} asymmetric={addLiqState?.asymmetric} />
      </div>
    </div>
  );
};

export default PriceRangeAndChart;
