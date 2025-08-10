/**
 * @description Component-FeeTooltip
 */
import { WrappedInstrument } from '@/entities/WrappedInstrument';
import './index.less';

import { ADDITIONAL_FEE_LINK } from '@/constants/links';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { BigNumber } from 'ethers';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import LeanMoreToolTip from '../LeanMoreToolTip';
interface IPropTypes {
  className?: string;
  instrument: WrappedInstrument | undefined;
  fee: BigNumber;
  stablityFee: BigNumber;
}
const FeeTooltip: FC<IPropTypes> = function ({ fee, instrument, stablityFee }) {
  const { t } = useTranslation();
  const additionalFee = useMemo(() => WrappedBigNumber.from(stablityFee), [stablityFee]);
  const tradingFee = useMemo(() => WrappedBigNumber.from(fee).min(additionalFee), [additionalFee, fee]);
  return additionalFee.gt(0) ? (
    <LeanMoreToolTip
      link={ADDITIONAL_FEE_LINK}
      className="syn-fee-tooltip"
      overlayInnerStyle={{ width: 280 }}
      title={
        <div className="syn-fee-tooltip-container">
          <div className="syn-fee-tooltip-container-title">{t('tooltip.portfolio.history.tradeHistory.totalFee')}</div>
          <dl>
            <dt>{t('tooltip.portfolio.history.tradeHistory.tradingFee')}</dt>
            <dd>
              {tradingFee.formatNumberWithTooltip({
                suffix: instrument?.marginToken.symbol,
              })}
            </dd>
          </dl>
          <dl>
            <dt>{t('tooltip.portfolio.history.tradeHistory.additionalFee')}</dt>
            <dd>
              {additionalFee.formatNumberWithTooltip({
                suffix: instrument?.marginToken.symbol,
              })}
            </dd>
          </dl>
        </div>
      }>
      {WrappedBigNumber.from(fee).formatNumberWithTooltip({
        suffix: instrument?.marginToken.symbol,
        showToolTip: false,
      })}
    </LeanMoreToolTip>
  ) : (
    <>
      {WrappedBigNumber.from(fee).formatNumberWithTooltip({
        suffix: instrument?.marginToken.symbol,
      })}
    </>
  );
};

export default FeeTooltip;
