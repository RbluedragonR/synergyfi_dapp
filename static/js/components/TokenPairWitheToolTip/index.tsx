/**
 * @description Component-TokenPairWitheToolTip
 */

import { MarketType } from '@synfutures/sdks-perp';
import { Tooltip } from 'antd';
import React, { ComponentProps, FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { WrappedOrder } from '@/entities/WrappedOrder';
import { WrappedPair } from '@/entities/WrappedPair';
import { WrappedPosition } from '@/entities/WrappedPosition';
import { WrappedRange } from '@/entities/WrappedRange';

import TokenPair from '../TokenPair';
type IPropTypes = {
  children?: React.ReactNode;
  className?: string;
  record: WrappedPair | WrappedOrder | WrappedRange | WrappedPosition;
  isShowPairSettleIcon?: boolean;
  isShowLogo?: boolean;
} & Partial<ComponentProps<typeof TokenPair>>;

const TokenPairWitheToolTip: FC<IPropTypes> = function ({
  record,
  isShowLogo = false,
  isShowPairSettleIcon = true,
  ...props
}) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const pair = record instanceof WrappedPair ? record : record.rootPair;
  const isAbnormalInstrument = !pair?.rootInstrument?.isNormalInstrument || false;
  useEffect(() => {
    ref.current?.parentNode?.parentNode?.parentNode?.addEventListener('mouseover', () => {
      setOpen(true);
    });
    ref.current?.parentNode?.parentNode?.parentNode?.addEventListener('mouseleave', () => {
      setOpen(false);
    });
  }, [ref.current?.parentNode?.parentNode?.parentNode]);
  return (
    <TokenPair
      isShowLogo={isShowLogo}
      baseToken={record.rootInstrument.baseToken}
      quoteToken={record.rootInstrument.quoteToken}
      instrumentAddr={record.rootInstrument.instrumentAddr}
      marketType={record.rootInstrument.market.info.type as MarketType}
      isInverse={record.rootInstrument?.isInverse}
      isShowExpiryTag={true}
      expiry={record instanceof WrappedPair ? record.expiry : record.rootPair.expiry}
      tokenSize={24}
      extra={
        isShowPairSettleIcon ? (
          !pair?.isNormalPair ? (
            <div ref={ref} className="pair-settle-icon">
              <Tooltip
                open={open}
                title={t(
                  isAbnormalInstrument ? 'tooltip.portfolio.position.emergency' : 'tooltip.portfolio.position.settle',
                )}>
                <div>{isAbnormalInstrument ? <>🚧 </> : <>💰</>}</div>
              </Tooltip>
            </div>
          ) : undefined
        ) : undefined
      }
      {...props}
    />
  );
};

export default TokenPairWitheToolTip;
