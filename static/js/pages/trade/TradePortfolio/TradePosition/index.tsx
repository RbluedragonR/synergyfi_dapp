/**
 * @description Component-TradePosition
 */
import './index.less';

import { ReactComponent as ArrowRight } from '@/assets/svg/arrow-right.svg';
import { ReactComponent as WarningYellow } from '@/assets/svg/icon_warning_yellow.svg';
import { SocialLossAlert } from '@/components/Alert/SocialLossAlert';
import Empty from '@/components/Empty';
import { EmptyDataWrap } from '@/components/EmptyDataWrap';
import { IconToolTip } from '@/components/ToolTip';
import LeanMoreToolTip from '@/components/ToolTip/LeanMoreToolTip';
import PnlTitleToolTip from '@/components/ToolTip/PnlTitleToolTip';
import UnderlineToolTip from '@/components/ToolTip/UnderlineToolTip';
import { UnrealizedPnlTooltip } from '@/components/ToolTip/UnrealizedPnlTooltip';
import { FAQ_LINKS } from '@/constants/links';
import { TRADE_TYPE } from '@/constants/trade';

import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useMainPosition } from '@/features/account/positionHook';
import { usePnlShareModal, useTheme } from '@/features/global/hooks';
import { useCurrentPairFromUrl, usePairDisabledForLimit } from '@/features/pair/hook';
import { setTradeFormType } from '@/features/trade/actions';
import {
  useAdjustMarginSimulation,
  useCloseSimulation,
  useCrossMarketSimulation,
  useMarketFormState,
  useMarketSimulation,
  useTradeType,
} from '@/features/trade/hooks';
import { useAppDispatch } from '@/hooks';
import { usePriceBasisForPnl } from '@/hooks/usePriceBasisForPnl';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { toBN } from '@/utils/numberUtil';
import { Side } from '@synfutures/sdks-perp';
import classNames from 'classnames';
import React, { FC, useCallback, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useMediaQuery } from 'react-responsive';

import ShareIcon from '@/assets/svg/icons/share';
import { Button } from '@/components/Button';
import { WRAPPED_ZERO } from '@/constants/bigNumber';
import { DAPP_CHAIN_CONFIGS } from '@/constants/chain';
import { EARN_TYPE } from '@/constants/earn';
import { MARK_FAIR_DEV_THRESHHOLD } from '@/constants/global';
import { resetLiquidityFormByChainId } from '@/features/earn/action';
import { useEarnFormType, useRemoveLiquidationSimulation } from '@/features/earn/hook';
import useReverseLimitOrderInput from '@/hooks/trade/useReverseLimitOrderInput';
import { Flex } from 'antd';
import { Link, useLocation } from 'react-router-dom';
interface IPropTypes {
  children?: React.ReactNode;
}
const TradePosition: FC<IPropTypes> = function ({}) {
  const { pathname } = useLocation();
  const { priceBasisForPnl } = usePriceBasisForPnl();
  const { t } = useTranslation();
  const { dataTheme } = useTheme();
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const tradeType = useTradeType(chainId);
  const earnType = useEarnFormType(chainId);
  const currentPair = useCurrentPairFromUrl(chainId);
  const currentPosition = useMainPosition(chainId, userAddr, currentPair?.id);
  const reverseLimitOrderInput = useReverseLimitOrderInput(currentPosition);
  // const positionFetchingStatus = usePositionStatus(chainId, userAddr, currentPair?.id);
  const adjustMarginSimulation = useAdjustMarginSimulation(chainId);
  const marketSimulation = useMarketSimulation(chainId);
  const closePositionSimulation = useCloseSimulation(chainId);
  const lessThan1440 = useMediaQuery({ maxWidth: 1440 });
  const marketState = useMarketFormState(chainId);
  const crossMarketSimulation = useCrossMarketSimulation(chainId);
  const removeLiquiditySimulation = useRemoveLiquidationSimulation(chainId);

  const { inDisabledPairs } = usePairDisabledForLimit(currentPair);
  const marketFairHighDerivation = useMemo(
    () =>
      currentPair
        ?.wrapAttribute('fairPrice')
        .min(currentPair.wrapAttribute('markPrice'))
        .abs()
        .div(currentPair.wrapAttribute('markPrice'))
        .gte(MARK_FAIR_DEV_THRESHHOLD),
    [currentPair],
  );

  const removedNetPositionHasSize = useMemo(() => {
    return (
      !removeLiquiditySimulation?.data?.simulationMainPosition?.size?.sub(currentPosition?.size || 0)?.eq(0) &&
      !removeLiquiditySimulation?.data?.simulationMainPosition?.size?.eq(0)
    );
  }, [currentPosition?.size, removeLiquiditySimulation?.data?.simulationMainPosition.size]);

  const simulationPositionAfter = useMemo(() => {
    if (pathname.includes('/earn')) {
      if (earnType === EARN_TYPE.REMOVE_LIQ && removedNetPositionHasSize)
        return removeLiquiditySimulation?.data?.simulationMainPosition;
    } else if (tradeType === TRADE_TYPE.MARKET) {
      if (WrappedBigNumber.from(marketState.baseAmount).notEq(0)) {
        return marketSimulation?.data?.simulationMainPosition;
      }
    } else if (tradeType === TRADE_TYPE.ADJUST_MARGIN) {
      return adjustMarginSimulation?.data?.simulationMainPosition;
    } else if (tradeType === TRADE_TYPE.CLOSE_POSITION) {
      return closePositionSimulation?.data?.simulationMainPosition;
    } else if (tradeType === TRADE_TYPE.LIMIT) {
      return crossMarketSimulation?.data?.tradeSimulation?.simulationMainPosition;
    }
  }, [
    adjustMarginSimulation?.data?.simulationMainPosition,
    closePositionSimulation?.data?.simulationMainPosition,
    crossMarketSimulation?.data?.tradeSimulation?.simulationMainPosition,
    earnType,
    marketSimulation?.data?.simulationMainPosition,
    marketState.baseAmount,
    pathname,
    removeLiquiditySimulation?.data?.simulationMainPosition,
    removedNetPositionHasSize,
    tradeType,
  ]);
  const leverage = useMemo(() => {
    if (pathname.includes('/earn')) {
      if (earnType === EARN_TYPE.REMOVE_LIQ && removedNetPositionHasSize)
        return WrappedBigNumber.from(removeLiquiditySimulation?.data?.simulationMainPosition?.leverageWad || 0);
    } else if (tradeType === TRADE_TYPE.MARKET) {
      return WrappedBigNumber.from(marketSimulation?.data?.leverage || 0);
    } else if (tradeType === TRADE_TYPE.ADJUST_MARGIN) {
      return WrappedBigNumber.from(adjustMarginSimulation?.data?.leverageWad || 0);
    } else if (tradeType === TRADE_TYPE.CLOSE_POSITION) {
      return WrappedBigNumber.from(closePositionSimulation?.data?.leverage || 0);
    } else if (tradeType === TRADE_TYPE.LIMIT) {
      return WrappedBigNumber.from(crossMarketSimulation?.data?.tradeSimulation?.leverage || 0);
    }
  }, [
    adjustMarginSimulation?.data?.leverageWad,
    closePositionSimulation?.data?.leverage,
    crossMarketSimulation?.data?.tradeSimulation?.leverage,
    earnType,
    marketSimulation?.data?.leverage,
    pathname,
    removeLiquiditySimulation,
    removedNetPositionHasSize,
    tradeType,
  ]);

  const marginAfterSimulation = useMemo(() => {
    if (pathname.includes('/earn')) {
      if (earnType === EARN_TYPE.REMOVE_LIQ && removedNetPositionHasSize)
        return removeLiquiditySimulation?.data?.simulationMainPosition.size.eq(0)
          ? WRAPPED_ZERO
          : removeLiquiditySimulation?.data?.simulationMainPosition?.equity;
    } else if (tradeType === TRADE_TYPE.MARKET) {
      return marketSimulation?.data?.simulationMainPosition.size.eq(0)
        ? WrappedBigNumber.ZERO
        : marketSimulation?.data?.margin.add(currentPosition?.equity || 0);
    } else if (tradeType === TRADE_TYPE.CLOSE_POSITION) {
      return closePositionSimulation?.data?.simulationMainPosition.size.eq(0)
        ? WrappedBigNumber.ZERO
        : closePositionSimulation?.data?.simulationMainPosition.equity;
    } else if (tradeType === TRADE_TYPE.ADJUST_MARGIN && adjustMarginSimulation?.data?.transferAmount) {
      return currentPosition?.equity.add(WrappedBigNumber.from(adjustMarginSimulation?.data?.transferAmount || 0));
    } else if (tradeType === TRADE_TYPE.LIMIT) {
      return crossMarketSimulation?.data?.tradeSimulation?.simulationMainPosition.size.eq(0)
        ? WrappedBigNumber.ZERO
        : crossMarketSimulation?.data?.tradeSimulation?.margin.add(currentPosition?.equity || 0);
    }
    return undefined;
  }, [
    pathname,
    tradeType,
    adjustMarginSimulation?.data?.transferAmount,
    earnType,
    removedNetPositionHasSize,
    removeLiquiditySimulation?.data?.simulationMainPosition.size,
    removeLiquiditySimulation?.data?.simulationMainPosition?.equity,
    marketSimulation?.data?.simulationMainPosition.size,
    marketSimulation?.data?.margin,
    currentPosition?.equity,
    closePositionSimulation?.data?.simulationMainPosition.size,
    closePositionSimulation?.data?.simulationMainPosition.equity,
    crossMarketSimulation?.data?.tradeSimulation?.simulationMainPosition.size,
    crossMarketSimulation?.data?.tradeSimulation?.margin,
  ]);

  const hasPosition = useMemo(() => {
    return currentPosition?.hasPosition;
  }, [currentPosition?.hasPosition]);

  const positionBgClass = useMemo(() => {
    if (simulationPositionAfter) {
      if (simulationPositionAfter?.wrappedSide === Side.LONG) {
        if (currentPosition?.wrappedSide === Side.SHORT) {
          return 'short-long';
        } else {
          return 'long';
        }
      } else if (simulationPositionAfter.wrappedSide === Side.FLAT) {
        if (currentPosition?.wrappedSide === Side.SHORT) {
          return 'short';
        }
        if (currentPosition?.wrappedSide === Side.LONG) {
          return 'long';
        }
      } else {
        if (currentPosition?.wrappedSide === Side.LONG) {
          return 'long-short';
        } else {
          return 'short';
        }
      }
    } else {
      if (currentPosition?.wrappedSide === Side.LONG) {
        return 'long';
      }
      if (currentPosition?.wrappedSide === Side.SHORT) {
        return 'short';
      }
    }

    return 'long';
  }, [currentPosition?.wrappedSide, simulationPositionAfter]);

  const sizeDisplay = useMemo(() => {
    if (simulationPositionAfter) {
      if (!simulationPositionAfter?.size.eq(currentPosition?.size || 0)) {
        return (
          <div className="syn-trade-position-position-value">
            <span className="syn-trade-position-position-value-left">
              {currentPosition?.size.eq(0)
                ? t('common.tradePage.none')
                : currentPosition?.wrapAttribute('size').formatNumberWithTooltip({
                    suffix: simulationPositionAfter?.wrapAttribute('size').notEq(0)
                      ? undefined
                      : currentPosition.rootInstrument.baseToken.symbol,
                    isShowTBMK: true,
                  })}
              <ArrowRight />{' '}
            </span>
            <span className="syn-trade-position-position-value-right">
              {simulationPositionAfter?.wrapAttribute('size').eq(0)
                ? t('common.tradePage.none')
                : simulationPositionAfter?.wrapAttribute('size').formatNumberWithTooltip({
                    suffix: simulationPositionAfter.rootInstrument.baseToken.symbol,
                    isShowTBMK: true,
                  })}
            </span>
          </div>
        );
      }
    }

    return (
      <div className="syn-trade-position-position-value" style={{ flexDirection: 'column' }}>
        <div
          className={classNames('syn-trade-position-rloi', { disabled: inDisabledPairs })}
          onClick={() => !inDisabledPairs && reverseLimitOrderInput()}>
          {currentPosition?.size?.eq(0)
            ? ''
            : currentPosition?.wrapAttribute('size').formatNumberWithTooltip({
                suffix: currentPosition.rootInstrument.baseToken.symbol,
                isShowTBMK: true,
              })}
        </div>
        <span className="syn-trade-position-position-value bottom">
          {currentPosition?.size?.eq(0)
            ? ''
            : currentPosition?.sizeInQuoteToken.formatNumberWithTooltip({
                prefix: '≈ ',
                suffix: currentPosition.rootInstrument.quoteToken.symbol,
                isShowTBMK: true,
              })}
        </span>
      </div>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPosition?.size, simulationPositionAfter?.size, t]);
  // const { isMockSkeleton } = useMockDevTool();
  // const loading = positionFetchingStatus !== FETCHING_STATUS.DONE || isMockSkeleton;
  return (
    <div>
      <div className={classNames('syn-trade-position', !hasPosition && 'syn-trade-position-no-position', dataTheme)}>
        {!simulationPositionAfter && !hasPosition ? (
          <Empty></Empty>
        ) : (
          <>
            <div className={classNames(`syn-trade-position-position`, positionBgClass)}>
              <Flex vertical className="syn-trade-position-position-position-wrapper" gap={8}>
                <div className="syn-trade-position-position-action">
                  {currentPosition?.size?.eq(0) ? (
                    <span className="syn-trade-position-position-action-none">{t('common.tradePage.none')}</span>
                  ) : (
                    <span className={Side[currentPosition?.wrappedSide || Side.FLAT].toString()}>
                      {Side[currentPosition?.wrappedSide || Side.FLAT].toString()}
                    </span>
                  )}

                  {simulationPositionAfter && simulationPositionAfter?.wrappedSide !== currentPosition?.wrappedSide && (
                    <>
                      <ArrowRight />{' '}
                      {simulationPositionAfter.size.eq(0) ? (
                        <span className="syn-trade-position-position-action-none">{t('common.tradePage.none')}</span>
                      ) : (
                        <span className={Side[simulationPositionAfter?.wrappedSide || Side.FLAT].toString()}>
                          {Side[simulationPositionAfter?.wrappedSide || Side.FLAT].toString()}
                        </span>
                      )}
                    </>
                  )}
                </div>

                <div className="syn-trade-position-position-value">{sizeDisplay}</div>
              </Flex>
            </div>
            <div className="syn-trade-position-item">
              <dl>
                <dt>{t('common.leverage')}</dt>
                <dd className="leverage">
                  <EmptyDataWrap isLoading={!currentPosition?.leverageWad}>
                    {!simulationPositionAfter
                      ? currentPosition?.wrapAttribute('leverageWad').formatLeverageWithTooltip()
                      : ''}
                    {simulationPositionAfter && (
                      <>
                        <span className="syn-trade-position-item-badge">
                          {currentPosition?.wrapAttribute('leverageWad').formatLeverageWithTooltip()}
                        </span>
                        <ArrowRight />
                        <span className="syn-trade-position-item-after">{leverage?.formatLeverageWithTooltip()}</span>
                        {marketSimulation?.data?.exceedMaxLeverage && leverage?.notEq(0) && (
                          <IconToolTip
                            icon={<WarningYellow />}
                            // link={LEVERAGE_LINK}
                            title={t('tooltip.tradePage.leverageNotReached')}
                          />
                        )}
                      </>
                    )}
                  </EmptyDataWrap>
                </dd>
              </dl>
              <dl>
                <dt>
                  <LeanMoreToolTip
                    link={FAQ_LINKS.LIQUIDATION_PRICE}
                    title={
                      simulationPositionAfter?.wrappedSide === Side.LONG || currentPosition?.wrappedSide === Side.LONG
                        ? t('tooltip.tradePage.liquidationPriceLong')
                        : t('tooltip.tradePage.liquidationPriceShort')
                    }>
                    {lessThan1440 ? t('common.liqPShort') : t('common.liqP')}
                  </LeanMoreToolTip>
                </dt>
                <dd>
                  <EmptyDataWrap isLoading={!currentPosition?.liquidationPrice}>
                    {!simulationPositionAfter
                      ? currentPosition?.wrapAttribute('liquidationPrice').formatLiqPriceNumberWithTooltip()
                      : ''}
                    {simulationPositionAfter && (
                      <>
                        <span className="syn-trade-position-item-badge">
                          {currentPosition?.wrapAttribute('liquidationPrice').formatLiqPriceNumberWithTooltip()}
                        </span>
                        <ArrowRight />
                        <span className="syn-trade-position-item-after">
                          {simulationPositionAfter?.wrapAttribute('liquidationPrice').formatLiqPriceNumberWithTooltip()}
                        </span>
                      </>
                    )}
                  </EmptyDataWrap>
                </dd>
              </dl>

              <dl>
                <dt>{lessThan1440 ? t('common.avgPShort') : t('common.avgP')}</dt>
                <dd>
                  <EmptyDataWrap isLoading={!currentPosition?.entryPrice}>
                    {!simulationPositionAfter
                      ? currentPosition?.wrapAttribute('entryPrice').formatPriceNumberWithTooltip()
                      : ''}
                    {simulationPositionAfter && (
                      <>
                        <span className="syn-trade-position-item-badge">
                          {currentPosition?.wrapAttribute('entryPrice').formatPriceNumberWithTooltip()}
                        </span>
                        <ArrowRight />
                        <span className="syn-trade-position-item-after">
                          {simulationPositionAfter?.wrapAttribute('entryPrice').formatPriceNumberWithTooltip()}
                        </span>
                      </>
                    )}
                  </EmptyDataWrap>
                </dd>
              </dl>
            </div>
            <div className="syn-trade-position-item">
              <dl>
                <dt>
                  <UnderlineToolTip title={t('tooltip.table.margin')}>{t('common.margin')}</UnderlineToolTip>
                </dt>
                <dd>
                  <EmptyDataWrap isLoading={!currentPosition?.balance}>
                    {!marginAfterSimulation ? (
                      <span>
                        {currentPosition?.equity.formatNumberWithTooltip({
                          suffix: currentPosition.rootInstrument.marginToken.symbol,
                        })}
                      </span>
                    ) : (
                      ''
                    )}
                    {marginAfterSimulation && (
                      <>
                        <span className="syn-trade-position-item-badge">
                          {' '}
                          {currentPosition?.equity.formatNumberWithTooltip()}
                        </span>
                        <ArrowRight />
                        <span className="syn-trade-position-item-after">
                          {marginAfterSimulation?.formatNumberWithTooltip({
                            suffix: currentPosition?.rootInstrument.marginToken.symbol,
                          })}
                        </span>
                      </>
                    )}
                  </EmptyDataWrap>
                </dd>
              </dl>
              <dl>
                <dt>
                  <PnlTitleToolTip /> {marketFairHighDerivation && <WarningYellow />}
                </dt>
                <dd>
                  <EmptyDataWrap isLoading={!currentPosition?.getUnrealizedPositionPnlWithoutFunding(priceBasisForPnl)}>
                    {currentPosition?.unrealizedSocialLoss.lte(0) ? (
                      <>
                        {currentPosition
                          ?.getUnrealizedPositionPnlWithoutFunding(priceBasisForPnl)
                          .formatNumberWithTooltip({
                            suffix: currentPosition.rootInstrument.marginToken.symbol,
                            isShowTBMK: true,
                            colorShader: true,
                            showPositive: true,
                            colorSuffix: true,
                            isShowApproximatelyEqualTo: false,
                          })}
                        {currentPosition?.equity.gt(0) &&
                          currentPosition?.getUnrealizedPnlPercentage(priceBasisForPnl).formatPercentage({
                            decimals: 2,
                            suffix: ')',
                            prefix: '(',
                            isHiddenIfZero: true,
                          })}
                      </>
                    ) : (
                      <UnderlineToolTip
                        overlayInnerStyle={{ width: 'fit-content' }}
                        colorShaderProps={{
                          num: currentPosition?.getUnrealizedPositionPnlWithoutFunding(priceBasisForPnl) || toBN(0),
                        }}
                        title={<UnrealizedPnlTooltip position={currentPosition} />}>
                        {currentPosition
                          ?.getUnrealizedPositionPnlWithoutFunding(priceBasisForPnl)
                          .formatNumberWithTooltip({
                            suffix: currentPosition.rootInstrument.marginToken.symbol,
                            isShowTBMK: true,
                            colorShader: true,
                            showPositive: true,
                            colorSuffix: true,
                            isShowApproximatelyEqualTo: false,
                            showToolTip: false,
                          })}
                        {currentPosition?.equity.gt(0) &&
                          currentPosition?.getUnrealizedPnlPercentage(priceBasisForPnl).formatPercentage({
                            decimals: 2,
                            suffix: ')',
                            prefix: '(',
                            isHiddenIfZero: true,
                          })}
                      </UnderlineToolTip>
                    )}
                  </EmptyDataWrap>
                </dd>
              </dl>
              {currentPair?.isPerpetual && (
                <dl>
                  <dt>
                    <LeanMoreToolTip
                      link={FAQ_LINKS.PREDICTED_FUNDING_RATE}
                      overlayInnerStyle={{ width: 270 }}
                      title={
                        <Trans
                          i18nKey={'common.tradePage.tradePosition.unRealizedFundingTooltip'}
                          components={{ b: <b /> }}
                        />
                      }>
                      {t('common.unrealizedFunding')}
                    </LeanMoreToolTip>{' '}
                  </dt>
                  <dd>
                    <EmptyDataWrap isLoading={!currentPosition?.unrealizedFundingFee}>
                      {currentPosition?.wrapAttribute('unrealizedFundingFee').formatNumberWithTooltip({
                        suffix: currentPosition.rootInstrument.marginToken.symbol,
                        isShowTBMK: true,
                        colorShader: true,
                        showPositive: true,
                        colorSuffix: true,
                        isShowApproximatelyEqualTo: false,
                      })}
                    </EmptyDataWrap>
                  </dd>
                </dl>
              )}
            </div>
          </>
        )}
      </div>
      <div>
        <SocialLossAlert position={currentPosition} />
      </div>
    </div>
  );
};

interface TradePositionCardPropTypes {
  children?: React.ReactNode;
  className?: string;
  pairSymbol?: string;
}
export const TradePositionCard: FC<TradePositionCardPropTypes> = function ({ className, pairSymbol }) {
  const { t } = useTranslation();
  const { togglePnlShareModal, isOpenModal } = usePnlShareModal();
  const chainId = useChainId();
  const dispatch = useAppDispatch();
  const tradeType = useTradeType(chainId);
  const closePosition = useCallback(() => {
    if (tradeType !== TRADE_TYPE.CLOSE_POSITION) {
      chainId &&
        dispatch(
          setTradeFormType({
            chainId,
            tradeType: TRADE_TYPE.CLOSE_POSITION,
          }),
        );
      chainId && dispatch(resetLiquidityFormByChainId({ chainId }));
    }
  }, [chainId, dispatch, tradeType]);
  const userAddr = useUserAddr();
  const currentPair = useCurrentPairFromUrl(chainId);

  const adjustMargin = useCallback(() => {
    if (tradeType !== TRADE_TYPE.ADJUST_MARGIN) {
      chainId &&
        dispatch(
          setTradeFormType({
            chainId,
            tradeType: TRADE_TYPE.ADJUST_MARGIN,
          }),
        );
      chainId && dispatch(resetLiquidityFormByChainId({ chainId }));
    }
  }, [chainId, dispatch, tradeType]);
  const currentPosition = useMainPosition(chainId, userAddr, currentPair?.id);

  return (
    <div className={classNames(className, 'syn-trade-position-card')}>
      <div className="syn-trade-position-card-header">
        <div>{t('common.position')}</div>
        {!currentPosition?.size?.eq(0) && (
          <div className="syn-trade-position-card-header-btns">
            <Link
              to={
                (chainId && pairSymbol && `/trade/${DAPP_CHAIN_CONFIGS[chainId]?.network?.shortName}/${pairSymbol}`) ||
                ''
              }
              className={classNames(tradeType === TRADE_TYPE.ADJUST_MARGIN && 'syn-btn-active')}
              onClick={adjustMargin}>
              {t('common.adjust')}
            </Link>
            <Link
              to={
                (chainId && pairSymbol && `/trade/${DAPP_CHAIN_CONFIGS[chainId]?.network?.shortName}/${pairSymbol}`) ||
                ''
              }
              className={classNames(tradeType === TRADE_TYPE.CLOSE_POSITION && 'syn-btn-active')}
              onClick={closePosition}>
              {t('common.close')}
            </Link>
            <Button className={classNames(isOpenModal && 'syn-btn-active')} onClick={() => togglePnlShareModal(true)}>
              <ShareIcon />
              {t('common.share')}
            </Button>
          </div>
        )}
      </div>
      <TradePosition />
    </div>
  );
};

export default TradePosition;
