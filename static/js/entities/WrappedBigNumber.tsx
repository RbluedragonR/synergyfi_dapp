import BN from 'bignumber.js';
import { BigNumber } from 'ethers';
import { has as _has } from 'lodash';
import { ReactNode } from 'react';

import {
  formatLiqPriceNumberWithTooltip,
  formatNumberWithTooltip,
  FormatNumberWithTooltipType,
  formatPercentage,
  formatPriceNumberWithTooltip,
} from '@/components/NumberFormat';
import { DEFAULT_DECIMAL_PLACES } from '@/constants';
import { SIGNIFICANT_DIGITS } from '@/constants/global';
import {
  formatDisplayNumber,
  formatEther,
  formatNumber,
  formatPercentageString,
  inputNumChecker,
  toWad,
} from '@/utils/numberUtil';

// BN decimal config
BN.config({ DECIMAL_PLACES: 18 });

export type WrappedBigNumberLike = WrappedBigNumber | BigNumber | string | number | BN;

/**
 * BigNumber Wrapper
 * include ethers.BigNumber and BN with decimal places
 * and a lot of format func
 */
export class WrappedBigNumber extends BN {
  constructor(value: BigNumber | number | string | BN) {
    if (value instanceof BN) {
      super(value);
    } else if (value instanceof BigNumber) {
      super(formatEther(value));
    } else if (_has(value, '_hex')) {
      super(formatEther(BigNumber.from(value)));
    } else {
      super(value?.toString() || '');
    }
  }

  /**
   * zero of wrapped type
   */
  static get ZERO(): WrappedBigNumber {
    return new WrappedBigNumber(0);
  }

  static get ONE(): WrappedBigNumber {
    return new WrappedBigNumber(1);
  }

  static from(value: WrappedBigNumberLike): WrappedBigNumber {
    if (value instanceof WrappedBigNumber) {
      return value;
    }
    return new WrappedBigNumber(value);
  }

  get wadValue(): BigNumber {
    return toWad(this.toString());
  }

  get displayValue(): string {
    return formatDisplayNumber({ num: this });
  }
  get stringValue(): string {
    return this.toString();
  }
  get sqrtVal(): WrappedBigNumber {
    return WrappedBigNumber.from(this.sqrt());
  }

  get reciprocal(): WrappedBigNumber {
    return WrappedBigNumber.from(1).div(this);
  }

  decimalValue(decimal: number): WrappedBigNumber {
    return WrappedBigNumber.from(inputNumChecker(this.stringValue, decimal));
  }

  // TODO: add plus/minus/times/div wrapper
  abs(): WrappedBigNumber {
    return WrappedBigNumber.from(super.abs());
  }

  add(n: WrappedBigNumberLike): WrappedBigNumber {
    return WrappedBigNumber.from(super.plus(WrappedBigNumber.from(n)));
  }

  min(n: WrappedBigNumberLike): WrappedBigNumber {
    return WrappedBigNumber.from(super.minus(WrappedBigNumber.from(n)));
  }

  mul(n: WrappedBigNumberLike): WrappedBigNumber {
    return WrappedBigNumber.from(super.multipliedBy(WrappedBigNumber.from(n)));
  }
  divBy(n: WrappedBigNumberLike): WrappedBigNumber {
    return WrappedBigNumber.from(super.dividedBy(WrappedBigNumber.from(n)));
  }

  div(n: BN.Value): WrappedBigNumber {
    return WrappedBigNumber.from(super.div(n));
  }

  gte(n: BN.Value): boolean {
    return super.isGreaterThanOrEqualTo(n);
  }

  /**
   *
   * @returns 0 if this < 0
   */
  keepPositive(): WrappedBigNumber {
    return this.lt(0) ? WrappedBigNumber.from(0) : this;
  }

  notEq(n: BN.Value): boolean {
    return !this.eq(n);
  }

  formatWithToolTip(): ReactNode {
    return formatNumberWithTooltip({ num: this });
  }

  formatPriceNumberWithTooltip({
    isStablePair,
    roundingMode,
    ...options
  }: Omit<FormatNumberWithTooltipType, 'num'> & {
    isStablePair?: boolean;
    roundingMode?: BN.RoundingMode;
  } = {}): ReactNode {
    return formatPriceNumberWithTooltip({
      num: this,
      ...options,
      roundingMode,
      significantDigits: isStablePair ? SIGNIFICANT_DIGITS + 1 : SIGNIFICANT_DIGITS,
    });
  }

  formatPriceString({
    isStablePair,
    roundingMode,
    ...options
  }: Omit<FormatNumberWithTooltipType, 'num'> & {
    isStablePair?: boolean;
    roundingMode?: BN.RoundingMode;
  } = {}): string {
    return formatDisplayNumber({
      num: this,
      ...options,
      type: 'price',
      roundingMode,
      significantDigits: isStablePair ? SIGNIFICANT_DIGITS + 1 : SIGNIFICANT_DIGITS,
    });
  }

  formatLiqPriceNumberWithTooltip(options: Omit<FormatNumberWithTooltipType, 'num'> = {}): ReactNode {
    return formatLiqPriceNumberWithTooltip({ num: this, ...options });
  }

  formatLiqPriceString(options: Omit<FormatNumberWithTooltipType, 'num'> = {}): string {
    let num: WrappedBigNumber | undefined = undefined;
    let formattedNumStr = '';
    if (!this.eq(0)) {
      if (this.abs().gte(1e6)) {
        num = WrappedBigNumber.from(Infinity);
      } else if (this.lt(0)) {
        num = WrappedBigNumber.ZERO;
      }
      formattedNumStr = formatDisplayNumber({ ...options, num: num || this, type: 'price' });
    }
    return formattedNumStr;
  }

  formatLeverageString(): string {
    if (this.lt(0)) return '-';
    return `${this.eq(0) ? 0 : this.eq(0) ? 0 : this?.lt(0.1) ? <>&#60; 0.1</> : formatNumber(this, 1)}x`;
  }

  formatLeverageWithTooltip(): ReactNode {
    if (this.lt(0)) return <>-</>;
    return (
      <span className="font-number">
        {this.eq(0) ? 0 : this.eq(0) ? 0 : this?.lt(0.1) ? <>&#60; 0.1</> : formatNumber(this, 1)}x
      </span>
    );
  }

  formatNumberWithTooltip(options: Omit<FormatNumberWithTooltipType, 'num'> = {}): ReactNode {
    return formatNumberWithTooltip({
      num: this,
      ...options,
    });
  }
  formatDisplayNumber(
    options: {
      isShowSeparator?: boolean;
      type?: 'price' | 'normal';
      isOperateNum?: boolean;
      isShowTBMK?: boolean;
      roundingMode?: BN.RoundingMode;
      isShowApproximatelyEqualTo?: boolean;
      significantDigits?: number;
    } = {},
  ): string {
    return formatDisplayNumber({
      num: this,
      ...options,
    });
  }

  formatPercentage(options?: Omit<Parameters<typeof formatPercentage>[0], 'percentage'>): ReactNode {
    return formatPercentage({
      percentage: this.toString(10),
      ...options,
    });
  }

  formatPercentageString(hundredfold = true, decimals = 2, roundingMode: BN.RoundingMode = BN.ROUND_DOWN): string {
    return formatPercentageString({ percentage: this.toString(10), hundredfold, decimals, roundingMode });
  }

  formatNormalNumberString(
    decimals: number = DEFAULT_DECIMAL_PLACES,
    isShowSeparator = true,
    roundingMode: BN.RoundingMode = BN.ROUND_DOWN,
    isRemoveTrailingZeros = false,
  ): string {
    return formatNumber(this, decimals, isShowSeparator, roundingMode, isRemoveTrailingZeros);
  }

  toDisplayJSON(): {
    wadValue: BigNumber;
    numStr: string;
    displayValue: string;
    stringValue: string;
  } {
    return {
      wadValue: this.wadValue,
      numStr: this.toString(10),
      displayValue: this.displayValue,
      stringValue: this.stringValue,
    };
  }

  valueOf(): string {
    return JSON.stringify(this.toDisplayJSON());
  }

  toJSON(): string {
    return this.valueOf();
  }

  toString(base?: number | undefined): string {
    return super.toString(base || 10);
  }
}
