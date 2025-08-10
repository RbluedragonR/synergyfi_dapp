/**
 * @description Component-TradeFormSideMobile
 */
import './index.less';

import { Side } from '@synfutures/sdks-perp';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import SynTab from '@/components/SynTab';
import { FETCHING_STATUS } from '@/constants';
import { CHAIN_ID } from '@/constants/chain';
import { useLimitFormStatus, useMarketFormStateStatus, useTradeSide } from '@/features/trade/hooks';
interface IPropTypes {
  className?: string;
  chainId: CHAIN_ID | undefined;
  onSideChange: (key: string) => void;
}
const TradeFormSideMobile: FC<IPropTypes> = function ({ chainId, onSideChange }) {
  const tradeSide = useTradeSide(chainId);
  const { t } = useTranslation();
  const marketFormStatus = useMarketFormStateStatus(chainId);
  const limitFormStatus = useLimitFormStatus(chainId);
  const disabled = useMemo(
    () => marketFormStatus === FETCHING_STATUS.FETCHING || limitFormStatus === FETCHING_STATUS.FETCHING,
    [limitFormStatus, marketFormStatus],
  );
  const tradeSides = useMemo(() => {
    return [
      {
        label: <span className="long">{t('common.buyUpper')}</span>,
        key: Side.LONG.toString(),
        value: Side.LONG.toString(),
        tabClass: 'LONG',
      },
      {
        label: <span className="short"> {t('common.sellUpper')}</span>,
        key: Side.SHORT.toString(),
        value: Side.SHORT.toString(),
        tabClass: 'SHORT',
      },
    ];
  }, [t]);
  return (
    <SynTab
      className="syn-trade-form-side-mobile"
      onChange={(key) => !disabled && onSideChange(key)}
      disabled={disabled}
      activeKey={tradeSide.toString().trim()}
      items={tradeSides}
    />
  );
};

export default TradeFormSideMobile;
