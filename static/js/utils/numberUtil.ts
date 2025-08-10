import BN from 'bignumber.js';
import { BigNumber, BigNumberish, utils } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import _ from 'lodash';

import { DEFAULT_DECIMAL_PLACES, ZERO } from '@/constants';
import { SIGNIFICANT_DIGITS } from '@/constants/global';
import { decimalShortFormSymbolMap, minExclusiveNumToShowShortDecimal } from '@/constants/number';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { wdiv } from '@synfutures/sdks-perp';

/**
 * Get the number of zeros behind the decimal point to the right of the first non-zero digit.
 *
 * @param {BigNumberish | BN} num - The input number for which to calculate the number of trailing zeros.
 * @returns {number} The number of zeros behind the decimal point to the right of the first non-zero digit.
 */
export function countNumTrailingZeros(num: BigNumberish | BN): number {
  const numBN = toBN(num);
  const numStr = numBN.toString(10);
  const decimalPart = numStr.split('.')[1];
  if (decimalPart) {
    let countZeros = 0;
    for (let i = 0; i < decimalPart.length; i++) {
      if (decimalPart[i] === '0') {
        countZeros++;
      } else {
        break;
      }
    }
    return countZeros;
  } else {
    return 0;
  }
}

/**
 * Get the short form of a decimal number with trailing zeros replaced by subscript symbols.
 *
 * @param {BN} numBN - The input BigNumber (BN) for which to create the short form of the decimal number.
 * @returns {string} The short form of the decimal number with trailing zeros replaced by subscript symbols.
 */
export function getShortFormDeciamal(numBN: BigNumberish | BN, tailSignificantDigits = 4): string {
  const maxCountZeros = 20;
  const numStr = numBN.toString(10);
  const countZeros = countNumTrailingZeros(numBN);
  const [integerPart, decimalPart] = numStr.split('.');
  if (countZeros > maxCountZeros || countZeros === 0) {
    return numStr;
  }

  const tail = decimalPart.slice(countZeros, decimalPart.length).slice(0, tailSignificantDigits);
  const tailWithPaddingZero = `${tail}${'0'.repeat(tailSignificantDigits - tail.length)}`;
  return `${integerPart}.0${decimalShortFormSymbolMap[countZeros]}${tailWithPaddingZero}`;
}
// the util function to make a bignumber, should be used whenever making a big number is need.
export function toBN(value: BigNumberish | BN, unit: 'normal' | 'ether' = 'normal'): BN {
  let number = value;
  if (unit === 'ether' && BigNumber.isBigNumber(value)) {
    number = utils.formatEther(value);
  }
  if (typeof number === 'undefined') {
    number = 0;
  }
  return new BN(number.toString(10), 10);
}

// equivalent to math.floor
export function bNRDown(value: BigNumberish | BN): BN {
  return toBN(value).integerValue(BN.ROUND_FLOOR);
}

// converting a bigNumber to string, should be used whenever converting is needed
export function bNToS(value: BigNumberish | BN, radix = 10): string {
  const res = toBN(value);
  return res.isNaN() ? '' : res.toString(radix);
}

/**
 * to show currency number with comma
 */
const toCurrencyNumber = (x: number | string): string => {
  const parts = x.toString().split('.');
  if (parts.length > 0) {
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }
  return '';
};

const CURRENCY_UNITS: ('K' | 'M' | 'B' | 'T')[] = ['K', 'M', 'B', 'T'];
const CURRENCY_UNIT_NUM = 10 ** 3; // 1000

function getBigCurrencyNum(
  numBN: BN,
  unit: 'K' | 'M' | 'B' | 'T',
  roundingMode?: BN.RoundingMode,
  minDecimalPlaces = DEFAULT_DECIMAL_PLACES,
): { numBN: BN; numStr: string; minDecimalPlaces?: number } {
  if (!roundingMode) roundingMode = BN.ROUND_DOWN;
  const i = CURRENCY_UNITS.findIndex((u) => u === unit);
  let numStr = numBN.toString(10);
  numBN = numBN.div(CURRENCY_UNIT_NUM);
  // get the biggest unit
  if (numBN.gte(CURRENCY_UNIT_NUM) && unit !== 'T') {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return getBigCurrencyNum(numBN, CURRENCY_UNITS[i + 1], roundingMode, minDecimalPlaces);
  }
  if (unit === 'T' && numBN.gte(CURRENCY_UNIT_NUM)) {
    numBN = numBN.integerValue(roundingMode);
  } else if (minDecimalPlaces !== 0) {
    numBN = numBN.precision(minDecimalPlaces, roundingMode);
  }

  numStr = `${
    minDecimalPlaces === 0 ? numBN.toFixed(0, roundingMode) : numBN.toPrecision(minDecimalPlaces, roundingMode)
  }${CURRENCY_UNITS[i]}`;

  return {
    numBN,
    numStr,
  };
}

/**
 * Format the given number for display with various options.
 *
 * @param {Object} options - The formatting options.
 * @param {BigNumberish | BN} options.num - The input number to be formatted.
 * @param {boolean} [options.isShowSeparator=true] - Whether to show separators in the formatted number.
 * @param {'price' | 'normal'} [options.type='normal'] - The type of formatting to apply.
 * @param {boolean} [options.isOperateNum=false] - Whether to the number is input which operate by user
 * @param {boolean} [options.isShowTBMK=false] - Whether to show TBMK unit for numbers greater than or equal to 10000.
 * @param {boolean} [options.showPositive] - Whether to show a positive sign for positive numbers.
 * @param {BN.RoundingMode} [options.roundingMode=BN.ROUND_DOWN] - The rounding mode to be used for formatting.
 * @param {number} [options.significantDigits=SIGNIFICANT_DIGITS] - The number of significant digits to display in the formatted number.
 * @param {number} [options.minDecimalPlaces=DEFAULT_DECIMAL_PLACES] - The minimum number of decimal places to display in the formatted number.
 * @param {boolean} [options.isShortFormDecimal=false] - Whether to use short form decimal notation.
 * @returns {string} The formatted number as a string.
 */
export function formatDisplayNumber({
  num,
  isShowSeparator = true,
  type = 'normal',
  isOperateNum = false,
  isShowTBMK = false,
  isShowApproximatelyEqualTo = true,
  showPositive,
  roundingMode = BN.ROUND_DOWN,
  significantDigits = SIGNIFICANT_DIGITS,
  minDecimalPlaces = DEFAULT_DECIMAL_PLACES,
  showTrailingZeros = true,
}: {
  num: BigNumberish | BN;
  isShowSeparator?: boolean;
  type?: 'price' | 'normal';
  isOperateNum?: boolean;
  isShowTBMK?: boolean;
  showPositive?: boolean;
  isShowApproximatelyEqualTo?: boolean;
  roundingMode?: BN.RoundingMode;
  significantDigits?: number;
  minDecimalPlaces?: number;
  showTrailingZeros?: boolean;
}): string {
  let numBN = toBN(num);
  if (numBN.isNaN() || numBN.eq(Infinity)) {
    numBN = toBN(0);
  }
  let sign = '';
  if (numBN.isNegative()) {
    sign = '-';
    numBN = numBN.abs();
  } else if (showPositive && numBN.gt(0)) {
    sign = '+';
  }
  let numStr = numBN.toString(10);

  if (isOperateNum) {
    if (numBN.gte(1)) {
      numStr = numBN.toFixed(minDecimalPlaces, roundingMode);
    } else {
      numStr = numBN.toPrecision(minDecimalPlaces, roundingMode);
    }
  } else {
    // >=1000 use TBMK unit
    if (numBN.eq(0)) {
      numStr = numBN.toFixed(2, roundingMode);
    } else if (numBN.gte(10000)) {
      const numRes = numBN.integerValue(roundingMode);
      numStr = numRes.toString();
      if (isShowTBMK) {
        const numRes = getBigCurrencyNum(numBN, 'K', roundingMode, minDecimalPlaces);
        numStr = numRes.numStr;
      }
    } else if (numBN.gte(1000) && numBN.lt(10000)) {
      if (type === 'price') {
        numBN = numBN.precision(significantDigits, roundingMode);
        numStr = numBN.toPrecision(significantDigits, roundingMode);
      } else {
        const numRes = numBN.precision(significantDigits, roundingMode);
        numStr = numRes.toPrecision(significantDigits, roundingMode);
        if (isShowTBMK) {
          const numRes = getBigCurrencyNum(numBN, 'K', roundingMode, minDecimalPlaces);
          numStr = numRes.numStr;
        }
      }
    } else if (numBN.gte(1) && numBN.lt(1000)) {
      numBN = numBN.precision(significantDigits, roundingMode);
      if (minDecimalPlaces === 0) {
        numStr = numBN.toFixed(0, roundingMode);
      } else {
        numStr = numBN.toPrecision(significantDigits, roundingMode);
      }
    } else if (numBN.gte(0.0001) && numBN.lt(1)) {
      if (type === 'price') {
        if (showTrailingZeros && numBN.lt(BN(minExclusiveNumToShowShortDecimal)) && numBN.gt(BN(0))) {
          numBN = numBN.precision(significantDigits, roundingMode);
          numStr = getShortFormDeciamal(numBN);
        } else {
          numBN = numBN.precision(significantDigits, roundingMode);
          numStr = numBN.toPrecision(significantDigits, roundingMode);
        }
      } else {
        numStr = numBN.toFixed(minDecimalPlaces, roundingMode);
      }
    } else {
      if (type === 'price') {
        numBN = numBN.precision(significantDigits - 1, roundingMode);
        const decimalPlaces = numBN.decimalPlaces() || 0;
        if (showTrailingZeros && numBN.lt(BN(minExclusiveNumToShowShortDecimal)) && numBN.gt(BN(0))) {
          numStr = getShortFormDeciamal(numBN);
        } else {
          if (decimalPlaces > 8) {
            numStr = numBN.toFixed(8, roundingMode);
          } else {
            numStr = numBN.toPrecision(4, roundingMode);
          }
        }
      } else {
        // show `<0.0001` when 0< num < 0.0001
        numStr = numBN.toFixed(minDecimalPlaces, roundingMode);
        return `${isShowApproximatelyEqualTo ? '≈' : ''}${numStr}`;
      }
    }
  }

  if (isShowSeparator) {
    numStr = toCurrencyNumber(numStr);
  }

  return `${sign}${numStr}`;
}

// remove zero after point
export function removeTrailingZeros(value: string | number): string {
  value = value.toString();
  if (value.match(/\./)) {
    value = value.replace(/\.?0+$/, '');
  }
  return value;
}

/**
 * number in thousands
 */
const numberWithCommas = (x: number | string): string => {
  const parts = x.toString().split('.');
  if (parts.length > 0) {
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }
  return '';
};

/**
 * format number, keep 4 decimals by default
 * (optional) comma to separate in thousands
 * @export
 * @param {(number | string)} numBN
 * @param {number} [decimals=DEFAULT_DECIMAL_PLACES]
 * @param {boolean} [isShowSeparator=true]
 * @param {number} [roundingMode=BigNumber.ROUND_DOWN]
 * @param {boolean} [isRemoveTrailingZeros=false]
 * @returns
 */
export function formatNumber(
  num: BigNumberish | BN,
  decimals: number = DEFAULT_DECIMAL_PLACES,
  isShowSeparator = true,
  roundingMode: BN.RoundingMode = BN.ROUND_DOWN,
  isRemoveTrailingZeros = false,
): string {
  let numBN = toBN(num);
  if (
    // num === 'NaN' ||
    // num === undefined ||
    // num.toString().trim() === '' ||
    // Math.abs(Number(num)) === Infinity ||
    // Number.isNaN(Number(num))
    numBN.isNaN() ||
    numBN.eq(Infinity)
  ) {
    numBN = toBN(0);
  }

  let res = numBN.toFixed(decimals, roundingMode);

  if (isShowSeparator) {
    res = numberWithCommas(res);
  }
  if (isRemoveTrailingZeros) {
    res = removeTrailingZeros(res);
  }

  return res;
}

/**
 * make sure the number in range, otherwise convert it
 * make sure input legal num
 * number should between 1e6 and 1e-6 [1e-6, 1e6)
 * @export
 * @param {(number | string)} num the number user input
 * @param {number} [decimals=6]
 * @param {number} [biggestNumber=1e6 - 1e-4]
 * @returns return number with String type
 */
export function inputNumChecker(
  num: number | string,
  decimals = 4,
  allowMinus = false,
  // integerMaxLength = 6
): string {
  num = num.toString();
  // Allow user input 00000
  if (Number(num) === 0) {
    return num;
  }
  // replace illegal digital
  const regex = allowMinus ? /[^0-9.-]/g : /[^0-9.]/g;
  num = num.replace(regex, '');
  const parts = num.split('.');
  // user paste the number contains more then two dot[.]
  if (parts.length >= 3) {
    return '';
  }
  let integerPart = parts[0];
  // remove leading zero except 1 zero
  if (integerPart.length > 0) {
    while (integerPart.length > 1 && integerPart[0] === '0') {
      integerPart = integerPart?.substring(1);
    }
  } else if (num.indexOf('.') === 0) {
    integerPart = '0';
  }
  // // max integer length <=7
  // if (integerPart.length > integerMaxLength) {
  //   return (integerPart = integerPart.substring(0, integerMaxLength));
  // }

  let decimalPart = parts[1] || '';
  // only 8 decimal places
  if (decimalPart && decimalPart.length > decimals) {
    decimalPart = decimalPart?.substring(0, decimals);
  }

  if (decimalPart && decimalPart.length !== 0) {
    num = `${integerPart}.${decimalPart}`;
  } else {
    // get parse num except single [.]
    num = integerPart + (parts.length === 2 && decimals !== 0 ? '.' : '');
  }
  return num;
}

/**
 * to Reciprocal Number: 1/x
 * @param bn
 * @returns
 */
function toEtherReciprocalNumber(bn: BigNumber): BigNumber {
  if (bn.eq(0)) {
    return bn;
  }
  return wdiv(toWad(1), bn);
}

export function formatEther(num: BigNumber | undefined, isInverse = false): string {
  let bn = num || ZERO;
  if (isInverse && !bn.eq(ZERO)) {
    bn = toEtherReciprocalNumber(bn);
  }
  return utils.formatEther(bn);
}

/**
 * bigNumber type sort for ant table
 *
 * @export
 * @param {BigNumber} a
 * @param {BigNumber} b
 * @returns {(0 | 1 | -1)}
 */
export function bigNumberSort(a: undefined | WrappedBigNumber, b: undefined | WrappedBigNumber): 0 | 1 | -1 {
  if (!a || !b || a.eq(b)) return 0;
  return a.gt(b) ? 1 : -1;
}

export function getExponentialScale(val: number): number {
  const expoentialRaw = Math.log10(val);
  return Math.floor(expoentialRaw);
}

/**
 *  get an array of evenly spread numbers between to
 *  @param count
 *  @param start
 *  @param end
 * */

export function getEvenArray(count: number, start: number, end: number, rounding = false): number[] {
  const result = [];
  const interval = rounding ? Math.floor((end - start) / count) : (end - start) / count;
  for (let i = 0; i < count; i++) {
    result.push(start + i * interval);
  }
  result.push(end);
  return result;
}

/**
 *
 * @export
 * @param {number} min
 * @param {number} max
 * @param {boolean} rounding
 * @returns {number[]}
 */
export function adjustMinMax(min: number, max: number, tickCount = 5): number[] {
  const minExponentialScale = getExponentialScale(min);
  const maxExponentialScale = getExponentialScale(max);
  let minPoint = min;
  // the max is two scales above the min
  if (maxExponentialScale > minExponentialScale + 1) {
    minPoint = 0;
  }
  let maxPoint = max;
  const diff = max - minPoint;
  const tickGap = roundByOneScale(diff / tickCount);
  // maxPoint = minPoint + tickCount * tickGap;
  if (tickCount > 10 && tickCount % 2 !== 0) {
    maxPoint = maxPoint + tickGap;
  }
  return [minPoint, maxPoint];
}

/**
 * roundUp to closest log number for use in coinprice chart
 * e.g 3456 to 3500
 * @export
 * @param {number} val
 * @param {boolean} up
 * @returns {number}
 */
export function roundByOneScale(value: number, up = true): number {
  const exponentialScale = getExponentialScale(value);
  const mainNumbers = value / 10 ** getExponentialScale(value);
  const newMainNumbers = Math.floor(mainNumbers * 10);
  return (newMainNumbers + (up ? 1 : 0)) * 10 ** (exponentialScale - 1);
}
export function upRoundingByOneScale(value: number): number {
  const exponentialScale = getExponentialScale(value);
  if (exponentialScale !== 0) {
    const mainNumbers = Math.floor(value / 10 ** getExponentialScale(value)) + 1;
    return (mainNumbers < 5 ? 5 : 10) * 10 ** exponentialScale;
  }
  return 10;
}

export function batchTranformBigNumberToWrap<T, Tr>(value: T): Record<keyof Tr, WrappedBigNumber> {
  const keys = _.keys(value);
  return _.reduce(
    keys,
    (acc, cur) => {
      _.set(acc, [cur], WrappedBigNumber.from(_.get(value, [cur])));
      return acc;
    },
    {} as Record<keyof Tr, WrappedBigNumber>,
  );
}

/**
 * to wad, support float
 * @param wad
 * @returns
 */
export function toWad(num: BigNumberish, decimals = 0): BigNumber {
  return parseUnits(num.toString()).div(10 ** decimals);
}
/**
 * get tick points for use  in coinprice chart
 * @export
 * @param {number} min
 * @param {number} max
 * @param {boolean} rounding
 * @returns {number[]}
 */
export function getTickPoints(min: number, max: number, tickGap?: number): number[] {
  const minExponentialScale = getExponentialScale(min);
  const maxExponentialScale = getExponentialScale(max);
  tickGap = tickGap || 10 ** (maxExponentialScale - 1);

  const diff = max - min;
  const tickNumber = Math.ceil(diff / tickGap);
  if (tickNumber >= 10) {
    if (tickNumber % 2 === 0) {
      return getTickPoints(min, max, tickGap * 2);
    } else {
      return getTickPoints(min, max + tickGap, tickGap * 2);
    }
  }
  if (tickNumber < 5) {
    return getTickPoints(min, max, 10 ** (minExponentialScale - 1));
  }
  return getEvenArray(tickNumber, min, max, false);
}

export function formatPercentageString({
  percentage,
  hundredfold = true,
  decimals = 2,
  roundingMode = BN.ROUND_DOWN,
}: {
  percentage: number | string;
  hundredfold?: boolean;
  decimals?: number;
  roundingMode?: BN.RoundingMode;
}): string {
  const percentageNumber = WrappedBigNumber.from(percentage).mul(hundredfold ? 100 : 1);
  return `${formatNumber(percentageNumber, decimals, false, roundingMode)}%`;
}
export function reduceArrayByStep<T>(array: T[], step: number): T[] {
  const reducedArray: T[] = [];
  for (let i = 0; i < array.length; i += step) {
    reducedArray.push(array[i]);
  }
  const result = _.isEqual(_.last(reducedArray), _.last(array)) ? reducedArray : [...reducedArray, _.last(array) as T];
  return result;
}
