/**
 * @description Component-RemoveLiqFormDetail
 */
import './index.less';

import { Side } from '@synfutures/sdks-perp';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Message } from '@/components/Message';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { useMainPosition } from '@/features/account/positionHook';
import { useCurrentRange } from '@/features/account/rangeHook';
import { useRemoveLiquidationSimulation } from '@/features/earn/hook';
import { useCurrentPairByDevice } from '@/features/pair/hook';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import TradeSide from '@/pages/components/TradeSide';
import { calcEquity } from '@/utils/position';
import { calcRemovedPositionEntryPrice } from '@/utils/trade';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
}
const RemoveLiqFormDetail: FC<IPropTypes> = function ({}) {
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const { t } = useTranslation();
  const currentPair = useCurrentPairByDevice(chainId);
  const currentPosition = useMainPosition(chainId, userAddr, currentPair?.id);
  const range = useCurrentRange(chainId, userAddr);
  const simulation = useRemoveLiquidationSimulation(chainId);
  const netPosition = useMemo(
    () => simulation?.data?.simulationMainPosition.size.sub(currentPosition?.size || 0),
    [currentPosition?.size, simulation?.data?.simulationMainPosition.size],
  );
  const netSide = useMemo(
    () =>
      // currentPair ? getAdjustTradeSide(netPosition?.gt(0) ? Side.LONG : Side.SHORT, currentPair?.isInverse) : undefined,
      currentPair ? (netPosition?.gt(0) ? Side.LONG : Side.SHORT) : undefined,
    [currentPair, netPosition],
  );

  const removedPositionEntryPrice = useMemo(
    () =>
      currentPair?.sqrtPX96 &&
      range?.sqrtEntryPX96 &&
      calcRemovedPositionEntryPrice(
        currentPair?.sqrtPX96,
        range?.sqrtEntryPX96,
        currentPair?.isInverse,
      ).formatPriceNumberWithTooltip(),
    [currentPair?.sqrtPX96, range?.sqrtEntryPX96, currentPair?.isInverse],
  );

  if (!simulation) {
    return null;
  }
  return simulation.message ? (
    <Message msg={t(simulation.message || '')} status="warning" />
  ) : (
    <div className="syn-remove-liq-form-detail">
      <div className="syn-remove-liq-form-detail-change">
        <dl>
          <dt>
            <div className="syn-remove-liq-form-detail-change-title"> {t('common.earn.valueRemove')}</div>
            <div className="syn-remove-liq-form-detail-change-subtitle">({t('common.earn.includeFee')})</div>
          </dt>
          <div className="syn-remove-liq-form-detail-line"></div>
          <dd>
            {simulation?.data?.simulatePositionRemoved &&
              currentPair &&
              calcEquity(simulation?.data?.simulatePositionRemoved, currentPair).formatNumberWithTooltip({
                suffix: range?.rootInstrument.marginToken.symbol,
              })}
          </dd>
        </dl>
      </div>
      {/* )} */}
      {(!simulation.data?.simulationMainPosition?.size.eq(0) ||
        simulation.data?.simulationMainPosition?.balance.lt(0)) && (
        <div className="syn-remove-liq-form-detail-container">
          <div className="syn-remove-liq-form-detail-container-title">{t('common.earn.removeDetailTitle')}</div>
          <div className="syn-remove-liq-form-detail-container-data">
            <dl>
              <dt>{t('common.earn.netP')}</dt>
              <div className="syn-remove-liq-form-detail-line"></div>
              <dd>
                {netSide && <TradeSide side={netSide} />}
                <span>
                  {WrappedBigNumber.from(netPosition || 0)
                    .abs()
                    .formatNumberWithTooltip({
                      suffix: range?.rootInstrument.baseToken.symbol,
                    })}
                </span>
              </dd>
            </dl>
            {currentPair && range && (
              <dl>
                <dt>{t('common.earn.positionEntryPrice')}</dt>
                <div className="syn-remove-liq-form-detail-line"></div>
                <dd>
                  <span>{removedPositionEntryPrice}</span>
                </dd>
              </dl>
            )}
            <dl>
              <dt>{t('common.earn.removedPrice')}</dt>
              <div className="syn-remove-liq-form-detail-line"></div>
              <dd>
                <span>{WrappedBigNumber.from(currentPair?.fairPrice || 0).formatPriceNumberWithTooltip()}</span>
              </dd>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
};

export default RemoveLiqFormDetail;
