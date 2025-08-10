import './index.less';

import { AbstractTooltipProps } from 'antd/lib/tooltip';
import BN from 'bignumber.js';
import classNames from 'classnames';
import { BigNumber, BigNumberish } from 'ethers';
import React, { FC, ReactNode, useCallback, useMemo } from 'react';
import CountUp, { CountUpProps } from 'react-countup';

import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { bNToS, formatDisplayNumber, formatEther, formatNumber, toBN, toWad } from '@/utils/numberUtil';

import { Tooltip } from '../ToolTip';
interface IFormatNumberTooltipWrapProps {
  num: BigNumberish | BN;
  formattedNumStr?: string | undefined;
  colorShader?: boolean;
  isBold?: boolean;
  isShowTBMK?: boolean;
  toolTipProps?: AbstractTooltipProps;
  showToolTip?: boolean;
  prefix?: string;
  suffix?: string;
  colorSuffix?: boolean;
  isShowApproximatelyEqualTo?: boolean;
  showZeroIfNegative?: boolean;
  countUpProps?: Omit<CountUpProps, 'end'>;
  showPositive?: boolean;
  minDecimalPlaces?: number;
  isUseMockNumber?: boolean;
  isShowSuffixInTooltip?: boolean;
}

type DisplayStrWithCountUpTypes = {
  num: BN;
  iProps?: Omit<CountUpProps, 'end'>;
  formattedNumStr?: string;
  isShowTBMK?: boolean;
};
/**
 * TODO: temp for start
 * @param num
 * @returns
 */
export function negativeNumberColor(num: BN): string {
  return toBN(num).gte(0) ? '#14B84B' : '#FF6666';
}

const DisplayStrWithCountUp: FC<DisplayStrWithCountUpTypes> = ({ num, iProps }) => {
  // get number decimals;

  const defaultProps = {
    duration: 1,
    useEasing: true,
    useGrouping: true,
    preserveValue: true,
    ...iProps,
    decimals: 9,
  } as CountUpProps;
  const formattingFn = useCallback((value: number | null) => {
    const formatNum = formatDisplayNumber({ num: value || 0, type: 'price' });
    return formatNum;
  }, []);

  return (
    <CountUp
      // redraw
      {...defaultProps}
      formattingFn={formattingFn}
      end={num?.toNumber()}
    />
  );
};
const formatNumberTooltipWrap: FC<IFormatNumberTooltipWrapProps> = function ({
  num,
  formattedNumStr,
  colorShader = false,
  isBold = false,
  isShowTBMK = false,
  toolTipProps,
  prefix,
  suffix,
  showToolTip = true,
  countUpProps,
  showPositive,
  colorSuffix = false,
  isShowApproximatelyEqualTo,
  minDecimalPlaces,
  showZeroIfNegative,
  isUseMockNumber = false,
  isShowSuffixInTooltip = false,
}) {
  let numRes = toBN(isUseMockNumber ? '1234567899876' : num || '');
  if (numRes.lt(0) && showZeroIfNegative) {
    numRes = toBN(0);
  }
  function displayStrWithCountUp(num: BN, disPlayStr: string) {
    return countUpProps && !num.isNaN() && !num.isZero() ? (
      <DisplayStrWithCountUp
        iProps={countUpProps}
        num={num}
        formattedNumStr={formattedNumStr}
        isShowTBMK={isShowTBMK}
      />
    ) : (
      disPlayStr
    );
  }

  const suffixDom = suffix && <span className="number-suffix">{suffix}</span>;

  function showColorNumber(colorShader: boolean, num: BN, disPlayStr: string, isBold = false): JSX.Element {
    if (isBold) {
      return colorShader && !num.eq(0) ? (
        <span>
          <b className="font-number" style={{ color: negativeNumberColor(num) }}>
            {prefix}
            {displayStrWithCountUp(num, disPlayStr)}
          </b>
          {suffixDom}
        </span>
      ) : (
        <span>
          <b className="font-number">
            {prefix}
            {displayStrWithCountUp(num, disPlayStr)}
          </b>
          {suffixDom}
        </span>
      );
    }
    return colorShader && !num.eq(0) ? (
      <span>
        <span className="font-number" style={{ color: negativeNumberColor(num) }}>
          {prefix}
          {displayStrWithCountUp(num, disPlayStr)}
          {colorSuffix && suffixDom}
        </span>
        {!colorSuffix && suffixDom}
      </span>
    ) : (
      <span>
        <span className="font-number">
          {prefix}
          {displayStrWithCountUp(num, disPlayStr)}
        </span>
        {suffixDom}
      </span>
    );
  }

  let displayNumStr = numRes.eq(0) ? '0.00' : numRes.toString();
  if (formattedNumStr) {
    displayNumStr = formattedNumStr;
  } else {
    displayNumStr = formatDisplayNumber({
      num: numRes,
      showPositive,
      isShowTBMK,
      isShowApproximatelyEqualTo,
      minDecimalPlaces,
    });
  }

  if (prefix === '$') {
    if (displayNumStr.startsWith('-')) {
      prefix = '-$';
      displayNumStr = displayNumStr.slice(1);
    }
    if (displayNumStr.startsWith('+')) {
      prefix = '+$';
      displayNumStr = displayNumStr.slice(1);
    }
    if (displayNumStr.startsWith('＜')) {
      prefix = '＜$';
      displayNumStr = displayNumStr.slice(1);
    }
  }

  return showToolTip && !numRes.eq(0) ? (
    <Tooltip {...toolTipProps} title={`${bNToS(numRes)}${isShowSuffixInTooltip ? ` ${suffix}` : ''}`}>
      {showColorNumber(colorShader, numRes, displayNumStr, isBold)}
    </Tooltip>
  ) : (
    showColorNumber(colorShader, numRes, displayNumStr, isBold)
  );
};

/**
 * formatNumberWithTooltip
 * @param num orgin number
 * @param showTooltip Whether tooltip is displayed
 * @param colorShader Whether to color negative numbers,
 * @returns
 */
export type FormatNumberWithTooltipType = Omit<IFormatNumberTooltipWrapProps, 'formattedNumStr'>;
export const formatNumberWithTooltip = ({
  num,
  colorShader = false,
  isBold = false,
  isShowTBMK = false,
  toolTipProps,
  prefix,
  suffix,
  showPositive,
  colorSuffix,
  countUpProps,
  isShowApproximatelyEqualTo,
  showZeroIfNegative,
  showToolTip,
  minDecimalPlaces,
  isUseMockNumber,
  isShowSuffixInTooltip,
}: FormatNumberWithTooltipType): React.ReactNode => {
  return formatNumberTooltipWrap({
    num,
    colorShader,
    isBold,
    toolTipProps,
    isShowTBMK,
    prefix,
    suffix,
    colorSuffix,
    countUpProps,
    showPositive,
    isShowApproximatelyEqualTo,
    showToolTip,
    minDecimalPlaces,
    showZeroIfNegative,
    isUseMockNumber,
    isShowSuffixInTooltip,
  });
};

/**
 * format price num display
 * @param num price
 * @param decimals default decimals
 * @param colorShader is show diff color
 * @param keepMaxOriginalNumber is keep original number
 * @returns
 */
export const formatPriceNumberWithTooltip = ({
  num,
  colorShader = false,
  isOperateNum = false,
  isShowTBMK = false,
  prefix,
  isShowApproximatelyEqualTo,
  suffix,
  showPositive,
  significantDigits,
  roundingMode,
}: {
  num: BigNumberish | BN;
  colorShader?: boolean;
  isBold?: boolean;
  toolTipProps?: AbstractTooltipProps;
  isOperateNum?: boolean;
  isShowTBMK?: boolean;
  prefix?: string;
  isShowApproximatelyEqualTo?: boolean;
  suffix?: string;
  showPositive?: boolean;
  significantDigits?: number;
  roundingMode?: BN.RoundingMode;
}): React.ReactNode => {
  const formattedNumStr = formatDisplayNumber({
    num,
    type: 'price',
    isOperateNum,
    isShowApproximatelyEqualTo,
    showPositive,
    significantDigits,
    roundingMode,
  });
  return formatNumberTooltipWrap({
    num,
    formattedNumStr,
    colorShader,
    isShowTBMK,
    prefix,
    suffix,
  });
};

/**
 * format liquidation price num display
 * if price >= 1e6 display as 0
 * @param num price
 * @param decimals default decimals
 * @param colorShader is show diff color
 * @param keepMaxOriginalNumber is keep original number
 * @returns
 */
export const formatLiqPriceNumberWithTooltip = ({
  num,
  colorShader = false,
  suffix,
  ...options
}: FormatNumberWithTooltipType): React.ReactNode => {
  const price = toBN(num);
  let formattedNumStr = '';
  if (!price.eq(0)) {
    if (price.abs().gte(1e6)) {
      num = Infinity;
    } else if (price.lt(0)) {
      num = 0;
    }
    formattedNumStr = formatDisplayNumber({ num, type: 'price' });
  }
  return formatNumberTooltipWrap({ num, formattedNumStr, colorShader, suffix, ...options });
};

export const useFormatLiqPriceNumberWithTooltip = ({
  num,
  colorShader = false,
}: {
  num: BigNumberish;
  colorShader?: boolean;
}): React.ReactNode => {
  return useMemo(() => {
    return formatLiqPriceNumberWithTooltip({ num, colorShader });
  }, [colorShader, num]);
};

export const formatStringWithTooltip = ({
  str,
  title,
  isBold = false,
  toolTipProps,
}: {
  str: string;
  title: string;
  isBold?: boolean;
  toolTipProps?: AbstractTooltipProps;
}): React.ReactNode => {
  return (
    <Tooltip {...toolTipProps} title={title}>
      {isBold ? <b className="font-number">{str}</b> : <span className="font-number">{str}</span>}
    </Tooltip>
  );
};

export function formatLeverageWithTooltip(leverage: BigNumber | undefined): ReactNode {
  const leverageFormatted = formatEther(leverage);
  if (leverage?.lt(0)) return <>-</>;
  return <>{leverage?.eq(0) ? 0 : leverage?.lt(toWad(0.1)) ? <>&#60; 0.1</> : formatNumber(leverageFormatted, 1)}x</>;
  // return (
  //   <Tooltip title={leverageFormated}>
  //     {leverage?.eq(0) ? 0 : leverage?.lt(toWad(0.1)) ? <>&#60; 0.1</> : formatNumber(leverageFormated, 2)}x
  //   </Tooltip>
  // );
}

export function formatPercentage({
  percentage,
  hundredfold = true,
  colorShader = true,
  customTitle,
  decimals = 2,
  withThreshHold,
  prefix = '',
  suffix = '',
  isColorShaderWhiteIfZero = false,
  isHiddenIfZero = false,
  requirePlusSymbol = false,
  className,
}: {
  percentage: number | string;
  hundredfold?: boolean;
  colorShader?: boolean;
  customTitle?: ReactNode;
  decimals?: number;
  withThreshHold?: boolean;
  prefix?: string;
  suffix?: string;
  isColorShaderWhiteIfZero?: boolean;
  isHiddenIfZero?: boolean;
  requirePlusSymbol?: boolean;
  className?: string;
}): ReactNode {
  const percentageNumber = WrappedBigNumber.from(percentage).mul(hundredfold ? 100 : 1);
  let displayString = formatNumber(percentageNumber, decimals);

  if (withThreshHold) {
    const percentageBN = WrappedBigNumber.from(percentageNumber);
    const threshold = WrappedBigNumber.from(1 / 10 ** decimals);
    if (percentageBN.notEq(0) && percentageBN.abs().lt(threshold)) {
      displayString = '<' + (percentageNumber.gt(0) ? '' : '-') + threshold.stringValue;
    }
  }
  let colorShaderClassname = colorShader ? (percentageNumber.lt(0) ? 'text-danger' : 'text-success') : '';
  if (isColorShaderWhiteIfZero && percentageNumber.eq(0)) {
    colorShaderClassname = '';
  }
  if (percentageNumber.eq(0) && isHiddenIfZero) {
    return null;
  }
  let plusMinusSymbol = '';
  if (requirePlusSymbol) {
    if (percentageNumber.gt(0)) {
      plusMinusSymbol = '+';
    }
  }
  return (
    <Tooltip title={customTitle ? customTitle : undefined}>
      <span
        className={classNames(
          'font-number',
          className,
          colorShaderClassname,
        )}>{`${plusMinusSymbol}${prefix}${displayString}%${suffix}`}</span>
    </Tooltip>
  );
}
