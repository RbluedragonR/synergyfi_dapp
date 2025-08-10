/**
 * @description Component-TradeAjustDetail
 */
import './index.less';

import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { EmptyDataWrap } from '@/components/EmptyDataWrap';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { WrappedPosition } from '@/entities/WrappedPosition';
import { IAdjustMarginSimulation } from '@/types/trade';

import { ReactComponent as ArrowRight } from './assets/icon_arrow.svg';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  simulation: IAdjustMarginSimulation | undefined;
  currentPosition: WrappedPosition | undefined;
}
const TradeAdjustDetail: FC<IPropTypes> = function ({ currentPosition, simulation }) {
  const { t } = useTranslation();

  return (
    <div className="syn-trade-adjust-detail">
      <dl>
        <dt>{t('common.leverage')}</dt>
        <div className="syn-trade-adjust-detail-line"></div>
        <dd>
          <EmptyDataWrap isLoading={!currentPosition?.leverageWad}>
            {!simulation?.data ? currentPosition?.wrapAttribute('leverageWad').formatLeverageWithTooltip() : ''}
            {simulation?.data && (
              <>
                {currentPosition?.wrapAttribute('leverageWad').formatLeverageWithTooltip()}
                <ArrowRight />
                {WrappedBigNumber.from(simulation.data.leverageWad)?.formatLeverageWithTooltip()}
              </>
            )}
          </EmptyDataWrap>
        </dd>
      </dl>
      <dl>
        <dt>{t('common.liqPShort')}</dt>
        <div className="syn-trade-adjust-detail-line"></div>
        <dd>
          <EmptyDataWrap isLoading={!currentPosition?.liquidationPrice}>
            {!simulation?.data
              ? currentPosition?.wrapAttribute('liquidationPrice').formatLiqPriceNumberWithTooltip()
              : ''}
            {simulation?.data && (
              <>
                {currentPosition?.wrapAttribute('liquidationPrice').formatLiqPriceNumberWithTooltip()}
                <ArrowRight />

                {simulation?.data.simulationMainPosition
                  ?.wrapAttribute('liquidationPrice')
                  ?.formatLiqPriceNumberWithTooltip()}
              </>
            )}
          </EmptyDataWrap>
        </dd>
      </dl>
    </div>
  );
};

export default TradeAdjustDetail;
