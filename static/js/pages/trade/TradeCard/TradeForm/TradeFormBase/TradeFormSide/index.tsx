/**
 * @description Component-TradeFormSide
 */
import './index.less';

import { CHAIN_ID } from '@derivation-tech/context';
import { Side } from '@synfutures/sdks-perp';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Tabs from '@/components/Tabs';
import { useTradeSide } from '@/features/trade/hooks';
interface IPropTypes {
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  chainId: CHAIN_ID | undefined;
  onSideChange: (key: string) => void;
}
const TradeFormSide: FC<IPropTypes> = function ({ chainId, onSideChange, disabled }) {
  const tradeSide = useTradeSide(chainId);
  const { t } = useTranslation();
  const tradeSides = useMemo(() => {
    return [
      { label: t('common.buyUpper'), key: Side.LONG.toString(), value: Side.LONG.toString(), tabClass: 'LONG' },
      { label: t('common.sellUpper'), key: Side.SHORT.toString(), value: Side.SHORT.toString(), tabClass: 'SHORT' },
    ];
  }, [t]);
  return (
    <Tabs
      className="syn-trade-form-side-tabs"
      showSegment={true}
      disabled={disabled}
      onClick={(key) => !disabled && onSideChange(key)}
      value={tradeSide.toString().trim()}
      tabList={tradeSides}
    />
  );
};

export default TradeFormSide;
