import { DEFAULT_THEME, THEME_ENUM } from '@/constants';
import { LOCAL_THEME } from '@/constants/storage';
import { WrappedBigNumber } from '@/entities/WrappedBigNumber';
import { WrappedQuote } from '@/entities/WrappedQuote';
import { BigNumber } from 'ethers';
import _ from 'lodash';

/**
 * polling func
 * @param {Function} func
 * @param {Number} interval
 */
export const pollingFunc = (func: () => void, interval = 3000, immediately = true): NodeJS.Timeout => {
  if (immediately) {
    func();
  }
  return setInterval(() => {
    func();
  }, interval);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export function bigNumberObjectCheck(obj: any): any {
  const cloneObj = _.clone(obj);
  if (cloneObj) {
    if (cloneObj) {
      try {
        Object.keys(cloneObj).forEach((key) => {
          const val = cloneObj[key];
          //reset bignumber if number is not correct class
          if (val?.bn && val?.value) {
            cloneObj[key] = BigNumber.from(val.value);
          } else if (val?._hex && BigNumber.isBigNumber(val) && !(val instanceof BigNumber)) {
            cloneObj[key] = BigNumber.from(val);
          } else if (val?.hex && val?.type === 'BigNumber') {
            cloneObj[key] = BigNumber.from(val);
          } else if (typeof val === 'object' && val && Object.keys(val).length > 0) {
            if (val instanceof WrappedBigNumber || val instanceof WrappedQuote) {
              cloneObj[key] = val;
            } else {
              const newVal = bigNumberObjectCheck(val);
              cloneObj[key] = newVal;
            }
          }
        });
      } catch (error) {
        console.error(error);
      }
    }
  }
  return cloneObj;
}

export function getDefaultTheme(): THEME_ENUM {
  const localTheme = localStorage.getItem(LOCAL_THEME);
  if (localTheme) {
    return localTheme as THEME_ENUM;
  }
  return DEFAULT_THEME;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounceRequest<T extends (...args: any[]) => Promise<any>>(
  func: T,
  wait = 300,
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    return new Promise((resolve, reject) => {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => {
        func(...args)
          .then(resolve)
          .catch(reject);
      }, wait);
    });
  };
}
