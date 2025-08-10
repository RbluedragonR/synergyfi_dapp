/**
 * @description Component-TradePositionMobile
 */
import './index.less';

import { Side } from '@synfutures/sdks-perp';
import classNames from 'classnames';
import { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { SocialLossAlert } from '@/components/Alert/SocialLossAlert';
import { Button } from '@/components/Button';
import Drawer from '@/components/Drawer';
import Empty from '@/components/Empty';
import { Skeleton } from '@/components/Skeleton';
import { TRADE_TYPE } from '@/constants/trade';
import { useMainPosition } from '@/features/account/positionHook';
import { usePnlShareModal, useTheme } from '@/features/global/hooks';
import { useCurrentPairFromUrl, usePairDisabledForLimit } from '@/features/pair/hook';
import { useIsFetchedSinglePortfolio } from '@/features/portfolio/hook';
import { setTradeDrawerType } from '@/features/trade/actions';
import { useTradeDrawerType } from '@/features/trade/hooks';
import { useAppDispatch } from '@/hooks';
import useReverseLimitOrderInput from '@/hooks/trade/useReverseLimitOrderInput';
import { usePriceBasisForPnl } from '@/hooks/usePriceBasisForPnl';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import TradeSide from '@/pages/components/TradeSide';
import TradeAdjust from '@/pages/trade/TradeCard/TradeForm/TradeAdjust';
import TradeClose from '@/pages/trade/TradeCard/TradeForm/TradeClose';

interface IPropTypes {
  className?: string;
}
const TradePositionMobile: FC<IPropTypes> = function () {
  const { priceBasisForPnl } = usePriceBasisForPnl();
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const { dataTheme } = useTheme();
  const currentPair = useCurrentPairFromUrl(chainId);
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const drawerType = useTradeDrawerType(chainId);
  const currentPosition = useMainPosition(chainId, userAddr, currentPair?.id);
  const isFetchedPortfolio = useIsFetchedSinglePortfolio(
    chainId,
    userAddr,
    currentPair?.instrumentAddr,
    currentPair?.expiry,
  );

  const { togglePnlShareModal } = usePnlShareModal();
  const reverseLimitOrderInput = useReverseLimitOrderInput(currentPosition);

  const { inDisabledPairs } = usePairDisabledForLimit(currentPair);

  const closePosition = useCallback(() => {
    if (drawerType !== TRADE_TYPE.CLOSE_POSITION) {
      chainId &&
        dispatch(
          setTradeDrawerType({
            chainId,
            tradeType: TRADE_TYPE.CLOSE_POSITION,
          }),
        );
    }
  }, [chainId, dispatch, drawerType]);
  const adjust = useCallback(() => {
    if (drawerType !== TRADE_TYPE.ADJUST_MARGIN) {
      chainId &&
        dispatch(
          setTradeDrawerType({
            chainId,
            tradeType: TRADE_TYPE.ADJUST_MARGIN,
          }),
        );
    }
  }, [chainId, dispatch, drawerType]);
  const closeDrawer = useCallback(() => {
    chainId &&
      dispatch(
        setTradeDrawerType({
          chainId,
          tradeType: undefined,
        }),
      );
  }, [chainId, dispatch]);
  if (!isFetchedPortfolio) {
    return (
      <div className="syn-trade-position-mobile-skeleton">
        <div className="syn-trade-position-mobile-skeleton-top">
          <Skeleton active={true} paragraph={false} />
          <Skeleton active={true} paragraph={false} />
        </div>
        <div className="syn-trade-position-mobile-skeleton-row">
          <Skeleton active={true} paragraph={false} />
          <Skeleton active={true} paragraph={false} />
          <Skeleton active={true} paragraph={false} />
        </div>
        <div className="syn-trade-position-mobile-skeleton-row">
          <Skeleton active={true} paragraph={false} />
          <Skeleton active={true} paragraph={false} />
          <Skeleton active={true} paragraph={false} />
        </div>
      </div>
    );
  }
  return (
    <div
      className={classNames(
        'syn-trade-position-mobile',
        !currentPosition || (currentPosition?.wrappedSize.eq(0) && 'syn-trade-position-mobile-no-position'),
        dataTheme,
      )}>
      {!currentPosition || currentPosition?.wrappedSize.eq(0) ? (
        <Empty type="vertical" />
      ) : (
        <>
          <SocialLossAlert position={currentPosition} isDesktop={false} />
          <div className="syn-trade-position-mobile-top">
            <div
              style={{ flexDirection: 'column' }}
              className={classNames('syn-trade-position-mobile-top-left', Side[currentPosition?.wrappedSide])}>
              <span onClick={() => !inDisabledPairs && reverseLimitOrderInput()} style={{ display: 'flex', gap: 4 }}>
                <TradeSide side={currentPosition?.wrappedSide} />
                <div
                  style={{
                    cursor: 'pointer',
                    borderBottom: !inDisabledPairs
                      ? `1px solid ${currentPosition?.wrappedSide === Side.LONG ? 'var(--long)' : 'var(--short)'}`
                      : '',
                  }}>
                  {currentPosition.wrapAttribute('size').formatNumberWithTooltip({
                    suffix: currentPair?.rootInstrument.baseToken.symbol,
                    isShowTBMK: true,
                  })}
                </div>
              </span>
              <span
                className="syn-trade-position-mobile-top-left-bottom"
                style={{
                  color: '#969696',
                  fontSize: 12,
                }}>
                {currentPosition?.sizeInQuoteToken.formatNumberWithTooltip({
                  prefix: '≈ ',
                  suffix: currentPosition.rootInstrument.quoteToken.symbol,
                  isShowTBMK: true,
                })}
              </span>
            </div>
            <div className="syn-trade-position-mobile-top-btns">
              <Button size="small" type="outline" onClick={() => togglePnlShareModal(true)}>
                {t('common.share')}
              </Button>
              <Button size="small" type="outline" onClick={adjust}>
                {t('common.tradePage.adjustMargin.manage')}
              </Button>
              <Button size="small" type="outline" onClick={closePosition}>
                {t('common.close')}
              </Button>
            </div>
          </div>
          <div className="syn-trade-position-mobile-data">
            <dl>
              <dt>{t('mobile.leverage')}</dt>
              <dd>{currentPosition.wrapAttribute('leverageWad').formatLeverageWithTooltip()}</dd>
            </dl>
            <dl>
              <dt>{t('mobile.liqP')}</dt>
              <dd>{currentPosition.wrapAttribute('liquidationPrice').formatLiqPriceNumberWithTooltip()}</dd>
            </dl>
            <dl>
              <dt>{t('mobile.avgP')}</dt>
              <dd>{currentPosition.wrapAttribute('entryPrice').formatPriceNumberWithTooltip()}</dd>
            </dl>
          </div>
          <div className="syn-trade-position-mobile-data">
            <dl>
              <dt>
                {t('mobile.margin')} ({currentPair?.rootInstrument.marginToken.symbol})
              </dt>
              <dd>{currentPosition.equity.formatNumberWithTooltip()}</dd>
            </dl>
            <dl>
              <dt>{t('mobile.unrealPnl')}</dt>
              <dd>
                {currentPosition.getUnrealizedPositionPnlWithoutFunding(priceBasisForPnl).formatNumberWithTooltip({
                  isShowTBMK: true,
                  colorShader: true,
                  showPositive: true,
                  colorSuffix: true,
                  isShowApproximatelyEqualTo: false,
                })}
                {currentPosition.equity.gt(0) &&
                  currentPosition.getUnrealizedPnlPercentage(priceBasisForPnl).formatPercentage({
                    decimals: 2,
                    suffix: ')',
                    prefix: '(',
                    isHiddenIfZero: true,
                  })}
              </dd>
            </dl>
            {currentPair?.isPerpetual && (
              <dl>
                <dt>{t('mobile.unrealFunding')}</dt>
                <dd>
                  {currentPosition.wrapAttribute('unrealizedFundingFee').formatNumberWithTooltip({
                    isShowTBMK: true,
                    colorShader: true,
                    showPositive: true,
                    colorSuffix: true,
                    isShowApproximatelyEqualTo: false,
                  })}
                </dd>
              </dl>
            )}
          </div>
          <Drawer
            title={
              drawerType === TRADE_TYPE.ADJUST_MARGIN
                ? t('common.adjustM')
                : drawerType === TRADE_TYPE.CLOSE_POSITION
                ? t(`common.closeP`)
                : ''
            }
            height={'auto'}
            className="syn-trade-position-mobile-drawer reverse-header"
            open={drawerType !== undefined}
            placement="bottom"
            afterOpenChange={(open) => {
              if (open) {
                if (drawerType === TRADE_TYPE.ADJUST_MARGIN) {
                }
              }
            }}
            onClose={closeDrawer}>
            {drawerType === TRADE_TYPE.ADJUST_MARGIN && <TradeAdjust onClose={closeDrawer} />}
            {drawerType === TRADE_TYPE.CLOSE_POSITION && <TradeClose onClose={closeDrawer} />}
          </Drawer>
        </>
      )}
    </div>
  );
};

export default TradePositionMobile;
