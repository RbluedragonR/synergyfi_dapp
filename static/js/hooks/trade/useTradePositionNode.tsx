import { EmptyDataWrap } from '@/components/EmptyDataWrap';
import { useMediaQueryDevice } from '@/components/MediaQuery';
import TokenPairExpiry from '@/components/TokenPair/TokenPairExpiry';
import TokenPairSymbol from '@/components/TokenPair/TokenPairSymbol';
import UnderlineToolTip from '@/components/ToolTip/UnderlineToolTip';
import { UnrealizedPnlTooltip } from '@/components/ToolTip/UnrealizedPnlTooltip';
import { SecondGlobalModalType } from '@/constants';
import { useMainPosition } from '@/features/account/positionHook';
import { useSecondModalOpen } from '@/features/global/hooks';
import { useCurrentPairFromUrl } from '@/features/pair/hook';
import { usePnsShareParams } from '@/features/trade/hooks';
import { usePriceBasisForPnl } from '@/hooks/usePriceBasisForPnl';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { toBN } from '@/utils/numberUtil';
import { Side } from '@synfutures/sdks-perp';
import { useMemo } from 'react';

export default function useTradePositionNode() {
  const { priceBasisForPnl } = usePriceBasisForPnl();
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const currentPairMobile = useCurrentPairFromUrl(chainId);
  const currentPairDefault = useCurrentPairFromUrl(chainId);
  const { isNotMobile } = useMediaQueryDevice();
  const currentPair = isNotMobile ? currentPairDefault : currentPairMobile;
  const currentPosition = useMainPosition(chainId, userAddr, currentPair?.id);
  const isOpenModal = useSecondModalOpen(SecondGlobalModalType.PNL_SHARE_NOTIFICATION);
  const pnlParams = usePnsShareParams(chainId);

  const tradePositionNode = useMemo(() => {
    return isOpenModal
      ? {
          side: pnlParams?.side,
          pnl: pnlParams?.pnl,
          leverageNode: (
            <EmptyDataWrap isLoading={!pnlParams?.leverage}>
              {pnlParams?.leverage.formatLeverageWithTooltip()}
            </EmptyDataWrap>
          ),
          qouteToken: pnlParams?.pair.rootInstrument.quoteToken,
          tokenPairNode: pnlParams?.pair?.rootInstrument.baseToken && pnlParams.pair?.rootInstrument.quoteToken && (
            <>
              <TokenPairSymbol
                isInverse={pnlParams.pair?.rootInstrument.isInverse}
                baseToken={pnlParams.pair?.rootInstrument.baseToken}
                quoteToken={pnlParams.pair?.rootInstrument.quoteToken}
              />
              <TokenPairExpiry expiry={pnlParams.pair.expiry} />
            </>
          ),
          averagePriceNode: (
            <EmptyDataWrap isLoading={!pnlParams?.averagePrice}>
              {pnlParams?.averagePrice.formatPriceNumberWithTooltip()}
            </EmptyDataWrap>
          ),
          markPriceNode: null,
          pnlPercentNode: pnlParams?.pnlRatio.formatPercentage({
            decimals: 2,
            requirePlusSymbol: true,
            className: 'pnl-percent',
          }),
          pnlQuoteValueNode: pnlParams?.pnl.formatNumberWithTooltip({
            isShowTBMK: true,
            showPositive: true,
            colorShader: true,
            colorSuffix: true,
            isShowApproximatelyEqualTo: true,
            prefix: '(',
            suffix: pnlParams.pair.rootInstrument.marginToken.symbol + ')',
          }),
          isNotification: true,
          pnlRatio: pnlParams?.pnlRatio,
          tradePrice: pnlParams?.tradePrice,
          size: pnlParams?.size,
          averagePrice: pnlParams?.averagePrice,
          markPrice: pnlParams?.tradePrice,
          leverage: pnlParams?.leverage,
          pnlPercent: pnlParams?.pnlRatio,
          isClose: true,
        }
      : {
          side: Side[currentPosition?.wrappedSide || Side.FLAT].toString(),
          leverageNode: (
            <EmptyDataWrap isLoading={!currentPosition?.leverageWad}>
              {currentPosition?.wrapAttribute('leverageWad').formatLeverageWithTooltip()}
            </EmptyDataWrap>
          ),
          qouteToken: currentPosition?.rootInstrument.quoteToken,
          tokenPairNode: currentPosition?.rootInstrument.baseToken && currentPosition?.rootInstrument.quoteToken && (
            <>
              <TokenPairSymbol
                isInverse={currentPosition?.rootInstrument.isInverse}
                baseToken={currentPosition?.rootInstrument.baseToken}
                quoteToken={currentPosition?.rootInstrument.quoteToken}
              />
              <TokenPairExpiry expiry={currentPosition?.rootPair.expiry} />
            </>
          ),
          averagePriceNode: (
            <EmptyDataWrap isLoading={!currentPosition?.entryPrice}>
              {currentPosition?.wrapAttribute('entryPrice').formatPriceNumberWithTooltip()}
            </EmptyDataWrap>
          ),
          markPriceNode: (
            <EmptyDataWrap isLoading={!currentPair?.markPrice || currentPair?.markPrice.eq(0)}>
              {currentPair?.wrapAttribute('markPrice').formatPriceNumberWithTooltip({
                isShowTBMK: true,
              })}
            </EmptyDataWrap>
          ),
          pnlQuoteValueNode: currentPosition?.unrealizedSocialLoss.lte(0) ? (
            <>
              {currentPosition?.getUnrealizedPositionPnlWithoutFunding(priceBasisForPnl).formatNumberWithTooltip({
                prefix: '(',
                suffix: `${currentPosition.rootInstrument.marginToken.symbol})`,
                isShowTBMK: true,
                colorShader: true,
                showPositive: true,
                colorSuffix: true,
                isShowApproximatelyEqualTo: false,
              })}
            </>
          ) : (
            <UnderlineToolTip
              overlayInnerStyle={{ width: 'fit-content' }}
              colorShaderProps={{
                num: currentPosition?.getUnrealizedPositionPnlWithoutFunding(priceBasisForPnl) || toBN(0),
              }}
              title={<UnrealizedPnlTooltip position={currentPosition} />}>
              {currentPosition?.getUnrealizedPositionPnlWithoutFunding(priceBasisForPnl).formatNumberWithTooltip({
                prefix: '(',
                suffix: `${currentPosition.rootInstrument.marginToken.symbol})`,
                isShowTBMK: true,
                colorShader: true,
                showPositive: true,
                colorSuffix: true,
                isShowApproximatelyEqualTo: false,
                showToolTip: false,
              })}
            </UnderlineToolTip>
          ),
          pnlPercentNode: currentPosition?.unrealizedSocialLoss.lte(0) ? (
            <>
              {currentPosition?.equity.gt(0) &&
                currentPosition?.getUnrealizedPnlPercentage(priceBasisForPnl).formatPercentage({
                  decimals: 2,
                  requirePlusSymbol: true,
                  className: 'pnl-percent',
                })}
            </>
          ) : (
            <UnderlineToolTip
              overlayInnerStyle={{ width: 'fit-content' }}
              colorShaderProps={{
                num: currentPosition?.getUnrealizedPositionPnlWithoutFunding(priceBasisForPnl) || toBN(0),
              }}
              title={<UnrealizedPnlTooltip position={currentPosition} />}>
              {currentPosition?.equity.gt(0) &&
                currentPosition?.getUnrealizedPnlPercentage(priceBasisForPnl).formatPercentage({
                  decimals: 2,
                  requirePlusSymbol: true,
                })}
            </UnderlineToolTip>
          ),
          isNotification: false,
          pnlRaw: undefined,
          tradePrice: undefined,
          pnlRatio: currentPosition?.getUnrealizedPnlPercentage(priceBasisForPnl),
          size: currentPosition?.wrappedSize,
          averagePrice: currentPosition?.wrapAttribute('entryPrice'),
          markPrice: currentPair?.wrapAttribute('markPrice'),
          leverage: currentPosition?.wrapAttribute('leverageWad'),
          pnlPercent: currentPosition?.getUnrealizedPnlPercentage(priceBasisForPnl),
          pnl: currentPosition?.getUnrealizedPnlWithoutFunding(priceBasisForPnl),
          isClose: false,
        };
  }, [currentPair, currentPosition, isOpenModal, pnlParams, priceBasisForPnl]);
  return { tradePositionNode };
}
