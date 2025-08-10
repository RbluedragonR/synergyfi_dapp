import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import './index.less';

import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
type IProps = {
  interval: string;
} & TooltipProps<ValueType, NameType>;

export default function FundingTooltip({ interval, payload }: IProps): JSX.Element {
  const { t } = useTranslation();
  const { isLongPay, payRateNum, receiveRateNum, timestamp } = payload?.[0]?.payload || {
    isLongPay: true,
    payRateNum: 0,
    receiveRateNum: 0,
    timestamp: 0,
  };
  return (
    <div className="syn-funding-tooltip">
      <div className="syn-funding-tooltip-title">
        {t(`common.tradePage.${interval}`)} {t('common.tradePage.fr')}
      </div>
      <div className="syn-funding-tooltip-content">
        <div className="syn-funding-tooltip-content-left">
          <span> {isLongPay ? t('common.tradePage.longPay') : t('common.tradePage.shortPay')}</span>
          <span> {isLongPay ? t('common.tradePage.shortReceive') : t('common.tradePage.longReceive')}</span>
        </div>
        <div className="syn-funding-tooltip-content-right">
          <span>
            {WrappedBigNumber.from(payRateNum).abs().formatPriceNumberWithTooltip({
              colorShader: false,
              suffix: '%',
            })}
          </span>
          <span>
            {WrappedBigNumber.from(receiveRateNum).abs().formatPriceNumberWithTooltip({
              colorShader: false,
              suffix: '%',
            })}
          </span>
        </div>
      </div>
      <div className="syn-funding-tooltip-date">{moment(new Date(timestamp)).format('YYYY MM-DD HH:mm')}</div>
    </div>
  );
}
