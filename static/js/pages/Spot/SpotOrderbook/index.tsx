/**
 * @description Component-SpotOrderbook
 */
import { ReactComponent as IconArrowFall } from '@/assets/svg/icon_arrow_fall_16.svg';
import { ReactComponent as IconArrowRise } from '@/assets/svg/icon_arrow_rise_16.svg';
import { ReactComponent as SwapIcon } from '@/assets/svg/icon_swap.svg';
import { EmptyDataWrap } from '@/components/EmptyDataWrap';
import { useMockDevTool } from '@/components/Mock';
import { defaultStepRatioOverride, spotDexInfos, spotStepRatio } from '@/constants/spot';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useSpotOrderBookDepth } from '@/features/spot/query';
import { useSpotState } from '@/features/spot/store';
import { useTrend } from '@/hooks/trade/useTrend';
import { useChainId } from '@/hooks/web3/useChain';
import OrderBookSkeleton from '@/pages/trade/CoinPriceChart/OrderBook/OrderBookSkeleton';
import StepRatioSelector from '@/pages/trade/CoinPriceChart/StepRatioSelector';
import classNames from 'classnames';
import _ from 'lodash';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './index.less';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const SpotOrderbook: FC<IPropTypes> = function ({}) {
  const { t } = useTranslation();
  const { setStepRatio, token0, token1, stepRatio } = useSpotState();
  const chainId = useChainId();
  const { isMockSkeleton } = useMockDevTool();
  const { data } = useSpotOrderBookDepth(chainId, token0?.address, token1?.address, stepRatio);
  const trend = useTrend(data?.midPrice);
  const [isToken0, setIsToken0] = useState(true);
  const loading = isMockSkeleton || !data;

  const dexNames = _.cloneDeep(data?.left[0]?.dexes.map((dex) => spotDexInfos[dex.type]?.name) || []).reverse();
  const largestTokenSum = useMemo(() => {
    return Math.max(
      (isToken0 ? _.get(data?.right, [0])?.token0Sum : _.get(data?.right, [0])?.token1Sum) || 0,
      (isToken0
        ? _.get(data?.left, [(data?.left.length || 1) - 1])?.token0Sum
        : _.get(data?.left, [(data?.left.length || 1) - 1])?.token1Sum) || 0,
    );
  }, [data?.left, data?.right, isToken0]);
  const redColors = ['red', 'medium-red', 'dark-red'];
  const greenColors = ['green', 'medium-green', 'dark-green'];
  if (data?.isMultiple) {
    return null;
  }
  return (
    <div className={classNames('syn-spot-orderbook')}>
      <div className="syn-spot-orderbook-row title">
        <div className="syn-spot-orderbook-row-item">{t('common.orderBook.orderB')}</div>

        <div className="syn-spot-orderbook-row-item">
          <StepRatioSelector
            imr={100}
            onChange={setStepRatio}
            numbersOverride={spotStepRatio}
            defaultStepRatioOverride={defaultStepRatioOverride}
          />
        </div>
      </div>
      <div className="syn-spot-orderbook-content">
        <div className="syn-spot-orderbook-row header">
          <div className="syn-spot-orderbook-row-item">{t('common.orderBook.price')}</div>
          <div className="syn-spot-orderbook-row-item">
            {t('common.orderBook.size')}
            <span
              onClick={() => {
                setIsToken0((prev) => !prev);
              }}
              className="swap">
              &nbsp;<span>(</span>
              {isToken0 ? token0?.symbol : token1?.symbol}
              <SwapIcon />
              <span>)</span>
            </span>
          </div>
          <div className="syn-spot-orderbook-row-item">{t('common.orderBook.sum')}</div>
        </div>
        {!loading && (
          <div className="syn-spot-orderbook-content-label">
            {dexNames?.map((item, i) => (
              <div key={`${i}_{item}_sell`} className={classNames('syn-spot-orderbook-content-label-item')}>
                <div className={classNames('syn-spot-orderbook-content-label-item-square', redColors[i])} />
                {item}
              </div>
            ))}
          </div>
        )}
        <OrderBookSkeleton isLoading={loading}>
          <div className="syn-spot-orderbook-content-sell">
            {_.cloneDeep(data?.right)
              ?.sort((a, b) => b.price - a.price)
              .map((item, index) => {
                const tokenSize = isToken0 ? item.token0Size : item.token1Size;
                const tokenSum = isToken0 ? item.token0Sum : item.token1Sum;
                const bodyPercent = tokenSum / largestTokenSum;
                return (
                  <div key={`sell_${index}`} className={classNames('syn-spot-orderbook-row sell')}>
                    <div className="syn-spot-orderbook-row-item">
                      <EmptyDataWrap isLoading={!item.price}>
                        {WrappedBigNumber.from(item.price).formatPriceNumberWithTooltip()}
                      </EmptyDataWrap>
                    </div>
                    <div className="syn-spot-orderbook-row-item">
                      <EmptyDataWrap isLoading={!tokenSize}>
                        {WrappedBigNumber.from(tokenSize).formatNumberWithTooltip({
                          isShowTBMK: true,
                        })}
                      </EmptyDataWrap>
                    </div>
                    <div className="syn-spot-orderbook-row-item">
                      <EmptyDataWrap isLoading={!tokenSum}>
                        {WrappedBigNumber.from(tokenSum).formatNumberWithTooltip({
                          isShowTBMK: true,
                        })}
                      </EmptyDataWrap>
                    </div>
                    <div className="syn-spot-orderbook-row-item-bg-wrap">
                      {[...item.dexes].reverse().map((item, i) => (
                        <div
                          key={`${i}_${item.percent}_sell`}
                          className={classNames('syn-spot-orderbook-row-item-bg', redColors[i])}
                          style={{
                            width: `${bodyPercent * 100 * (item.percent || 0)}%`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
          <div className={classNames('syn-spot-orderbook-row price', trend)}>
            {WrappedBigNumber.from(data?.midPrice || '').formatPriceNumberWithTooltip()}{' '}
            {trend === 'up' ? <IconArrowRise /> : <IconArrowFall />}
          </div>
          <div className="syn-spot-orderbook-content-buy">
            {_.cloneDeep(data?.left)
              ?.sort((a, b) => b.price - a.price)
              .map((item, index) => {
                const tokenSize = isToken0 ? item.token0Sum : item.token1Sum;
                const tokenSum = isToken0 ? item.token0Sum : item.token1Sum;
                const bodyPercent = tokenSum / largestTokenSum;

                return (
                  <div key={`buy_${index}`} className={classNames('syn-spot-orderbook-row buy')}>
                    <div className="syn-spot-orderbook-row-item">
                      <EmptyDataWrap isLoading={!item.price}>
                        {WrappedBigNumber.from(item.price).formatPriceNumberWithTooltip()}
                      </EmptyDataWrap>
                    </div>
                    <div className="syn-spot-orderbook-row-item">
                      <EmptyDataWrap isLoading={!tokenSize}>
                        {WrappedBigNumber.from(tokenSize).formatNumberWithTooltip({
                          isShowTBMK: true,
                        })}
                      </EmptyDataWrap>
                    </div>
                    <div className="syn-spot-orderbook-row-item">
                      <EmptyDataWrap isLoading={!tokenSum}>
                        {WrappedBigNumber.from(tokenSum).formatNumberWithTooltip({
                          isShowTBMK: true,
                        })}
                      </EmptyDataWrap>
                    </div>
                    <div className="syn-spot-orderbook-row-item-bg-wrap">
                      <div className="syn-spot-orderbook-row-item-bg-wrap">
                        {[...item.dexes].reverse().map((item, i) => (
                          <div
                            key={`${i}_${item.percent}_buy`}
                            className={classNames('syn-spot-orderbook-row-item-bg', greenColors[i])}
                            style={{
                              width: `${bodyPercent * 100 * (item.percent || 0)}%`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </OrderBookSkeleton>
        {!loading && (
          <div className="syn-spot-orderbook-content-label">
            {dexNames?.map((item, i) => (
              <div key={`${i}_{item}_buy`} className={classNames('syn-spot-orderbook-content-label-item')}>
                <div className={classNames('syn-spot-orderbook-content-label-item-square', greenColors[i])} />
                {item}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default SpotOrderbook;
