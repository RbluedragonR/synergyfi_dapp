/**
 * @description Component-PriceInput
 */
import { FETCHING_STATUS } from '@/constants';
import './index.less';

import Alert from '@/components/Alert';
import { Tooltip } from '@/components/ToolTip';
import { DEFAULT_ORDER_COUNT, DEFAULT_STEP_RATIO } from '@/constants/trade';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { WrappedPair } from '@/entities/WrappedPair';
import { useGetDefaultLimitPrice, usePairLimitPriceRangeTicks } from '@/features/pair/hook';
import { setTradeFormSide } from '@/features/trade/actions';
import { useScaleFormState, useScaleFormStateStatus, useUpdatePriceByTicks } from '@/features/trade/hooks';
import { useAppDispatch } from '@/hooks';
import { useChainId } from '@/hooks/web3/useChain';
import { Side } from '@synfutures/sdks-perp';
import { useDebounceEffect, useDebounceFn } from 'ahooks';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TradeFormSide from '../TradeFormBase/TradeFormSide';
import PriceInputSlider from './PriceInputSlider';
import ScaleOrderCount from './ScaleOrderCount';

import { Context } from '@derivation-tech/context';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  currentPair: WrappedPair | undefined;
  sdkContext: Context | undefined;
  tradeSide: Side;
  lowerPrice: WrappedBigNumber | undefined;
  upperPrice: WrappedBigNumber | undefined;
  disabled?: boolean;
}
const PriceInput: FC<IPropTypes> = function ({ currentPair, disabled, sdkContext, tradeSide, lowerPrice, upperPrice }) {
  const dispatch = useAppDispatch();
  const chainId = useChainId();
  const scaleLimitFormState = useScaleFormState(chainId);
  const scaleLimitFormStatus = useScaleFormStateStatus(chainId);
  const { t } = useTranslation();
  const [sliderFocused, setSlierFocused] = useState(false);
  const updatePricesByTicks = useUpdatePriceByTicks();
  const lowerUpperTicks = usePairLimitPriceRangeTicks(currentPair, tradeSide, sdkContext);
  // const changeLimitPriceWhenOutOfRange = useScaleLimitPriceChangeWhenOutOfRange(chainId, inputFocused);
  const warningMsg = useMemo(() => {
    const lowerTick = WrappedBigNumber.from(scaleLimitFormState.lowerTick);
    if (lowerTick.gte(scaleLimitFormState.upperTick)) {
      return t('common.tradePage.warningMsg.lowerMoreThanUpper');
    }
  }, [scaleLimitFormState.lowerTick, scaleLimitFormState.upperTick, t]);
  const showAlignInfo = useMemo(
    () =>
      !warningMsg &&
      lowerPrice?.lte(scaleLimitFormState.lowerPrice || 0) &&
      upperPrice?.gte(scaleLimitFormState.upperPrice || 0) &&
      scaleLimitFormState.lowerPrice &&
      scaleLimitFormState.upperPrice &&
      (WrappedBigNumber.from(scaleLimitFormState.alignedLowerPrice || 0)?.notEq(scaleLimitFormState.lowerPrice) ||
        WrappedBigNumber.from(scaleLimitFormState.alignedUpperPrice || 0)?.notEq(
          scaleLimitFormState.alignedUpperPrice,
        )),
    [
      lowerPrice,
      scaleLimitFormState.alignedLowerPrice,
      scaleLimitFormState.alignedUpperPrice,
      scaleLimitFormState.lowerPrice,
      scaleLimitFormState.upperPrice,
      upperPrice,
      warningMsg,
    ],
  );
  const getDefaultLimitPriceTick = useGetDefaultLimitPrice(currentPair, tradeSide, sdkContext);
  const setDefaultLimitPriceTicks = useCallback(
    async (tradeSide: Side) => {
      const defaultLimit = await getDefaultLimitPriceTick(tradeSide);
      let countTicksGap = (DEFAULT_ORDER_COUNT - 1) * DEFAULT_STEP_RATIO;
      if (scaleLimitFormState.orderCount && scaleLimitFormState.stepRatio) {
        countTicksGap = scaleLimitFormState.stepRatio * (scaleLimitFormState.orderCount - 1);
      }
      if (defaultLimit && currentPair) {
        const defaultTick = defaultLimit.tick * (currentPair?.isInverse ? -1 : 1);
        if (tradeSide === Side.LONG) {
          const lowerInitialTick = defaultTick - countTicksGap;
          updatePricesByTicks(lowerInitialTick, defaultTick, currentPair);
        } else {
          const upperInitialTick = defaultTick + countTicksGap;
          updatePricesByTicks(defaultTick, upperInitialTick, currentPair);
        }
      }
    },
    [
      currentPair,
      getDefaultLimitPriceTick,
      scaleLimitFormState.orderCount,
      scaleLimitFormState.stepRatio,
      updatePricesByTicks,
    ],
  );
  const { run: onUpperLowerTicksChange } = useDebounceFn(() => {
    if (sliderFocused || !currentPair) return;
    const [lowerTick, upperTick] = lowerUpperTicks;
    const countTicksGap = (scaleLimitFormState.orderCount - 1) * scaleLimitFormState.stepRatio;
    if (lowerTick > scaleLimitFormState.lowerTick) {
      updatePricesByTicks(lowerTick, lowerTick + countTicksGap, currentPair);
    }
    if (upperTick < scaleLimitFormState.upperTick) {
      updatePricesByTicks(upperTick - countTicksGap, upperTick, currentPair);
    }
  });

  useEffect(() => {
    onUpperLowerTicksChange();
    // only this dep
  }, [lowerUpperTicks]);
  useDebounceEffect(() => {
    !scaleLimitFormState.lowerTick && setDefaultLimitPriceTicks(tradeSide);
  }, [lowerUpperTicks, scaleLimitFormState.lowerTick]);

  return (
    <>
      <TradeFormSide
        disabled={scaleLimitFormStatus === FETCHING_STATUS.FETCHING}
        chainId={chainId}
        onSideChange={(key) => {
          const tradeSide = Number(key) as Side;
          setDefaultLimitPriceTicks(tradeSide);
          chainId &&
            dispatch(
              setTradeFormSide({
                chainId,
                tradeSide,
              }),
            );
        }}
      />
      <ScaleOrderCount
        lowerLimitTick={lowerUpperTicks[0]}
        upperLimitTick={lowerUpperTicks[1]}
        tradeSide={tradeSide}
        sdkContext={sdkContext}
        pair={currentPair}
      />
      <div className="syn-scale-limit-form-section-price-adjust">
        <div className="syn-scale-limit-form-section-title">
          <span>
            {t('common.priceR')}
            {/* ({lowerPrice?.formatLiqPriceNumberWithTooltip()} -{' '}
            {upperPrice?.formatLiqPriceNumberWithTooltip()}) */}
          </span>
        </div>
        <PriceInputSlider
          decimals={currentPair?.rootInstrument.quoteToken.decimals}
          disabled={disabled}
          range={lowerUpperTicks}
          tradeSide={tradeSide}
          upperPrice={upperPrice}
          lowerPrice={lowerPrice}
          setSlierFocused={setSlierFocused}
          onChange={(values) => currentPair && updatePricesByTicks(values[0], values[1], currentPair)}
        />
        {warningMsg && <Alert type="error" showIcon={true} message={warningMsg} />}
        {showAlignInfo && (
          <Alert
            type="info"
            showIcon
            message={
              <>
                {t('common.tradePage.scaleLimitSub')}
                <Tooltip
                  overlayInnerStyle={{ width: 'fit-content' }}
                  title={`${scaleLimitFormState.alignedLowerPrice} ~ ${scaleLimitFormState.alignedUpperPrice}`}>
                  <b className="syn-scale-limit-form-section-prices-range">
                    {WrappedBigNumber.from(scaleLimitFormState.alignedLowerPrice).formatNumberWithTooltip({
                      showToolTip: false,
                    })}{' '}
                    ~{' '}
                    {WrappedBigNumber.from(scaleLimitFormState.alignedUpperPrice).formatNumberWithTooltip({
                      showToolTip: false,
                    })}
                  </b>
                </Tooltip>
              </>
            }
          />
        )}
      </div>
    </>
  );
};

export default PriceInput;
