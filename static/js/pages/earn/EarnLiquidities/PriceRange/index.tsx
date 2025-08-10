/**
 * @description Component-PriceRange
 */
import './index.less';

import { FC, useMemo, useState } from 'react';

import { useMediaQueryDevice } from '@/components/MediaQuery';
import { Tooltip } from '@/components/ToolTip';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { usePairRangesMaxMin } from '@/features/earn/hook';
import { useChainId, useUserAddr } from '@/hooks/web3/useChain';
import { getLeftRatio, getRightRatio } from '@/utils/pair';
import classNames from 'classnames';
interface IPropTypes {
  className?: string;
  minPrice: WrappedBigNumber;
  maxPrice: WrappedBigNumber;
  fairPrice: WrappedBigNumber;
  isInverse: boolean;
  pairId: string;
}
const PriceRange: FC<IPropTypes> = function ({ fairPrice, minPrice, maxPrice, pairId }) {
  const chainId = useChainId();
  const userAddr = useUserAddr();
  const { deviceType } = useMediaQueryDevice();
  const maxRatio = usePairRangesMaxMin(chainId, userAddr, pairId, fairPrice.toNumber());
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const leftRatio = useMemo(() => getLeftRatio(minPrice.toNumber(), fairPrice.toNumber()), [minPrice.stringValue]);
  const rightRatio = useMemo(() => getRightRatio(maxPrice.toNumber(), fairPrice.toNumber()), [maxPrice.stringValue]);

  const barLeft = useMemo(() => {
    const left = 50 - 50 * (leftRatio / maxRatio);
    return left > 47.5 ? 47.5 : left;
  }, [leftRatio, maxRatio]);
  const barRight = useMemo(() => {
    const right = 50 + 50 * (rightRatio / maxRatio);
    return right < 52.5 ? 52.5 : right;
  }, [rightRatio, maxRatio]);
  const width = useMemo(() => {
    return barRight - barLeft;
  }, [barLeft, barRight]);
  return (
    <div className={classNames('syn-price-range', deviceType)}>
      <div className="syn-price-range-top">
        <div className="syn-price-range-item">{minPrice.formatPriceNumberWithTooltip()}</div>
        <div className="syn-price-range-item">{fairPrice.formatPriceNumberWithTooltip()}</div>
        {/* <div className="syn-price-range-top-line"></div> */}
        <div className="syn-price-range-item">{maxPrice.formatPriceNumberWithTooltip()}</div>
      </div>
      <div className="syn-price-range-bar-container">
        <div className="syn-price-range-bar-container-inner">
          <div
            className="syn-price-range-bar"
            onMouseOver={() => setTooltipOpen(true)}
            onMouseLeave={() => setTooltipOpen(false)}
            style={{ left: `${barLeft}%`, width: `${width}%` }}></div>
          <Tooltip open={tooltipOpen} title={fairPrice.formatPriceNumberWithTooltip()}>
            <div className="syn-price-range-indicator" style={{ left: `50%` }}></div>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default PriceRange;
